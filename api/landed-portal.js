// Landed billing portal: lets a subscriber manage/cancel their plan. Finds the
// Stripe customer via the uid-stamped subscription, then opens a portal session.

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { findSubscription } from './landed-status.js';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

if (getApps().length === 0) {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
        } else {
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

    const sub = await findSubscription(decoded.uid);
    if (!sub?.customer) return res.status(404).json({ error: 'no_subscription' });

    const params = new URLSearchParams();
    params.append('customer', typeof sub.customer === 'string' ? sub.customer : sub.customer.id);
    params.append('return_url', 'https://tryforma.app/landed/success.html');

    const upstream = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${STRIPE_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });
    const data = await upstream.json();
    if (!upstream.ok) {
        console.error('Stripe portal error:', data.error?.message);
        return res.status(502).json({ error: 'portal_failed' });
    }
    return res.status(200).json({ url: data.url });
}
