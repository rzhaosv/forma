import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

const TIKTOK_PIXEL_ID = process.env.TIKTOK_PIXEL_ID;
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;

async function trackTikTokEvent(event, data, req, testCode = null) {
    if (!TIKTOK_PIXEL_ID || !TIKTOK_ACCESS_TOKEN) return;

    const payload = {
        event_source: 'web',
        event_source_id: TIKTOK_PIXEL_ID,
        data: [{
            event,
            event_id: crypto.randomUUID(),
            event_time: Math.floor(Date.now() / 1000),
            test_event_code: testCode || process.env.TIKTOK_TEST_EVENT_CODE,
            context: {
                user: {
                    email: crypto.createHash('sha256').update(data.email.toLowerCase().trim()).digest('hex'),
                    user_agent: req.headers['user-agent'],
                    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
                },
                page: {
                    url: req.headers.referer || 'https://tryforma.app/'
                }
            }
        }]
    };

    try {
        await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
            method: 'POST',
            headers: {
                'Access-Token': TIKTOK_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error('TikTok Tracking Error:', error);
    }
}

// Initialize Firebase Admin (only once)
if (getApps().length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            initializeApp({
                credential: cert(serviceAccount)
            });
            console.log("Firebase Admin initialized successfully.");
        } catch (error) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", error);
        }
    } else {
        console.warn("FIREBASE_SERVICE_ACCOUNT env variable is missing. Signups will only be logged to console.");
    }
}

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { email, testCode } = req.body;
        const queryTestCode = req.query?.testCode;
        const finalTestCode = testCode || queryTestCode;

        // Basic validation
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Please provide a valid email address.' });
        }

        // 1. Log to console (Backup)
        console.log(`NEW SUBSCRIBER: ${email} at ${new Date().toISOString()}`);

        // 2. Write to Firestore (if initialized)
        if (getApps().length > 0) {
            try {
                const db = getFirestore();
                await db.collection('waitlist').add({
                    email,
                    timestamp: FieldValue.serverTimestamp(),
                    source: 'landing_page'
                });
                console.log(`Successfully added ${email} to Firestore waitlist.`);
            } catch (dbError) {
                console.error("Firestore Write Error:", dbError);
                // Return DB error to client for debugging
                return res.status(500).json({
                    error: 'Database Write Failed',
                    details: dbError.message
                });
            }
        } else {
            console.warn("Skipping Firestore write (Admin SDK not initialized).");
            // Return initialization error to client for debugging
            return res.status(500).json({
                error: 'Firebase Not Initialized',
                details: process.env.FIREBASE_SERVICE_ACCOUNT ? 'Env Var exists but Parse/Init failed' : 'FIREBASE_SERVICE_ACCOUNT Env Var missing'
            });
        }

        // 3. Track with TikTok Events API (Server-Side)
        await trackTikTokEvent('CompleteRegistration', { email }, req, finalTestCode);

        // Return success
        return res.status(200).json({
            success: true,
            message: 'Successfully subscribed!',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Subscription Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
