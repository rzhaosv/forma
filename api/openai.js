// Authenticated OpenAI proxy for the Macra mobile app.
//
// The app previously shipped with an OpenAI API key baked into the client
// bundle (EXPO_PUBLIC_OPENAI_API_KEY), where anyone could extract and abuse
// it. This endpoint keeps the key server-side: the app sends its Firebase ID
// token, we verify it, apply a per-user daily cap, and forward the request.
//
// Request (POST, JSON):
//   { "endpoint": "chat", "payload": <OpenAI chat.completions body> }
//   { "endpoint": "transcription", "payload": { "audioBase64": "...",
//       "mimeType": "audio/m4a", "fileName": "audio.m4a" } }
//
// Headers: Authorization: Bearer <Firebase ID token>
//
// Env (Vercel project settings):
//   OPENAI_API_KEY            server-side OpenAI key (never shipped to clients)
//   FIREBASE_SERVICE_ACCOUNT  service account JSON (already set for subscribe.js)

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Models the app legitimately uses; anything else is rejected so a stolen
// client token can't be used to run expensive models on our bill.
const ALLOWED_CHAT_MODELS = new Set(['gpt-4o-mini', 'gpt-4o']);
const MAX_TOKENS_CAP = 4000;
const DAILY_REQUEST_CAP = 400; // per user per UTC day

if (getApps().length === 0) {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
        } else {
            // ID-token VERIFICATION only needs the project id (public certs).
            // Firestore (the usage counter) needs real credentials and will
            // fail open until FIREBASE_SERVICE_ACCOUNT is configured.
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
        const decoded = await getAuth().verifyIdToken(token);
        return decoded.uid;
    } catch {
        return null;
    }
}

// Firestore-backed daily counter. Fails open: an outage in the counter must
// not take AI features down with it.
async function underDailyCap(uid) {
    try {
        const day = new Date().toISOString().slice(0, 10);
        const ref = getFirestore().collection('aiUsage').doc(`${uid}_${day}`);
        const snap = await ref.get();
        const count = snap.exists ? snap.data().count || 0 : 0;
        if (count >= DAILY_REQUEST_CAP) return false;
        await ref.set({ count: FieldValue.increment(1), day, uid }, { merge: true });
        return true;
    } catch (error) {
        console.error('aiUsage counter error (failing open):', error);
        return true;
    }
}

async function forwardChat(payload, res) {
    if (!payload || !ALLOWED_CHAT_MODELS.has(payload.model)) {
        return res.status(400).json({ error: 'Model not allowed' });
    }
    if (payload.max_tokens && payload.max_tokens > MAX_TOKENS_CAP) {
        payload.max_tokens = MAX_TOKENS_CAP;
    }
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
}

async function forwardTranscription(payload, res) {
    const { audioBase64, mimeType, fileName } = payload || {};
    if (!audioBase64) {
        return res.status(400).json({ error: 'audioBase64 required' });
    }
    const bytes = Buffer.from(audioBase64, 'base64');
    const form = new FormData();
    form.append(
        'file',
        new Blob([bytes], { type: mimeType || 'audio/m4a' }),
        fileName || 'audio.m4a'
    );
    form.append('model', 'whisper-1');
    const upstream = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: form,
    });
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    if (!OPENAI_API_KEY) {
        return res.status(500).json({ error: 'Proxy not configured' });
    }

    const uid = await verifyUser(req);
    if (!uid) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!(await underDailyCap(uid))) {
        return res.status(429).json({ error: 'Daily AI usage limit reached' });
    }

    try {
        const { endpoint, payload } = req.body || {};
        if (endpoint === 'chat') return await forwardChat(payload, res);
        if (endpoint === 'transcription') return await forwardTranscription(payload, res);
        return res.status(400).json({ error: 'Unknown endpoint' });
    } catch (error) {
        console.error('OpenAI proxy error:', error);
        return res.status(502).json({ error: 'Upstream request failed' });
    }
}
