/**
 * Firebase Analytics Utility Module
 *
 * Provides type-safe wrapper functions for tracking events in Firebase Analytics.
 * These events are used for Google Ads conversion tracking and app analytics.
 *
 * @module analytics
 */

import analytics from '@react-native-firebase/analytics';
import firebaseNative from '@react-native-firebase/app';
import { Platform } from 'react-native';

/**
 * Check if Firebase Native App is initialized
 * Uses the React Native Firebase native module, NOT the Web SDK
 */
export const isFirebaseReady = (): boolean => {
  try {
    const apps = firebaseNative.apps;
    return apps && apps.length > 0;
  } catch (e) {
    return false;
  }
};

/**
 * Wrapper to safely execute analytics functions only when Firebase is ready.
 * Guards against native crashes when Firebase isn't configured.
 */
const safeAnalytics = async <T>(
  fn: () => Promise<T>,
  eventName: string
): Promise<T | undefined> => {
  if (!isFirebaseReady()) {
    return undefined;
  }
  try {
    return await fn();
  } catch (error) {
    console.error(`❌ Analytics error for ${eventName}:`, error);
    return undefined;
  }
};

/**
 * Sign-up method types
 */
export type SignUpMethod = 'google' | 'apple' | 'email';

/**
 * Initialize Firebase Analytics and enable analytics collection.
 * Call this once when the app starts.
 *
 * @returns Promise that resolves when analytics is initialized
 */
export const initializeAnalytics = async (): Promise<void> => {
  try {
    if (!isFirebaseReady()) {
      console.warn('⚠️ Firebase not initialized, skipping analytics setup');
      return;
    }

    await analytics().setAnalyticsCollectionEnabled(true);

    const appVersion = require('../../package.json').version;
    await analytics().setUserProperty('app_version', appVersion);
    await analytics().setUserProperty('platform', Platform.OS);
    
    console.log('✅ Firebase Analytics initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Analytics:', error);
  }
};

/**
 * Track first app open event.
 * This is automatically tracked by Firebase, but can be called explicitly
 * for additional custom logic.
 *
 * @example
 * await trackFirstOpen();
 */
export const trackFirstOpen = async (): Promise<void> => {
  return safeAnalytics(async () => {
    await analytics().logAppOpen();
    console.log('📊 Event tracked: first_open');
  }, 'trackFirstOpen');
};

/**
 * Track user sign-up event.
 * This is a Google Ads conversion event.
 *
 * @param method - The sign-up method used (google, apple, or email)
 *
 * @example
 * await trackSignUp('google');
 */
export const trackSignUp = async (method: SignUpMethod): Promise<void> => {
  return safeAnalytics(async () => {
    await analytics().logSignUp({ method });
    // Also track standard conversion event
    await analytics().logEvent('sign_up', { method });
    console.log(`📊 Event tracked: sign_up (method: ${method})`);
  }, 'trackSignUp');
};

/**
 * Track tutorial/onboarding completion event.
 * This is a Google Ads conversion event.
 *
 * @example
 * await trackTutorialComplete();
 */
export const trackTutorialComplete = async (): Promise<void> => {
  return safeAnalytics(async () => {
    await analytics().logTutorialComplete();
    // Also track standard conversion event for onboarding
    await analytics().logEvent('tutorial_complete');
    console.log('📊 Event tracked: tutorial_complete');
  }, 'trackTutorialComplete');
};

/**
 * Track trial subscription start event.
 *
 * @param trialDays - Number of days in the trial period
 *
 * @example
 * await trackStartTrial(7);
 */
export const trackStartTrial = async (trialDays: number = 7): Promise<void> => {
  return safeAnalytics(async () => {
    await analytics().logEvent('start_trial', {
      trial_days: trialDays,
    });
    console.log(`📊 Event tracked: start_trial (${trialDays} days)`);
  }, 'trackStartTrial');
};

/**
 * Track purchase/subscription event.
 * This is a Google Ads conversion event.
 *
 * @param value - Purchase amount (e.g., 4.99)
 * @param currency - Currency code (e.g., 'USD')
 * @param itemId - Product/subscription ID (e.g., 'premium_monthly')
 * @param itemName - Product/subscription name (e.g., 'Premium Monthly')
 *
 * @example
 * await trackPurchase(4.99, 'USD', 'premium_monthly', 'Premium Monthly');
 */
export const trackPurchase = async (
  value: number,
  currency: string,
  itemId: string,
  itemName: string
): Promise<void> => {
  return safeAnalytics(async () => {
    await analytics().logPurchase({
      value,
      currency,
      items: [
        {
          item_id: itemId,
          item_name: itemName,
          quantity: 1,
        },
      ],
    });
    console.log(`📊 Event tracked: purchase (${currency} ${value}, item: ${itemName})`);
  }, 'trackPurchase');
};

/**
 * Track payment info added event.
 * Indicates user added payment method (credit card, etc.).
 *
 * @example
 * await trackAddPaymentInfo();
 */
export const trackAddPaymentInfo = async (): Promise<void> => {
  return safeAnalytics(async () => {
    await analytics().logAddPaymentInfo();
    console.log('📊 Event tracked: add_payment_info');
  }, 'trackAddPaymentInfo');
};

/**
 * Track screen view event for navigation tracking.
 *
 * @param screenName - Name of the screen (e.g., 'Home', 'Settings')
 * @param screenClass - Class/component name of the screen
 *
 * @example
 * await trackScreenView('HomeScreen', 'HomeScreen');
 */
export const trackScreenView = async (
  screenName: string,
  screenClass: string
): Promise<void> => {
  return safeAnalytics(async () => {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass,
    });
    console.log(`📊 Screen viewed: ${screenName}`);
  }, 'trackScreenView');
};

/**
 * Track user login event.
 *
 * @param method - The login method used (google, apple, or email)
 *
 * @example
 * await trackLogin('google');
 */
export const trackLogin = async (method: SignUpMethod): Promise<void> => {
  return safeAnalytics(async () => {
    await analytics().logLogin({ method });
    console.log(`📊 Event tracked: login (method: ${method})`);
  }, 'trackLogin');
};

/**
 * Set user ID for analytics.
 * Call this after user signs in to associate events with specific users.
 *
 * @param userId - Unique user identifier
 *
 * @example
 * await setUserId('user123');
 */
export const setUserId = async (userId: string): Promise<void> => {
  return safeAnalytics(async () => {
    await analytics().setUserId(userId);
    console.log(`📊 User ID set: ${userId}`);
  }, 'setUserId');
};

/**
 * Set custom user property for analytics segmentation.
 *
 * @param name - Property name (e.g., 'subscription_status')
 * @param value - Property value (e.g., 'premium')
 *
 * @example
 * await setUserProperty('subscription_status', 'premium');
 */
export const setUserProperty = async (name: string, value: string): Promise<void> => {
  return safeAnalytics(async () => {
    await analytics().setUserProperty(name, value);
    console.log(`📊 User property set: ${name} = ${value}`);
  }, 'setUserProperty');
};

/**
 * Track custom event.
 * Use this for events not covered by standard Firebase events.
 *
 * @param eventName - Event name (lowercase with underscores)
 * @param parameters - Event parameters
 *
 * @example
 * await trackCustomEvent('meal_logged', { meal_type: 'breakfast', calories: 450 });
 */
export const trackCustomEvent = async (
  eventName: string,
  parameters?: { [key: string]: any }
): Promise<void> => {
  return safeAnalytics(async () => {
    await analytics().logEvent(eventName, parameters);
    console.log(`📊 Custom event tracked: ${eventName}`, parameters);
  }, 'trackCustomEvent');
};

/**
 * Enable/disable analytics collection.
 * Useful for respecting user privacy preferences.
 *
 * @param enabled - Whether to enable analytics
 *
 * @example
 * await setAnalyticsEnabled(false); // Disable analytics
 */
export const setAnalyticsEnabled = async (enabled: boolean): Promise<void> => {
  return safeAnalytics(async () => {
    await analytics().setAnalyticsCollectionEnabled(enabled);
    console.log(`📊 Analytics ${enabled ? 'enabled' : 'disabled'}`);
  }, 'setAnalyticsEnabled');
};

// Note: No default export needed - all functions above are self-contained
// and call analytics() internally only when they're invoked
