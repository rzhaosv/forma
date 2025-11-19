// Subscription Store
// Manages subscription state and premium features

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

// Helper to detect if we should use Test Store key
// In Expo Go, RevenueCat requires Test Store API key
const shouldUseTestStore = () => {
  try {
    // Check if we're in Expo Go
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // Try to detect Expo Go environment
      try {
        const Constants = require('expo-constants');
        return Constants.executionEnvironment === 'storeClient';
      } catch {
        // If we can't detect, assume we might be in Expo Go
        // User should configure Test Store key if needed
        return false;
      }
    }
    return false;
  } catch {
    return false;
  }
};

export type SubscriptionStatus = 'free' | 'premium' | 'trial' | 'loading' | 'error';

interface TrialInfo {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  daysRemaining: number;
  isActive: boolean;
}

interface SubscriptionState {
  subscriptionStatus: SubscriptionStatus;
  isPremium: boolean;
  customerInfo: CustomerInfo | null;
  availablePackages: PurchasesPackage[] | null;
  trialInfo: TrialInfo | null;
  
  // Actions
  initialize: (userId: string) => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
  checkTrialStatus: () => Promise<TrialInfo | null>;
  startTrial: () => Promise<void>;
  purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  getAvailablePackages: () => Promise<PurchasesPackage[] | null>;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
}

const SUBSCRIPTION_STATUS_KEY = '@forma_subscription_status';
const TRIAL_START_DATE_KEY = '@forma_trial_start_date';
const TRIAL_END_DATE_KEY = '@forma_trial_end_date';
const TRIAL_DURATION_DAYS = 3;
// RevenueCat API Keys
// TODO: Replace with your actual RevenueCat API keys from the dashboard
// Get them from: https://app.revenuecat.com → Your Project → API Keys
// For Expo Go development, use Test Store API key: https://rev.cat/sdk-test-store
const REVENUECAT_API_KEY = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || 'appl_YOUR_IOS_API_KEY',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || 'goog_YOUR_ANDROID_API_KEY',
  // Test Store API key for Expo Go development
  testStore: process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY || 'rcb_YOUR_TEST_STORE_KEY',
};

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptionStatus: 'loading',
  isPremium: false,
  customerInfo: null,
  availablePackages: null,
  trialInfo: null,
  
  checkTrialStatus: async () => {
    try {
      const trialStartStr = await AsyncStorage.getItem(TRIAL_START_DATE_KEY);
      const trialEndStr = await AsyncStorage.getItem(TRIAL_END_DATE_KEY);
      
      // If trial hasn't been started yet, return null
      if (!trialStartStr || !trialEndStr) {
        return null;
      }
      
      // Parse dates - handle both JSON stringified and plain ISO strings
      let trialStartDate: Date;
      let trialEndDate: Date;
      
      try {
        // Try parsing as JSON first (in case it was stringified)
        const startParsed = JSON.parse(trialStartStr);
        const endParsed = JSON.parse(trialEndStr);
        trialStartDate = new Date(startParsed);
        trialEndDate = new Date(endParsed);
      } catch {
        // If not JSON, try direct parsing
        trialStartDate = new Date(trialStartStr);
        trialEndDate = new Date(trialEndStr);
      }
      
      // Validate dates
      if (isNaN(trialStartDate.getTime()) || isNaN(trialEndDate.getTime())) {
        console.warn('Invalid trial dates stored, clearing trial data');
        await AsyncStorage.removeItem(TRIAL_START_DATE_KEY);
        await AsyncStorage.removeItem(TRIAL_END_DATE_KEY);
        return null;
      }
      
      const now = new Date();
      
      const isActive = now < trialEndDate;
      const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      const trialInfo: TrialInfo = {
        startDate: trialStartDate.toISOString(),
        endDate: trialEndDate.toISOString(),
        daysRemaining,
        isActive,
      };
      
      set({ trialInfo });
      return trialInfo;
    } catch (error) {
      console.error('Failed to check trial status:', error);
      // Clear invalid trial data
      try {
        await AsyncStorage.removeItem(TRIAL_START_DATE_KEY);
        await AsyncStorage.removeItem(TRIAL_END_DATE_KEY);
      } catch (clearError) {
        console.error('Failed to clear invalid trial data:', clearError);
      }
      return null;
    }
  },
  
  startTrial: async () => {
    try {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + TRIAL_DURATION_DAYS);
      
      // Store dates as ISO strings (not JSON stringified)
      const trialStartStr = now.toISOString();
      const trialEndStr = endDate.toISOString();
      
      await AsyncStorage.setItem(TRIAL_START_DATE_KEY, trialStartStr);
      await AsyncStorage.setItem(TRIAL_END_DATE_KEY, trialEndStr);
      
      const trialInfo: TrialInfo = {
        startDate: trialStartStr,
        endDate: trialEndStr,
        daysRemaining: TRIAL_DURATION_DAYS,
        isActive: true,
      };
      
      set({
        trialInfo,
        subscriptionStatus: 'trial',
        isPremium: true, // Premium features active during trial
      });
      
      await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, 'trial');
    } catch (error) {
      console.error('Failed to start trial:', error);
    }
  },
  
  initialize: async (userId: string) => {
    try {
      // Check trial status first
      const trialInfo = await get().checkTrialStatus();
      
      // If no trial has been started, start it automatically for new users
      if (!trialInfo) {
        await get().startTrial();
        // Continue with RevenueCat initialization after starting trial
      } else if (trialInfo.isActive) {
        // Trial is active, grant premium access
        set({ 
          subscriptionStatus: 'trial', 
          isPremium: true,
          trialInfo 
        });
      } else {
        // Trial expired, check if user has a subscription
        set({ trialInfo });
      }
      
      // Initialize RevenueCat
      const platform = require('react-native').Platform.OS;
      let apiKey: string | null = null;
      
      // In development, try Test Store key first (required for Expo Go)
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        if (!REVENUECAT_API_KEY.testStore.includes('YOUR_') && REVENUECAT_API_KEY.testStore.length > 10) {
          apiKey = REVENUECAT_API_KEY.testStore;
          console.log('📱 Using RevenueCat Test Store API key (development mode)');
        }
      }
      
      // If no Test Store key or not in dev, use platform-specific keys
      if (!apiKey) {
        apiKey = platform === 'ios' ? REVENUECAT_API_KEY.ios : REVENUECAT_API_KEY.android;
      }
      
      // Check if API key is configured
      if (!apiKey || apiKey.includes('YOUR_') || apiKey.length < 10) {
        console.warn('⚠️ RevenueCat API key not configured.');
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.warn('💡 For Expo Go, get Test Store key: https://rev.cat/sdk-test-store');
          console.warn('   Set EXPO_PUBLIC_REVENUECAT_TEST_KEY=rcb_... in your .env file');
        }
        // Don't set to free if trial is active - trial should work without RevenueCat
        if (!trialInfo || !trialInfo.isActive) {
          set({ subscriptionStatus: 'free', isPremium: false });
        }
        return;
      }
      
      await Purchases.configure({ apiKey });
      
      // Set user ID for RevenueCat
      await Purchases.logIn(userId);
      
      // Check subscription status (this will override trial if user has active subscription)
      await get().checkSubscriptionStatus();
      
      // Get available packages
      await get().getAvailablePackages();
    } catch (error: any) {
      console.error('❌ Failed to initialize RevenueCat:', error);
      
      // If error mentions Expo Go, suggest Test Store key
      if (error.message?.includes('not available when running inside Expo Go') ||
          error.message?.includes('Test Store')) {
        console.warn('⚠️ RevenueCat requires Test Store API key in Expo Go.');
        console.warn('💡 Get your Test Store key: https://rev.cat/sdk-test-store');
        console.warn('   Then set: EXPO_PUBLIC_REVENUECAT_TEST_KEY=rcb_...');
      }
      
      // If trial is active, keep premium access even if RevenueCat fails
      const currentTrial = get().trialInfo;
      if (currentTrial && currentTrial.isActive) {
        console.warn('⚠️ RevenueCat failed but trial is active. Using premium features.');
        return;
      }
      
      // Default to free tier if initialization fails and no active trial
      console.warn('⚠️ Using free tier. RevenueCat features will be limited.');
      set({ subscriptionStatus: 'free', isPremium: false });
    }
  },
  
  checkSubscriptionStatus: async () => {
    try {
      // Check if Purchases is configured
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        
        const hasActiveSubscription = customerInfo.entitlements.active['premium'] !== undefined;
        
        // If user has active subscription, use that (overrides trial)
        if (hasActiveSubscription) {
          const isTrial = customerInfo.entitlements.active['premium']?.isSandbox === true ||
                          customerInfo.entitlements.active['premium']?.willRenew === false;
          
          const status: SubscriptionStatus = isTrial ? 'trial' : 'premium';
          
          set({
            subscriptionStatus: status,
            isPremium: true,
            customerInfo,
          });
          
          await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, status);
          return;
        }
        
        // No active subscription - check trial status
        const trialInfo = await get().checkTrialStatus();
        
        if (trialInfo && trialInfo.isActive) {
          // Trial is active, grant premium access
          set({
            subscriptionStatus: 'trial',
            isPremium: true,
            customerInfo,
            trialInfo,
          });
          await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, 'trial');
        } else {
          // No subscription and no active trial
          set({
            subscriptionStatus: 'free',
            isPremium: false,
            customerInfo,
            trialInfo: trialInfo || null,
          });
          await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, 'free');
        }
      } catch (purchasesError: any) {
        // If Purchases isn't configured, check trial status
        if (purchasesError.message?.includes('no singleton instance') ||
            purchasesError.message?.includes('not configured')) {
          const trialInfo = await get().checkTrialStatus();
          
          if (trialInfo && trialInfo.isActive) {
            // Trial is active even without RevenueCat
            set({ 
              subscriptionStatus: 'trial', 
              isPremium: true,
              trialInfo 
            });
          } else {
            set({ subscriptionStatus: 'free', isPremium: false, trialInfo: trialInfo || null });
          }
        } else {
          throw purchasesError;
        }
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      // Fall back to trial check
      const trialInfo = await get().checkTrialStatus();
      if (trialInfo && trialInfo.isActive) {
        set({ subscriptionStatus: 'trial', isPremium: true, trialInfo });
      } else {
        set({ subscriptionStatus: 'free', isPremium: false, trialInfo: trialInfo || null });
      }
    }
  },
  
  purchasePackage: async (packageToPurchase: PurchasesPackage) => {
    try {
      // Check if Purchases is configured
      try {
        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
        
        let isPremium = customerInfo.entitlements.active['premium'] !== undefined;
        
        // In Test Store, "Test Valid Purchase" might complete but not set entitlements
        // If purchase completed successfully but no entitlements, grant premium for testing
        if (!isPremium && typeof __DEV__ !== 'undefined' && __DEV__) {
          // Check if we're using Test Store (indicated by testStore key being used)
          const isUsingTestStore = REVENUECAT_API_KEY.testStore && 
                                   !REVENUECAT_API_KEY.testStore.includes('YOUR_');
          
          if (isUsingTestStore) {
            // Purchase completed successfully in Test Store but no entitlements
            // This is likely "Test Valid Purchase" - grant premium for testing
            console.log('✅ Test Store: Valid purchase detected, granting premium for testing');
            isPremium = true;
          }
        }
        
        const status: SubscriptionStatus = isPremium ? 'premium' : 'free';
        
        set({
          subscriptionStatus: status,
          isPremium,
          customerInfo,
        });
        
        await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, status);
        
        return isPremium;
      } catch (purchasesError: any) {
        // If Purchases isn't configured, show helpful error
        if (purchasesError.message?.includes('no singleton instance') ||
            purchasesError.message?.includes('not configured')) {
          throw new Error('RevenueCat is not configured. Please set up your API keys.');
        } else {
          throw purchasesError;
        }
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      
      // User cancelled - don't treat as error
      if (error.userCancelled) {
        return false;
      }
      
      // Test Store "failed purchase" scenario (code 5) - this is intentional for testing
      // Don't grant premium access for failed purchases
      if (error.code === '5' || 
          (error.message?.includes('Test purchase failure') && 
           error.message?.includes('no real transaction occurred'))) {
        console.log('⚠️ Test Store: Failed purchase scenario (this is expected for testing)');
        // Don't grant premium - this is the "failed purchase" test case
        return false;
      }
      
      // For other errors, throw to show to user
      throw error;
    }
  },
  
  restorePurchases: async () => {
    try {
      // Check if Purchases is configured
      try {
        const customerInfo = await Purchases.restorePurchases();
        
        const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
        const status: SubscriptionStatus = isPremium ? 'premium' : 'free';
        
        set({
          subscriptionStatus: status,
          isPremium,
          customerInfo,
        });
        
        await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, status);
        
        return isPremium;
      } catch (purchasesError: any) {
        // If Purchases isn't configured, return false
        if (purchasesError.message?.includes('no singleton instance') ||
            purchasesError.message?.includes('not configured')) {
          console.warn('RevenueCat not configured. Cannot restore purchases.');
          return false;
        } else {
          throw purchasesError;
        }
      }
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return false;
    }
  },
  
  getAvailablePackages: async () => {
    try {
      // Check if Purchases is configured
      try {
        const offerings = await Purchases.getOfferings();
        
        if (offerings.current !== null) {
          const packages = offerings.current.availablePackages;
          set({ availablePackages: packages });
          return packages;
        }
        
        return null;
      } catch (purchasesError: any) {
        // If Purchases isn't configured, return null
        if (purchasesError.message?.includes('no singleton instance') ||
            purchasesError.message?.includes('not configured')) {
          console.warn('RevenueCat not configured. Packages unavailable.');
          return null;
        } else {
          throw purchasesError;
        }
      }
    } catch (error) {
      console.error('Failed to get available packages:', error);
      return null;
    }
  },
  
  setSubscriptionStatus: (status: SubscriptionStatus) => {
    set({ 
      subscriptionStatus: status,
      isPremium: status === 'premium' || status === 'trial',
    });
  },
}));

