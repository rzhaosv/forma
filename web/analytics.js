/**
 * Analytics Wrapper
 * Unified interface for Google Analytics and Mixpanel
 */

class Analytics {
    constructor() {
        this.isInitialized = false;
        this.gaInitialized = false;
        this.mixpanelInitialized = false;
        this.queue = [];
    }

    /**
     * Initialize analytics
     * @param {Object} config - Configuration object
     * @param {string} config.gaId - Google Analytics Measurement ID (e.g., 'G-XXXXXXXXXX')
     * @param {string} config.mixpanelToken - Mixpanel project token
     * @param {boolean} config.debug - Enable debug mode
     */
    init(config = {}) {
        this.config = {
            gaId: config.gaId || null,
            mixpanelToken: config.mixpanelToken || null,
            debug: config.debug || false,
        };

        if (this.config.debug) {
            console.log('📊 Analytics initialized with config:', this.config);
        }

        // Initialize Google Analytics
        if (this.config.gaId && typeof gtag !== 'undefined') {
            this.gaInitialized = true;
            gtag('config', this.config.gaId, {
                send_page_view: true,
                anonymize_ip: true,
            });
            this.log('Google Analytics initialized');
        }

        // Initialize Mixpanel
        if (this.config.mixpanelToken && typeof mixpanel !== 'undefined') {
            mixpanel.init(this.config.mixpanelToken, {
                debug: this.config.debug,
                track_pageview: true,
                persistence: 'localStorage',
                ignore_dnt: true, // Ignore "Do Not Track" for development/testing
            });
            this.mixpanelInitialized = true;
            this.log('Mixpanel initialized');
        }

        // Initialize Vercel Analytics
        if (typeof va !== 'undefined') {
            this.log('Vercel Analytics initialized');
        }

        this.isInitialized = true;

        // Process any queued events
        this.processQueue();

        // Set up automatic tracking

    }

    /**
     * Track a custom event
     * @param {string} eventName - Name of the event
     * @param {Object} properties - Event properties
     */
    track(eventName, properties = {}) {
        if (!this.isInitialized) {
            this.queue.push({ type: 'track', eventName, properties });
            return;
        }

        this.log(`Tracking event: ${eventName}`, properties);

        // Google Analytics
        if (this.gaInitialized && typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }

        // Mixpanel
        if (this.mixpanelInitialized && typeof mixpanel !== 'undefined') {
            mixpanel.track(eventName, properties);
        }

        // Vercel Analytics
        if (typeof va !== 'undefined') {
            va('event', { name: eventName, data: properties });
        }

        // TikTok Pixel
        if (typeof ttq !== 'undefined') {
            // Map common events to TikTok standard events
            let tiktokEvent = eventName;
            let tiktokProps = { ...properties };

            if (eventName === 'CTA Clicked' && (properties.cta_text === 'Get Early Access' || properties.cta_text === 'Get Started')) {
                tiktokEvent = 'AddtoWishlist';
            } else if (eventName === 'App Download Started') {
                tiktokEvent = 'Download';
            } else if (eventName === 'Email Captured' || (eventName === 'Form Submitted' && properties.success)) {
                tiktokEvent = 'CompleteRegistration';
            } else if (eventName === 'Page View') {
                tiktokEvent = 'ViewContent';
            }

            // Add test code if present in URL or properties
            const urlParams = new URLSearchParams(window.location.search);
            const testCode = properties.tiktok_test_event_code || urlParams.get('tiktok_test_event_code');
            if (testCode) {
                tiktokProps.test_event_code = testCode;
            }

            ttq.track(tiktokEvent, tiktokProps);
        }

        // Google Tag Manager (dataLayer)
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: eventName,
            ...properties
        });
    }



    /**
     * Identify a user
     * @param {string} userId - User ID
     * @param {Object} traits - User traits/properties
     */
    identify(userId, traits = {}) {
        this.log(`Identifying user: ${userId}`, traits);

        // Google Analytics
        if (this.gaInitialized && typeof gtag !== 'undefined') {
            gtag('set', { user_id: userId });
            gtag('set', 'user_properties', traits);
        }

        // Mixpanel
        if (this.mixpanelInitialized && typeof mixpanel !== 'undefined') {
            mixpanel.identify(userId);
            mixpanel.people.set(traits);
        }
    }

    /**
     * Track email capture
     * @param {string} email - Email address
     * @param {string} source - Source of capture (e.g., 'waitlist', 'newsletter')
     */
    trackEmailCapture(email, source = 'waitlist') {
        this.track('Email Captured', {
            source: source,
            timestamp: new Date().toISOString(),
        });

        // Set user property (email hash for privacy)
        this.identify(this.hashEmail(email), {
            email_captured: true,
            capture_source: source,
            capture_date: new Date().toISOString(),
        });
    }

    /**
     * Track CTA click
     * @param {string} ctaText - CTA button text
     * @param {string} ctaLocation - Location on page
     */
    trackCTAClick(ctaText, ctaLocation = 'unknown') {
        this.track('CTA Clicked', {
            cta_text: ctaText,
            cta_location: ctaLocation,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Track form submission
     * @param {string} formName - Name of the form
     * @param {boolean} success - Whether submission was successful
     */
    trackFormSubmission(formName, success = true) {
        this.track('Form Submitted', {
            form_name: formName,
            success: success,
            timestamp: new Date().toISOString(),
        });
    }



    /**
     * Track error
     * @param {string} errorMessage - Error message
     * @param {string} errorType - Type of error
     */
    trackError(errorMessage, errorType = 'general') {
        this.track('Error Occurred', {
            error_message: errorMessage,
            error_type: errorType,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Track app download click
     * @param {string} platform - 'ios' or 'android'
     */
    trackAppDownload(platform) {
        this.track('App Download Started', {
            platform: platform,
            timestamp: new Date().toISOString(),
        });
    }



    /**
     * Process queued events
     */
    processQueue() {
        while (this.queue.length > 0) {
            const event = this.queue.shift();
            if (event.type === 'track') {
                this.track(event.eventName, event.properties);
            }
        }
    }

    /**
     * Hash email for privacy
     * @param {string} email - Email address
     * @returns {string} - Hashed email
     */
    hashEmail(email) {
        // Simple hash for privacy (use a proper hash in production)
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            const char = email.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'user_' + Math.abs(hash).toString(36);
    }

    /**
     * Log debug messages
     */
    log(message, data = null) {
        if (this.config.debug) {
            console.log(`📊 Analytics: ${message}`, data || '');
        }
    }
}

// Create global instance
window.analytics = new Analytics();

// Expose for easy access
window.trackEvent = (eventName, properties) => window.analytics.track(eventName, properties);
window.trackCTA = (text, location) => window.analytics.trackCTAClick(text, location);
window.trackEmail = (email, source) => window.analytics.trackEmailCapture(email, source);
window.trackDownload = (platform) => window.analytics.trackAppDownload(platform);

