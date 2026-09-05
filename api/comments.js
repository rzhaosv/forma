// Anonymous comments for the Forma studio site (paths, Lounge wall, home).
//
// Modeled on api/identify.js: Firebase Admin is initialised from
// FIREBASE_SERVICE_ACCOUNT, requests are rate-limited by client IP through
// Firestore (failing open if the counter is unavailable), CORS is open and
// every response is JSON. No accounts: a comment is a name (optional), a
// text and a page key. Raw IPs are never stored; only a salted sha256.
//
// GET  /api/comments?page=/paths/founders/&limit=50&cursor=<ms>
//      -> { comments: [{id, page, name, text, parentId, likes, createdAt}], next }
//         newest-first, replies included (client nests by parentId)
// POST /api/comments  { page, name?, text, parentId?, honeypot? }
//      -> { comment: {...} }           (201)
// POST /api/comments  { action: "like", id }
//      -> { id, likes, liked }         (200)
//
// Env (Vercel): FIREBASE_SERVICE_ACCOUNT   (required for persistence)
//               COMMENTS_IP_SALT           (optional; salts the IP hash)
//
// Firestore: siteComments      { page, name, text, parentId, likes, likedBy[], createdAt, ipHash, hidden }
//            siteCommentRates  { count, window, kind }   (10-minute buckets per ip hash)
//
// The list query (page == X, hidden == false, order by createdAt desc) needs a
// composite index. Until it exists the handler falls back to an unordered
// fetch sorted in memory, and logs the index-creation link Firestore returns.

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

const COLLECTION = 'siteComments';
const RATE_COLLECTION = 'siteCommentRates';
const RATE_WINDOW_MS = 10 * 60 * 1000;
const POSTS_PER_WINDOW = 5;
const LIKES_PER_WINDOW = 60;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const FALLBACK_SCAN = 400; // docs scanned per page when the composite index is missing
const NAME_MAX = 32;
const TEXT_MAX = 800;
const PAGE_MAX = 120;
const LIKED_BY_MAX = 200;
const PAGE_RE = /^\/[a-z0-9\-/]*$/;
const LINK_RE = /https?:|\bwww\.|\bhttp\b|\b[a-z0-9-]+\.(?:com|net|org|io|app|co|me|ly|xyz|info|biz|gg|tv|ai|dev|link|site|online|shop)\b/i;
const IP_SALT = process.env.COMMENTS_IP_SALT || 'forma-site-comments-v1';

// Comments matching any of these are stored but hidden (not rejected), so a
// slip in an otherwise honest note does not bounce with an error.
const BAD_WORDS = [
  /\bfuck(?:ing|ed|er|s)?\b/i, /\bshit(?:ty|s)?\b/i, /\bbitch(?:es)?\b/i, /\bcunt\b/i, /\basshole\b/i,
  /\bnigg(?:a|er)s?\b/i, /\bfag(?:got)?s?\b/i, /\bretard(?:ed|s)?\b/i, /\btranny\b/i, /\bkike\b/i, /\bspic\b/i, /\bchink\b/i,
  /\bkill (?:yourself|urself)\b/i, /\bkys\b/i, /\bslut\b/i, /\bwhore\b/i, /\brape\b/i, /\bporn\b/i,
];

if (getApps().length === 0) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
    } else {
      initializeApp({ projectId: 'forma-3803d' });
    }
  } catch (e) {
    console.error('firebase init failed:', e);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') return await handleList(req, res);
    if (req.method === 'POST') {
      const body = parseBody(req);
      const ipHash = hashIp(clientIp(req));
      if (body.action === 'like') return await handleLike(body, ipHash, res);
      if (body.action != null && body.action !== 'post') return res.status(400).json({ error: 'bad_action' });
      return await handlePost(body, ipHash, res);
    }
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (e) {
    console.error('comments failed:', e);
    return res.status(500).json({ error: 'internal' });
  }
}

// ---------------------------------------------------------------------------
// GET: list
// ---------------------------------------------------------------------------

async function handleList(req, res) {
  const q = queryOf(req);
  const page = normalizePage(q.page);
  if (!page) return res.status(400).json({ error: 'bad_page' });
  const limit = clampInt(q.limit, 1, MAX_LIMIT, DEFAULT_LIMIT);
  const cursor = q.cursor != null && q.cursor !== '' ? Number(q.cursor) : null;
  if (cursor != null && !Number.isFinite(cursor)) return res.status(400).json({ error: 'bad_cursor' });

  const db = getFirestore();
  let docs;
  try {
    let query = db.collection(COLLECTION).where('page', '==', page).where('hidden', '==', false).orderBy('createdAt', 'desc');
    if (cursor != null) query = query.startAfter(new Date(cursor));
    const snap = await query.limit(limit + 1).get();
    docs = snap.docs;
  } catch (e) {
    // Most likely the composite index is missing (error carries the console link).
    console.error('comments list query failed, falling back to in-memory sort:', e && e.message ? e.message : e);
    const snap = await db.collection(COLLECTION).where('page', '==', page).limit(FALLBACK_SCAN).get();
    docs = snap.docs
      .filter((d) => d.data().hidden !== true)
      .filter((d) => cursor == null || toMillis(d.data().createdAt) < cursor)
      .sort((a, b) => toMillis(b.data().createdAt) - toMillis(a.data().createdAt))
      .slice(0, limit + 1);
  }

  const hasMore = docs.length > limit;
  const rows = docs.slice(0, limit).map(publicComment);
  const next = hasMore && rows.length ? toMillis(docs[rows.length - 1].data().createdAt) : null;
  return res.status(200).json({ comments: rows, next });
}

// ---------------------------------------------------------------------------
// POST: create
// ---------------------------------------------------------------------------

async function handlePost(body, ipHash, res) {
  if (typeof body.honeypot === 'string' && body.honeypot.trim() !== '') return res.status(400).json({ error: 'rejected' });

  const page = normalizePage(body.page);
  if (!page) return res.status(400).json({ error: 'bad_page' });

  const text = cleanText(body.text, TEXT_MAX);
  if (!text) return res.status(400).json({ error: 'missing_text' });
  if (LINK_RE.test(text)) return res.status(400).json({ error: 'links_not_allowed' });

  let name = cleanLine(body.name, NAME_MAX);
  if (name && LINK_RE.test(name)) return res.status(400).json({ error: 'links_not_allowed' });
  if (!name) name = 'anonymous';

  if (body.parentId != null && body.parentId !== '' && (typeof body.parentId !== 'string' || body.parentId.length > 64)) {
    return res.status(400).json({ error: 'bad_parent' });
  }

  if (!(await underCap(ipHash, 'post', POSTS_PER_WINDOW))) return res.status(429).json({ error: 'rate_limited' });

  const db = getFirestore();

  // Replies nest one level: a reply to a reply attaches to the root comment.
  let parentId = null;
  if (typeof body.parentId === 'string' && body.parentId) {
    const parentSnap = await db.collection(COLLECTION).doc(body.parentId).get();
    if (!parentSnap.exists) return res.status(404).json({ error: 'parent_not_found' });
    const parent = parentSnap.data();
    if (parent.page !== page || parent.hidden === true) return res.status(400).json({ error: 'bad_parent' });
    parentId = parent.parentId || parentSnap.id;
  }

  const hidden = BAD_WORDS.some((re) => re.test(text) || re.test(name));
  const ref = db.collection(COLLECTION).doc();
  await ref.set({
    page,
    name,
    text,
    parentId,
    likes: 0,
    likedBy: [],
    createdAt: FieldValue.serverTimestamp(),
    ipHash,
    hidden,
  });
  const saved = await ref.get();
  const out = publicComment(saved);
  if (hidden) out.hidden = true;
  return res.status(201).json({ comment: out });
}

// ---------------------------------------------------------------------------
// POST: like  { action: "like", id }
// ---------------------------------------------------------------------------

async function handleLike(body, ipHash, res) {
  const id = typeof body.id === 'string' ? body.id.trim() : '';
  if (!id || id.length > 64 || !/^[A-Za-z0-9_-]+$/.test(id)) return res.status(400).json({ error: 'bad_id' });
  if (!(await underCap(ipHash, 'like', LIKES_PER_WINDOW))) return res.status(429).json({ error: 'rate_limited' });

  const db = getFirestore();
  const ref = db.collection(COLLECTION).doc(id);
  let result = null;
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists || snap.data().hidden === true) {
      result = null;
      return;
    }
    const data = snap.data();
    const likedBy = Array.isArray(data.likedBy) ? data.likedBy : [];
    const likes = Number(data.likes) || 0;
    if (likedBy.includes(ipHash)) {
      result = { id, likes, liked: false };
      return;
    }
    const update = { likes: FieldValue.increment(1) };
    // Past the cap we still count the like but stop tracking who left it.
    if (likedBy.length < LIKED_BY_MAX) update.likedBy = FieldValue.arrayUnion(ipHash);
    tx.update(ref, update);
    result = { id, likes: likes + 1, liked: true };
  });
  if (!result) return res.status(404).json({ error: 'not_found' });
  return res.status(200).json(result);
}

// ---------------------------------------------------------------------------
// Rate limiting (fails open, like identify.js)
// ---------------------------------------------------------------------------

async function underCap(ipHash, kind, cap) {
  try {
    const window = Math.floor(Date.now() / RATE_WINDOW_MS);
    const ref = getFirestore().collection(RATE_COLLECTION).doc(`${kind}_${ipHash}_${window}`);
    const snap = await ref.get();
    const count = snap.exists ? snap.data().count || 0 : 0;
    if (count >= cap) return false;
    await ref.set({ count: FieldValue.increment(1), window, kind }, { merge: true });
    return true;
  } catch (e) {
    console.error('rate counter error (failing open):', e);
    return true; // fail open — a counter outage must not break the site
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
}

function hashIp(ip) {
  return crypto.createHash('sha256').update(`${ip}|${IP_SALT}`).digest('hex').slice(0, 40);
}

function parseBody(req) {
  const b = req.body;
  if (b && typeof b === 'object') return b;
  if (typeof b === 'string' && b.trim()) {
    try {
      const parsed = JSON.parse(b);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function queryOf(req) {
  if (req.query && typeof req.query === 'object') return req.query;
  try {
    const u = new URL(req.url || '/', 'http://localhost');
    return Object.fromEntries(u.searchParams.entries());
  } catch {
    return {};
  }
}

// Collapses slashes, ensures a trailing slash, drops index.html; null if invalid.
function normalizePage(v) {
  if (typeof v !== 'string') return null;
  let p = v.trim();
  if (!p || p.length > PAGE_MAX) return null;
  p = p.replace(/\/index\.html?$/i, '/').replace(/\/+/g, '/');
  if (!p.endsWith('/')) p += '/';
  if (!PAGE_RE.test(p)) return null;
  return p;
}

function stripHtml(s) {
  return String(s)
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;[^&]*&gt;/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
}

function cleanLine(v, max) {
  if (typeof v !== 'string') return '';
  return stripHtml(v).replace(/\s+/g, ' ').trim().slice(0, max).trim();
}

function cleanText(v, max) {
  if (typeof v !== 'string') return '';
  return stripHtml(v)
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max)
    .trim();
}

function clampInt(v, min, max, dflt) {
  const n = parseInt(v, 10);
  if (!Number.isFinite(n)) return dflt;
  return Math.min(max, Math.max(min, n));
}

function toMillis(ts) {
  if (!ts) return 0;
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'number') return ts;
  if (typeof ts.seconds === 'number') return ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6);
  return 0;
}

function publicComment(doc) {
  const d = doc.data() || {};
  const ms = toMillis(d.createdAt);
  return {
    id: doc.id,
    page: d.page,
    name: d.name || 'anonymous',
    text: d.text || '',
    parentId: d.parentId || null,
    likes: Number(d.likes) || 0,
    createdAt: ms ? new Date(ms).toISOString() : new Date().toISOString(),
  };
}
