import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';
const PIXEL_ID = process.env.TIKTOK_PIXEL_ID;
const ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;
const TEST_EVENT_CODE = process.env.TIKTOK_TEST_EVENT_CODE;

export interface TikTokEventData {
    event: string;
    event_id?: string;
    event_time?: number;
    test_event_code?: string;
    context?: {
        ad?: {
            callback?: string;
        };
        page?: {
            url?: string;
            referrer?: string;
        };
        user?: {
            external_id?: string;
            email?: string;
            phone_number?: string;
            ttp?: string;
            user_agent?: string;
            ip?: string;
        };
    };
    properties?: {
        content_id?: string;
        content_type?: string;
        content_name?: string;
        quantity?: number;
        price?: number;
        value?: number;
        currency?: string;
        query?: string;
    };
}

class TikTokService {
    private hash(data: string | undefined): string | undefined {
        if (!data) return undefined;
        return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
    }

    async trackEvent(eventData: TikTokEventData) {
        if (!PIXEL_ID || !ACCESS_TOKEN) {
            console.warn('TikTok Tracking Warning: PIXEL_ID or ACCESS_TOKEN not configured.');
            return;
        }

        // Format the payload according to TikTok's requirements (Events API v1.3)
        const payload = {
            event_source: 'web',
            event_source_id: PIXEL_ID,
            data: [
                {
                    event: eventData.event,
                    event_id: eventData.event_id || crypto.randomUUID(),
                    event_time: eventData.event_time || Math.floor(Date.now() / 1000),
                    test_event_code: eventData.test_event_code || TEST_EVENT_CODE,
                    context: {
                        ad: {
                            callback: eventData.context?.ad?.callback,
                        },
                        page: {
                            url: eventData.context?.page?.url,
                            referrer: eventData.context?.page?.referrer,
                        },
                        user: {
                            external_id: eventData.context?.user?.external_id,
                            email: this.hash(eventData.context?.user?.email),
                            phone_number: this.hash(eventData.context?.user?.phone_number),
                            ttp: eventData.context?.user?.ttp,
                            user_agent: eventData.context?.user?.user_agent,
                            ip: eventData.context?.user?.ip,
                        },
                    },
                    properties: eventData.properties,
                }
            ],
        };

        try {
            const response = await axios.post(TIKTOK_API_URL, payload, {
                headers: {
                    'Access-Token': ACCESS_TOKEN,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.code !== 0) {
                console.error('TikTok Tracking Error:', response.data.message);
            } else {
                console.log(`TikTok Tracking Success: ${eventData.event}`);
            }
            return response.data;
        } catch (error: any) {
            console.error('TikTok Tracking API Exception:', error.response?.data || error.message);
            throw error;
        }
    }

    // Common event helpers
    async trackRegistration(email: string, external_id: string, url: string, userAgent?: string, ip?: string) {
        return this.trackEvent({
            event: 'CompleteRegistration',
            context: {
                page: { url },
                user: { email, external_id, user_agent: userAgent, ip }
            }
        });
    }

    async trackSubscription(value: number, currency: string, email: string, external_id: string, url: string, userAgent?: string, ip?: string) {
        return this.trackEvent({
            event: 'Subscribe',
            context: {
                page: { url },
                user: { email, external_id, user_agent: userAgent, ip }
            },
            properties: {
                value,
                currency
            }
        });
    }
}

export const tiktokService = new TikTokService();
