// The World — "make a call": the house beside the money.
//
// Mounted inside api/comments.js (Vercel Hobby caps a deployment at 12
// serverless functions and we are at the cap), reached as /api/world via a
// rewrite in vercel.json. Two jobs:
//
//   1. PRICES. Server-side read of Kalshi's public trade API. It has to be
//      server-side: api.elections.kalshi.com runs an Origin allowlist, so a
//      browser on tryforma.app gets a bodyless 403. Results are held in a
//      module-level cache for KALSHI_TTL_MS so a warm lambda answers most
//      requests without touching Kalshi at all.
//   2. VOTES. Visitors call yes/no here. Stored in Supabase behind the same
//      SECURITY DEFINER pattern the comments use, keyed by a salted hash of
//      the client IP, one vote per question, changeable.
//
// Neither half is required: if Kalshi is unreachable the page shows the house
// alone, and if Supabase is unset it shows the money alone. The page is built
// to read correctly with either missing.
//
// GET  /api/world?q=<id>:<ticker>,<id2>:,<id3>:<ticker3>
//      -> { prices: { TICKER: {yes, status, close} }, votes: { id: {yes,no} },
//           you: { id: "yes"|"no" }, live: bool }
// POST /api/world  { market: "<id>", side: "yes"|"no" }
//      -> { market, yes, no, you }
//
// Env: SUPABASE_URL, SUPABASE_ANON_KEY   (votes; without them votes are empty)
//      KALSHI_LIVE = "0" to serve links only and never call Kalshi.
//
// NOTE ON TERMS: Kalshi's Data Terms of Use and Developer Agreement reserve the
// public display of their prices to authorised parties. Ray asked for live
// prices; set KALSHI_LIVE=0 in Vercel to turn them off in one step, which
// leaves the questions, the house vote and the deep links working.

const KALSHI_BASE = 'https://api.elections.kalshi.com/trade-api/v2';
const KALSHI_TTL_MS = 45_000;
const KALSHI_TIMEOUT_MS = 3500;
const MAX_MARKETS = 24;
const ID_RE = /^[a-z0-9][a-z0-9_-]{0,39}$/i;
const TICKER_RE = /^[A-Z0-9][A-Z0-9._-]{0,63}$/;
const VOTES_PER_WINDOW = 40;

const priceCache = new Map(); // ticker -> { at, value }

export async function handleWorld(req, res, ctx) {
  const { rpc, storageConfigured, underCap, ipHash, queryOf, parseBody } = ctx;
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const { ids, tickers } = parseQ(queryOf(req).q);
    const [prices, votes, mine] = await Promise.all([
      readPrices(tickers),
      readTally(ids, rpc, storageConfigured),
      readMine(ids, ipHash, rpc, storageConfigured),
    ]);
    return res.status(200).json({ prices, votes, you: mine, live: liveEnabled() });
  }

  if (req.method === 'POST') {
    const body = parseBody(req);
    const market = typeof body.market === 'string' ? body.market.trim() : '';
    const side = typeof body.side === 'string' ? body.side.trim().toLowerCase() : '';
    if (!ID_RE.test(market)) return res.status(400).json({ error: 'bad_market' });
    if (side !== 'yes' && side !== 'no') return res.status(400).json({ error: 'bad_side' });
    if (!storageConfigured()) return res.status(503).json({ error: 'storage_unavailable' });
    if (!(await underCap(ipHash, 'vote', VOTES_PER_WINDOW))) return res.status(429).json({ error: 'rate_limited' });

    const rows = asRows(await rpc('world_votes_cast', { p_market: market, p_side: side, p_ip_hash: ipHash }));
    const row = rows[0] || {};
    return res.status(200).json({
      market,
      yes: Number(row.yes) || 0,
      no: Number(row.no) || 0,
      you: side,
    });
  }

  return res.status(405).json({ error: 'method_not_allowed' });
}

// ---------------------------------------------------------------------------
// Kalshi
// ---------------------------------------------------------------------------

function liveEnabled() {
  return String(process.env.KALSHI_LIVE ?? '1') !== '0';
}

async function readPrices(tickers) {
  const out = {};
  if (!liveEnabled() || !tickers.length) return out;

  const now = Date.now();
  const stale = [];
  for (const t of tickers) {
    const hit = priceCache.get(t);
    if (hit && now - hit.at < KALSHI_TTL_MS) {
      if (hit.value) out[t] = hit.value;
    } else {
      stale.push(t);
    }
  }
  if (!stale.length) return out;

  let fetched = [];
  try {
    fetched = await fetchMarkets(stale);
  } catch (e) {
    console.error('kalshi fetch failed:', e && e.message);
    // Cache the miss briefly so one outage does not turn into a request storm.
    for (const t of stale) priceCache.set(t, { at: now, value: null });
    return out;
  }

  const seen = new Set();
  for (const m of fetched) {
    const t = m && m.ticker;
    if (!t) continue;
    seen.add(t);
    const value = publicMarket(m);
    priceCache.set(t, { at: now, value });
    if (value) out[t] = value;
  }
  for (const t of stale) if (!seen.has(t)) priceCache.set(t, { at: now, value: null });
  return out;
}

// One batched call, falling back to per-ticker reads if the batch filter is not
// honoured by the deployed API version.
async function fetchMarkets(tickers) {
  const batch = await getJson(`${KALSHI_BASE}/markets?limit=${tickers.length}&tickers=${encodeURIComponent(tickers.join(','))}`);
  const list = Array.isArray(batch && batch.markets) ? batch.markets : [];
  const got = new Set(list.map((m) => m && m.ticker).filter(Boolean));
  const missing = tickers.filter((t) => !got.has(t));
  if (!missing.length) return list;

  const singles = await Promise.all(
    missing.map((t) =>
      getJson(`${KALSHI_BASE}/markets/${encodeURIComponent(t)}`)
        .then((j) => (j && (j.market || j)) || null)
        .catch(() => null),
    ),
  );
  return list.concat(singles.filter(Boolean));
}

async function getJson(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), KALSHI_TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      signal: ctl.signal,
      headers: { accept: 'application/json', 'user-agent': 'tryforma.app (+https://tryforma.app)' },
    });
    if (!r.ok) throw new Error(`kalshi ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

// Kalshi moved to fixed-point dollar strings ("0.54"); older fields are integer
// cents. Accept either and always hand the page whole cents.
function publicMarket(m) {
  const yes = firstCents(m.last_price_dollars, m.yes_ask_dollars, m.yes_bid_dollars) ?? firstCents(m.last_price, m.yes_ask, m.yes_bid, { alreadyCents: true });
  if (yes == null) return null;
  return {
    yes,
    status: typeof m.status === 'string' ? m.status : null,
    close: typeof m.close_time === 'string' ? m.close_time : null,
    title: typeof m.yes_sub_title === 'string' && m.yes_sub_title ? m.yes_sub_title : null,
  };
}

function firstCents(...args) {
  const opts = typeof args[args.length - 1] === 'object' && args[args.length - 1] !== null ? args.pop() : {};
  for (const v of args) {
    if (v == null || v === '') continue;
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) continue;
    const cents = opts.alreadyCents ? Math.round(n) : Math.round(n * 100);
    if (cents > 0 && cents < 100) return cents;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Votes
// ---------------------------------------------------------------------------

async function readTally(ids, rpc, storageConfigured) {
  if (!ids.length || !storageConfigured()) return {};
  try {
    const rows = asRows(await rpc('world_votes_tally', { p_markets: ids }));
    const out = {};
    for (const r of rows) if (r && r.market) out[r.market] = { yes: Number(r.yes) || 0, no: Number(r.no) || 0 };
    return out;
  } catch (e) {
    console.error('world tally failed:', e && e.message);
    return {};
  }
}

async function readMine(ids, ipHash, rpc, storageConfigured) {
  if (!ids.length || !storageConfigured()) return {};
  try {
    const rows = asRows(await rpc('world_votes_mine', { p_markets: ids, p_ip_hash: ipHash }));
    const out = {};
    for (const r of rows) if (r && r.market) out[r.market] = r.side;
    return out;
  } catch (e) {
    console.error('world mine failed:', e && e.message);
    return {};
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// "sfhigh:KXHIGH-1,dinner:,fed:KXFED-2" -> ids + the tickers worth pricing
function parseQ(raw) {
  const ids = [];
  const tickers = [];
  if (typeof raw !== 'string' || !raw) return { ids, tickers };
  for (const part of raw.split(',').slice(0, MAX_MARKETS)) {
    const i = part.indexOf(':');
    const id = (i === -1 ? part : part.slice(0, i)).trim();
    const ticker = (i === -1 ? '' : part.slice(i + 1)).trim().toUpperCase();
    if (!ID_RE.test(id) || ids.includes(id)) continue;
    ids.push(id);
    if (ticker && TICKER_RE.test(ticker) && !tickers.includes(ticker)) tickers.push(ticker);
  }
  return { ids, tickers };
}

function asRows(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}
