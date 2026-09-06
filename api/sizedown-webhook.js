// Size Down: Stripe webhook → Supabase entitlement. Verifies the Stripe signature (raw body HMAC),
// then calls the SECURITY DEFINER RPCs sd_grant / sd_set_status with a shared secret (no service-role key).
// Env (Vercel): STRIPE_SECRET_KEY, SIZEDOWN_STRIPE_WEBHOOK_SECRET, SIZEDOWN_GRANT_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY
import crypto from 'node:crypto';

export const config = { api: { bodyParser: false } };

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const WH_SECRET = process.env.SIZEDOWN_STRIPE_WEBHOOK_SECRET;
const GRANT = process.env.SIZEDOWN_GRANT_SECRET;
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const ANON = process.env.SUPABASE_ANON_KEY || '';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verify(raw, header) {
  if (!WH_SECRET || !header) return false;
  const parts = Object.fromEntries(header.split(',').map((kv) => kv.split('=')));
  const t = parts.t; const v1 = parts.v1;
  if (!t || !v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = crypto.createHmac('sha256', WH_SECRET).update(`${t}.${raw}`).digest('hex');
  try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1)); } catch { return false; }
}

async function rpc(fn, args) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error(`${fn} ${r.status} ${await r.text()}`);
}

async function stripe(path) {
  const r = await fetch(`https://api.stripe.com/v1${path}`, { headers: { Authorization: `Bearer ${STRIPE_KEY}` } });
  if (!r.ok) throw new Error(`stripe ${path} ${r.status}`);
  return r.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const raw = await rawBody(req);
  if (!verify(raw.toString('utf8'), req.headers['stripe-signature'])) return res.status(400).json({ error: 'bad signature' });
  let event;
  try { event = JSON.parse(raw.toString('utf8')); } catch { return res.status(400).json({ error: 'bad json' }); }
  try {
    const obj = event.data?.object || {};
    if (event.type === 'checkout.session.completed') {
      const uid = obj.client_reference_id;
      if (!UUID.test(uid || '')) { console.warn('sizedown: checkout without uid', obj.id); return res.json({ ignored: true }); }
      const plan = obj.mode === 'subscription' ? 'monthly' : 'lifetime';
      let periodEnd = null;
      if (obj.subscription) {
        const sub = await stripe(`/subscriptions/${obj.subscription}`);
        periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
      }
      await rpc('sd_grant', { p_secret: GRANT, p_user: uid, p_plan: plan, p_status: 'active', p_customer: obj.customer || null, p_subscription: obj.subscription || null, p_email: obj.customer_details?.email || null, p_period_end: periodEnd });
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const status = event.type.endsWith('deleted') || ['canceled', 'unpaid', 'incomplete_expired'].includes(obj.status) ? 'canceled' : obj.status === 'past_due' ? 'past_due' : 'active';
      const periodEnd = obj.current_period_end ? new Date(obj.current_period_end * 1000).toISOString() : null;
      await rpc('sd_set_status', { p_secret: GRANT, p_subscription: obj.id, p_status: status, p_period_end: periodEnd });
    }
    return res.json({ received: true });
  } catch (e) {
    console.error('sizedown webhook', e);
    return res.status(500).json({ error: 'handler failed' });
  }
}
