/**
 * Analytics Configuration
 * 
 * Replace these with your actual IDs:
 * 1. Google Analytics: Get from https://analytics.google.com
 * 2. Mixpanel: Get from https://mixpanel.com/project/YOUR_PROJECT/settings
 */

// Configuration
const ANALYTICS_CONFIG = {
    // Google Analytics 4 Measurement ID
    // Format: G-XXXXXXXXXX
    // Get from: https://analytics.google.com → Admin → Data Streams → Web → Measurement ID
    gaId: 'G-9L6PRKEYBS', // Replace with your GA4 Measurement ID
    
    // Mixpanel Project Token
    // Get from: https://mixpanel.com → Project Settings → Project Token
    mixpanelToken: '40d54d40a7574faf1824539bbe5462df', // Replace with your Mixpanel token
    
    // Enable debug mode (shows console logs)
    debug: true, // Set to false in production
};

// Initialize analytics when page loads
function initializeAnalytics() {
    // Check if analytics object exists
    if (!window.analytics) {
        console.error('❌ Analytics object not found. Make sure analytics.js is loaded first.');
        return;
    }

    // Check if IDs are configured
    const gaConfigured = ANALYTICS_CONFIG.gaId && ANALYTICS_CONFIG.gaId !== 'G-XXXXXXXXXX';
    const mixpanelConfigured = ANALYTICS_CONFIG.mixpanelToken && ANALYTICS_CONFIG.mixpanelToken !== 'YOUR_MIXPANEL_TOKEN';
    
    if (!gaConfigured && !mixpanelConfigured) {
        console.warn('⚠️ Analytics not configured. Please add your GA4 and Mixpanel IDs in analytics-config.js');
        return;
    }

    console.log('🔧 Initializing analytics...');
    console.log('  GA4 configured:', gaConfigured);
    console.log('  Mixpanel configured:', mixpanelConfigured);

    // Wait for external scripts to load
    let attempts = 0;
    const maxAttempts = 30; // 3 seconds total
    
    const checkAndInit = () => {
        attempts++;
        
        const gtagReady = typeof gtag !== 'undefined';
        const mixpanelReady = typeof mixpanel !== 'undefined' && typeof mixpanel.init === 'function';
        
        console.log(`  Attempt ${attempts}: gtag=${gtagReady}, mixpanel=${mixpanelReady}`);
        
        // Initialize if at least one service is ready, or we've hit max attempts
        if (gtagReady || mixpanelReady || attempts >= maxAttempts) {
            try {
                window.analytics.init(ANALYTICS_CONFIG);
                console.log('✅ Analytics initialized successfully!');
                console.log('  GA4 status:', window.analytics.gaInitialized ? '✅ Connected' : '❌ Not available');
                console.log('  Mixpanel status:', window.analytics.mixpanelInitialized ? '✅ Connected' : '❌ Not available');
            } catch (error) {
                console.error('❌ Error initializing analytics:', error);
            }
        } else {
            // Try again in 100ms
            setTimeout(checkAndInit, 100);
        }
    };
    
    // Start checking after a small delay to let scripts load
    setTimeout(checkAndInit, 200);
}

// Start initialization
console.log('📊 Analytics config loaded');
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnalytics);
} else {
    // DOM already loaded, initialize immediately
    initializeAnalytics();
}

// Export for use in other scripts
window.ANALYTICS_CONFIG = ANALYTICS_CONFIG;

