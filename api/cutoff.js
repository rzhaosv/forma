// Backend for Cutoff (invite-vetted AI fit check & stylist).
//
// Modeled on api/identify.js: the Gemini key stays server-side, requests are
// gated by a static app header (casual-abuse deterrent) and rate-limited by
// client IP through Firestore (fails open if the counter is unavailable).
//
// Request (POST, JSON):
//   mode "apply": { mode:"apply", answers:{...}, image?:"<base64>", mime? }
//                 -> { read:{ aesthetic, line, watch } }
//   mode "check": { mode:"check", image:"<base64>", mime, member:{ aesthetic }, occasion? }
//                 -> { isOutfit, score, verdict, working[], fix, edit[{piece,why,query}], tags[], palette[] }
// Header:  x-cutoff-app: cutoff_v1_3b9e2
// Env:     GEMINI_API_KEY (fallback GOOGLE_AI_API_KEY)
//          FIREBASE_SERVICE_ACCOUNT (optional; enables IP rate cap)
//
// Photos are used for the single model call and never stored.

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const APP_TOKEN = 'cutoff_v1_3b9e2';
const HOURLY_IP_CAP = 30;
const USAGE_COLLECTION = 'cutoffUsage';
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

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

const VOICE = `VOICE: You are "the house" at Cutoff, a members-only fit check. Terse, editorial, precise. Lowercase-adjacent sentences, no exclamation marks, no emojis, no hedging, no filler like "great job". Address the member as "you". Praise is specific and rare. Every criticism is about the clothes, the fit, the proportion, the color or the styling, never about the person's body, weight, shape, skin, face, hair, age, race or gender. Never use the words "flattering", "slimming" or "body type". Never suggest cosmetic or body changes. If the person looks under 18, keep the tone gentle, score between 6.0 and 7.5, and give only clothing advice.`;

const CHECK_PROMPT = `${VOICE}

TASK: Review the outfit in the photo.

FIXED RUBRIC, use the same anchors every time so repeat checks are consistent. Score is 1.0-10.0 with one decimal.
2-3: clothes visibly worn out, stained, or fighting each other; no intent.
4: clean but generic; fit is off in at least one place; colors are incidental.
5: ordinary and competent; nothing wrong, nothing decided.
6: one clear decision (a color story, a silhouette, a good shoe) carries it.
7: intentional. fit is right, palette is controlled, proportion works, footwear agrees.
8: fit, proportion, palette and texture all agree; one detail shows taste (a collar, a hem length, a hardware choice).
9: editorial. a point of view, executed. rare.
10: reserved. almost never.
Judge only what is visible: garments, fit, proportion, color, texture, layering, footwear, accessories, grooming of the clothes (pressed, hems, wrinkles). If the body is only partly visible, judge what you see and say the view was limited in the verdict.

Respond with ONLY a JSON object, no markdown, matching exactly:
{
  "isOutfit": boolean,          // false if there is no clearly visible outfit on a person (blurry, no person, cartoon, only a face). Still fill the other fields with a short retake instruction in "verdict".
  "score": number,              // 1.0-10.0, one decimal, per the rubric
  "verdict": string,            // one sentence, max 22 words, the house's read of the look
  "working": string[],          // 2-3 short phrases, max 9 words each, what is right
  "fix": string,                // one specific change, max 20 words, the single thing that would move the score most
  "edit": [                     // exactly 3 pieces that would complete or upgrade this look. Real garment types, specific: cut, fabric, color. Brand optional.
    { "piece": string,          // e.g. "Black leather derby, chunky sole"
      "why": string,            // max 14 words
      "query": string }         // a shopping search query for that piece, e.g. "black chunky sole leather derby men"
  ],
  "tags": string[],             // 3 aesthetic tags, 1-2 words each, lowercase, e.g. "quiet luxury", "downtown", "utility"
  "palette": string[]           // 3-4 dominant outfit colors as #RRGGBB
}
Member's declared aesthetic is provided as context; use it to shape the edit, not the score.`;

const APPLY_PROMPT = `${VOICE}

TASK: Read a membership application. You receive the applicant's answers and, when present, one photo of a look they chose. Give the house's read of their taste. This is not a score and not a verdict on admission.

Respond with ONLY a JSON object, no markdown, matching exactly:
{
  "aesthetic": string,   // a 2-3 word name for their taste, title case, specific and quotable, e.g. "Quiet Brutalist", "Downtown Uniform", "Soft Utility", "Studied Undone"
  "line": string,        // one sentence to the applicant, max 20 words, the house's read of what they are actually going for
  "watch": string        // one sentence, max 16 words, the tendency they should watch, phrased about clothes not the person
}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-cutoff-app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!GEMINI_API_KEY) return res.status(500).json({ error: 'server_not_configured' });
  if ((req.headers['x-cutoff-app'] || '') !== APP_TOKEN) return res.status(403).json({ error: 'forbidden' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!(await underHourlyCap(ip))) return res.status(429).json({ error: 'rate_limited' });

  try {
    if (body.mode === 'apply') return await handleApply(body, res);
    if (body.mode === 'check') return await handleCheck(body, res);
    return res.status(400).json({ error: 'bad_mode' });
  } catch (e) {
    console.error('cutoff failed:', e);
    return res.status(500).json({ error: 'internal' });
  }
}

async function handleApply(body, res) {
  const { answers, image, mime } = body;
  if (!answers || typeof answers !== 'object') return res.status(400).json({ error: 'missing_answers' });
  if (image && Buffer.byteLength(image, 'base64') > MAX_IMAGE_BYTES) return res.status(413).json({ error: 'image_too_large' });
  const parts = [{ text: APPLY_PROMPT }, { text: 'APPLICATION ANSWERS:\n' + JSON.stringify(answers).slice(0, 4000) }];
  if (image && typeof image === 'string') parts.push({ inline_data: { mime_type: mime || 'image/jpeg', data: image } });
  const parsed = await gemini(parts, 400);
  if (!parsed) return res.status(502).json({ error: 'unparseable' });
  return res.status(200).json({
    read: {
      aesthetic: str(parsed.aesthetic, 'Undeclared').slice(0, 40),
      line: str(parsed.line, '').slice(0, 200),
      watch: str(parsed.watch, '').slice(0, 160),
    },
  });
}

async function handleCheck(body, res) {
  const { image, mime, member, occasion } = body;
  if (!image || typeof image !== 'string') return res.status(400).json({ error: 'missing_image' });
  if (Buffer.byteLength(image, 'base64') > MAX_IMAGE_BYTES) return res.status(413).json({ error: 'image_too_large' });
  const context = [];
  if (member && typeof member.aesthetic === 'string') context.push(`Member aesthetic: ${member.aesthetic.slice(0, 60)}`);
  if (typeof occasion === 'string' && occasion.trim()) context.push(`Occasion: ${occasion.slice(0, 80)}`);
  const parts = [{ text: CHECK_PROMPT }];
  if (context.length) parts.push({ text: 'CONTEXT:\n' + context.join('\n') });
  parts.push({ inline_data: { mime_type: mime || 'image/jpeg', data: image } });
  const parsed = await gemini(parts, 1200);
  if (!parsed) return res.status(502).json({ error: 'unparseable' });
  return res.status(200).json(normalizeCheck(parsed));
}

function normalizeCheck(p) {
  const edit = Array.isArray(p.edit) ? p.edit : [];
  return {
    isOutfit: p.isOutfit !== false,
    score: clamp(p.score, 1, 10, 5),
    verdict: str(p.verdict, 'the view was limited. retake in full light, head to shoe.').slice(0, 220),
    working: strList(p.working).slice(0, 3).map((s) => s.slice(0, 80)),
    fix: str(p.fix, '').slice(0, 160),
    edit: edit
      .filter((e) => e && typeof e === 'object')
      .slice(0, 3)
      .map((e) => ({
        piece: str(e.piece, '').slice(0, 80),
        why: str(e.why, '').slice(0, 100),
        query: str(e.query, str(e.piece, '')).slice(0, 100),
      }))
      .filter((e) => e.piece),
    tags: strList(p.tags).slice(0, 3).map((t) => t.toLowerCase().slice(0, 24)),
    palette: strList(p.palette).filter((c) => /^#[0-9a-fA-F]{6}$/.test(c)).slice(0, 4),
  };
}

async function gemini(parts, maxOutputTokens) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const gRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.4, maxOutputTokens },
    }),
  });
  if (!gRes.ok) {
    console.error('gemini error', gRes.status, await gRes.text());
    return null;
  }
  const data = await gRes.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    try {
      return m ? JSON.parse(m[0]) : null;
    } catch {
      return null;
    }
  }
}

function str(v, fallback) {
  return typeof v === 'string' && v.trim() ? v.trim() : fallback;
}
function strList(v) {
  return Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : [];
}
function clamp(v, lo, hi, fallback) {
  const n = Number(v);
  if (!isFinite(n)) return fallback;
  return Math.round(Math.max(lo, Math.min(hi, n)) * 10) / 10;
}

async function underHourlyCap(ip) {
  try {
    const hour = new Date().toISOString().slice(0, 13);
    const ref = getFirestore().collection(USAGE_COLLECTION).doc(`${ip}_${hour}`);
    const snap = await ref.get();
    const count = snap.exists ? snap.data().count || 0 : 0;
    if (count >= HOURLY_IP_CAP) return false;
    await ref.set({ count: FieldValue.increment(1), hour, ip }, { merge: true });
    return true;
  } catch (e) {
    console.error('rate counter error (failing open):', e);
    return true;
  }
}
