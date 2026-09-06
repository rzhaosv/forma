// Size Down: restore Pro on a new device. The client posts the Stripe Checkout Session id it got back
// on the success URL; we look up the session, find the uid it was bought under, and re-link to the new uid.
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const GRANT = process.env.SIZEDOWN_GRANT_SECRET;
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const ANON = process.env.SUPABASE_ANON_KEY || '';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();
  const { session_id, new_user } = req.body || {};
  if (!/^cs_[A-Za-z0-9_]+$/.test(session_id || '') || !UUID.test(new_user || '')) return res.status(400).json({ error: 'bad input' });
  try {
    const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, { headers: { Authorization: `Bearer ${STRIPE_KEY}` } });
    if (!r.ok) return res.status(404).json({ error: 'session not found' });
    const s = await r.json();
    if (s.payment_status !== 'paid' && s.status !== 'complete') return res.status(402).json({ error: 'not paid' });
    const old = s.client_reference_id;
    if (!UUID.test(old || '')) return res.status(400).json({ error: 'session has no user' });
    const q = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sd_relink`, { method: 'POST', headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_secret: GRANT, p_old_user: old, p_new_user: new_user }) });
    if (!q.ok) throw new Error(await q.text());
    return res.json({ ok: true });
  } catch (e) {
    console.error('sizedown restore', e);
    return res.status(500).json({ error: 'restore failed' });
  }
}
