// Outbound shopping redirect for Cutoff's "Find it" links.
//
//   GET /api/go?q=<search query>[&r=farfetch|ssense|amazon]
//
// Builds a retailer search URL for the query and 302s to it. When an affiliate
// network is configured in env, the URL is wrapped/tagged first, so networks can
// be added or switched here without shipping an app update:
//   SOVRN_KEY   Sovrn Commerce (VigLink) API key -> wraps any retailer URL
//   AMAZON_TAG  Amazon Associates tracking id, e.g. cutoff-20 -> tags Amazon searches
// With nothing configured it is a plain, untagged retailer search.

const RETAILERS = {
  farfetch: (q) => `https://www.farfetch.com/shopping/search/items.aspx?q=${enc(q)}`,
  ssense: (q) => `https://www.ssense.com/en-us/search?q=${enc(q)}`,
  nordstrom: (q) => `https://www.nordstrom.com/sr?keyword=${enc(q)}`,
  amazon: (q) => `https://www.amazon.com/s?k=${enc(q)}${process.env.AMAZON_TAG ? `&tag=${enc(process.env.AMAZON_TAG)}` : ''}`,
  google: (q) => `https://www.google.com/search?tbm=shop&q=${enc(q)}`,
};
const DEFAULT_RETAILER = 'farfetch';

function enc(s) {
  return encodeURIComponent(String(s));
}

export default function handler(req, res) {
  const q = String(req.query?.q || '').replace(/[\r\n\t]/g, ' ').trim().slice(0, 120);
  if (!q) return res.status(400).send('missing q');
  const r = String(req.query?.r || DEFAULT_RETAILER).toLowerCase();
  const build = RETAILERS[r] || RETAILERS[DEFAULT_RETAILER];
  let url = build(q);
  // Sovrn wraps everything except Amazon (Amazon is tagged directly above).
  if (process.env.SOVRN_KEY && r !== 'amazon') {
    url = `https://redirect.viglink.com/?key=${enc(process.env.SOVRN_KEY)}&u=${enc(url)}`;
  }
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  return res.redirect(302, url);
}
