// Landed billing endpoints, folded into one function to stay under Vercel Hobby's 12-function cap.
// The public paths are unchanged: vercel.json rewrites /api/landed-status, /api/landed-portal and
// /api/landed-checkout here with ?fn=status|portal|checkout.
import status from './_landed/status.js';
import portal from './_landed/portal.js';
import checkout from './_landed/checkout.js';

const FNS = { status, portal, checkout };

export default async function handler(req, res) {
  const url = new URL(req.url || '/', 'http://x');
  const fn = FNS[url.searchParams.get('fn') || (req.query && req.query.fn) || ''];
  if (!fn) return res.status(404).json({ error: 'Not Found' });
  return fn(req, res);
}
