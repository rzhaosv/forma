// Landed (com.formaz.landed): creates a Stripe Checkout Session for the
// subscription. The app sends its Firebase ID token; we verify it and stamp
// the uid into the subscription metadata — landed-status.js later uses that
// stamp to answer "is this user subscribed" with Stripe as the only source of
// truth (no entitlement database to drift).

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const PRICES = {
    monthly: process.env.LANDED_PRICE_MONTHLY,
    yearly: process.env.LANDED_PRICE_YEARLY,
};
const SITE = 'https://tryforma.app/landed';

if (getApps().length === 0) {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
        } else {
            // ID-token verification only needs the project id (public certs).
            initializeApp({ projectId: 'forma-3803d' });
        }
    } catch (error) {
        console.error('Failed to init Firebase Admin:', error);
    }
}

async function verifyUser(req) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return null;
    try {
        return await getAuth().verifyIdToken(token);
    } catch {
        return null;
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    if (!STRIPE_KEY) return res.status(500).json({ error: 'Billing not configured' });

    const decoded = await verifyUser(req);
    if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

    const plan = req.body?.plan === 'monthly' ? 'monthly' : 'yearly';
    const price = PRICES[plan];
    if (!price) return res.status(500).json({ error: 'Price not configured' });

    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    params.append('line_items[0][price]', price);
    params.append('line_items[0][quantity]', '1');
    params.append('subscription_data[trial_period_days]', '7');
    params.append('subscription_data[metadata][landed_uid]', decoded.uid);
    params.append('metadata[landed_uid]', decoded.uid);
    params.append('client_reference_id', decoded.uid);
    if (decoded.email) params.append('customer_email', decoded.email);
    params.append('allow_promotion_codes', 'true');
    params.append('success_url', `${SITE}/success.html`);
    params.append('cancel_url', `${SITE}/cancel.html`);

    const upstream = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${STRIPE_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });
    const data = await upstream.json();
    if (!upstream.ok) {
        console.error('Stripe checkout error:', data.error?.message);
        return res.status(502).json({ error: 'checkout_failed' });
    }
    return res.status(200).json({ url: data.url });
}
