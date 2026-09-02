// Landed subscription status: verifies the Firebase ID token, then asks Stripe
// for subscriptions stamped with this uid. Stripe is the source of truth.

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

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

export async function findSubscription(uid) {
    const query = encodeURIComponent(`metadata['landed_uid']:'${uid}'`);
    const upstream = await fetch(
        `https://api.stripe.com/v1/subscriptions/search?query=${query}&limit=10`,
        { headers: { 'Authorization': `Bearer ${STRIPE_KEY}` } }
    );
    const data = await upstream.json();
    if (!upstream.ok) {
        console.error('Stripe search error:', data.error?.message);
        return null;
    }
    const subs = data.data || [];
    // Prefer a live subscription; Stripe search can lag ~a minute on writes,
    // which the app tolerates by re-polling from the paywall/restore button.
    return (
        subs.find((s) => s.status === 'active') ||
        subs.find((s) => s.status === 'trialing') ||
        subs[0] ||
        null
    );
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
    if (!STRIPE_KEY) return res.status(500).json({ error: 'Billing not configured' });

    const decoded = await verifyUser(req);
    if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

    const sub = await findSubscription(decoded.uid);
    const status = sub && (sub.status === 'active' || sub.status === 'trialing') ? sub.status : 'none';
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ status });
}
