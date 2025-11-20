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
  currentUserId: string | null;
  
  // Actions
  initialize: (userId: string) => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
  checkTrialStatus: (userId?: string) => Promise<TrialInfo | null>;
  startTrial: (userId: string) => Promise<void>;
  purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  getAvailablePackages: () => Promise<PurchasesPackage[] | null>;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
  syncPurchases: () => Promise<void>;
  getSubscriptionInfo: () => {
    productIdentifier: string | null;
    expirationDate: string | null;
    willRenew: boolean;
    isActive: boolean;
    periodType: 'NORMAL' | 'TRIAL' | 'INTRO' | null;
  };
  openManageSubscription: () => Promise<void>;
  clearTrialData: () => Promise<void>;
}

const SUBSCRIPTION_STATUS_KEY = '@forma_subscription_status';
const TRIAL_START_DATE_KEY = '@forma_trial_start_date';
const TRIAL_END_DATE_KEY = '@forma_trial_end_date';
const CURRENT_USER_ID_KEY = '@forma_current_user_id';
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
  currentUserId: null,
  
  clearTrialData: async () => {
    try {
      await AsyncStorage.removeItem(TRIAL_START_DATE_KEY);
      await AsyncStorage.removeItem(TRIAL_END_DATE_KEY);
      await AsyncStorage.removeItem(CURRENT_USER_ID_KEY);
      set({ trialInfo: null });
    } catch (error) {
      console.error('Failed to clear trial data:', error);
    }
  },
  
  checkTrialStatus: async (userId?: string) => {
    try {
      const currentUserId = userId || get().currentUserId;
      
      // If no user ID provided, can't check trial status
      if (!currentUserId) {
        return null;
      }
      
      // Check if trial data belongs to current user
      const storedUserId = await AsyncStorage.getItem(CURRENT_USER_ID_KEY);
      
      // If user ID doesn't match, clear old trial data and return null
      if (storedUserId && storedUserId !== currentUserId) {
        console.log('User ID changed, clearing old trial data');
        await get().clearTrialData();
        return null;
      }
      
      const trialStartStr = await AsyncStorage.getItem(TRIAL_START_DATE_KEY);
      const trialEndStr = await AsyncStorage.getItem(TRIAL_END_DATE_KEY);
      
      // If trial hasn't been started yet, return null
      if (!trialStartStr || !trialEndStr) {
        return null;
      }
      
      // Verify this trial belongs to the current user
      if (storedUserId !== currentUserId) {
        // Trial data exists but doesn't belong to current user - clear it
        await get().clearTrialData();
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
  
  startTrial: async (userId: string) => {
    try {
      if (!userId) {
        console.error('Cannot start trial: user ID is required');
        return;
      }
      
      console.log('🎁 Starting trial for user:', userId);
      
      // Store current user ID to ensure trial data is user-specific
      await AsyncStorage.setItem(CURRENT_USER_ID_KEY, userId);
      set({ currentUserId: userId });
      
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
      
      console.log('✅ Trial started successfully:', trialInfo);
      
      set({
        trialInfo,
        subscriptionStatus: 'trial',
        isPremium: true, // Premium features active during trial
      });
      
      await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, 'trial');
      
      // Verify trial was saved correctly
      const verifyTrial = await get().checkTrialStatus(userId);
      console.log('🔍 Verification - trial status check:', verifyTrial);
    } catch (error) {
      console.error('Failed to start trial:', error);
    }
  },
  
  initialize: async (userId: string) => {
    try {
      // Store current user ID
      set({ currentUserId: userId });
      
      // Clear trial data if it belongs to a different user
      const storedUserId = await AsyncStorage.getItem(CURRENT_USER_ID_KEY);
      if (storedUserId && storedUserId !== userId) {
        console.log('Different user detected, clearing old trial data');
        await get().clearTrialData();
      }
      
      // Check trial status for this specific user
      const trialInfo = await get().checkTrialStatus(userId);
      
      // Check if trial is active (but don't auto-start for new users)
      if (trialInfo && trialInfo.isActive) {
        // Trial is active, grant premium access
        set({ 
          subscriptionStatus: 'trial', 
          isPremium: true,
          trialInfo 
        });
      } else if (trialInfo && !trialInfo.isActive) {
        // Trial expired, check if user has a subscription
        set({ trialInfo });
      } else {
        // No trial has been started - user starts as free tier
        set({ 
          subscriptionStatus: 'free', 
          isPremium: false,
          trialInfo: null 
        });
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
      
      // Update customerInfo
      const customerInfo = await Purchases.getCustomerInfo();
      set({ customerInfo });
      
      // Ensure user ID is stored
      await AsyncStorage.setItem(CURRENT_USER_ID_KEY, userId);
      
      // Re-check trial status now that user ID is confirmed
      const userTrialInfo = await get().checkTrialStatus(userId);
      if (userTrialInfo) {
        set({ trialInfo: userTrialInfo });
      }
      
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
        
        // Ensure currentUserId is set from customerInfo
        const customerUserId = customerInfo.originalAppUserId;
        if (customerUserId) {
          const currentStoreUserId = get().currentUserId;
          if (!currentStoreUserId || currentStoreUserId !== customerUserId) {
            set({ currentUserId: customerUserId });
            await AsyncStorage.setItem(CURRENT_USER_ID_KEY, customerUserId);
          }
        }
        
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
        
        // No active subscription - check trial status for current user
        let currentUserId = get().currentUserId || customerUserId;
        
        // If still no userId, try to get from stored key
        if (!currentUserId) {
          const storedUserId = await AsyncStorage.getItem(CURRENT_USER_ID_KEY);
          if (storedUserId) {
            currentUserId = storedUserId;
            set({ currentUserId });
          }
        }
        
        if (!currentUserId) {
          console.warn('⚠️ No user ID available to check trial status');
          // Check if there's an active trial in the store (might have been just set)
          const storeTrialInfo = get().trialInfo;
          if (storeTrialInfo && storeTrialInfo.isActive) {
            console.log('✅ Found active trial in store:', storeTrialInfo);
            set({
              subscriptionStatus: 'trial',
              isPremium: true,
              customerInfo,
              trialInfo: storeTrialInfo,
            });
            await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, 'trial');
            return;
          }
          
          set({
            subscriptionStatus: 'free',
            isPremium: false,
            customerInfo,
            trialInfo: null,
          });
          await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, 'free');
          return;
        }
        
        // Check stored status first - if it's trial, verify it's still active
        const storedStatus = await AsyncStorage.getItem(SUBSCRIPTION_STATUS_KEY);
        if (storedStatus === 'trial') {
          const trialInfo = await get().checkTrialStatus(currentUserId);
          if (trialInfo && trialInfo.isActive) {
            console.log('✅ Active trial found (from stored status):', trialInfo);
            set({
              subscriptionStatus: 'trial',
              isPremium: true,
              customerInfo,
              trialInfo,
            });
            return;
          } else {
            // Trial expired or not found - clear it
            console.log('⚠️ Stored trial status but trial not active - clearing');
            await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, 'free');
          }
        }
        
        const trialInfo = await get().checkTrialStatus(currentUserId);
        
        if (trialInfo && trialInfo.isActive) {
          // Trial is active, grant premium access
          console.log('✅ Active trial found:', trialInfo);
          set({
            subscriptionStatus: 'trial',
            isPremium: true,
            customerInfo,
            trialInfo,
          });
          await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, 'trial');
        } else {
          // No subscription and no active trial
          console.log('📊 No active trial - status set to free', { trialInfo, currentUserId, storedStatus });
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
          const currentUserId = get().currentUserId;
          const trialInfo = currentUserId ? await get().checkTrialStatus(currentUserId) : null;
          
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
      const currentUserId = get().currentUserId;
      const trialInfo = currentUserId ? await get().checkTrialStatus(currentUserId) : null;
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
        // Get current user ID before purchase
        let currentUserId = get().currentUserId;
        
        // Check if user has used their local trial before purchasing
        const currentTrialInfo = currentUserId ? await get().checkTrialStatus(currentUserId) : null;
        const hasUsedTrial = currentTrialInfo !== null;
        
        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
        
        // Ensure currentUserId is set from customerInfo
        if (customerInfo.originalAppUserId) {
          if (!currentUserId || currentUserId !== customerInfo.originalAppUserId) {
            currentUserId = customerInfo.originalAppUserId;
            set({ currentUserId });
            await AsyncStorage.setItem(CURRENT_USER_ID_KEY, currentUserId);
          }
        }
        
        const hasRealEntitlement = customerInfo.entitlements.active['premium'] !== undefined;
        
        // Check if this is a trial period from RevenueCat (only if real entitlement exists)
        const entitlement = customerInfo.entitlements.active['premium'];
        const isRevenueCatTrial = entitlement?.periodType === 'TRIAL' || entitlement?.isSandbox === true;
        
        let finalStatus: SubscriptionStatus;
        let finalIsPremium: boolean;
        let finalTrialInfo = currentTrialInfo;
        
        if (hasRealEntitlement) {
          // Has RevenueCat entitlement - use that
          finalStatus = isRevenueCatTrial ? 'trial' : 'premium';
          finalIsPremium = true;
        } else if (!hasUsedTrial && currentUserId) {
          // No RevenueCat entitlement but user hasn't used local trial - start local trial
          // This handles both test purchases and real purchases that don't have entitlements yet
          console.log('🎁 Purchase completed but no entitlements - starting local 3-day trial for user:', currentUserId);
          await get().startTrial(currentUserId);
          
          // Wait a moment for trial to be fully saved
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Verify trial was saved
          finalTrialInfo = await get().checkTrialStatus(currentUserId);
          if (!finalTrialInfo || !finalTrialInfo.isActive) {
            console.error('❌ Failed to start trial - retrying...');
            await get().startTrial(currentUserId);
            await new Promise(resolve => setTimeout(resolve, 200));
            finalTrialInfo = await get().checkTrialStatus(currentUserId);
          }
          
          console.log('✅ Trial started:', finalTrialInfo);
          
          if (finalTrialInfo && finalTrialInfo.isActive) {
            finalStatus = 'trial';
            finalIsPremium = true;
          } else {
            console.error('❌ Trial start failed - falling back to free');
            finalStatus = 'free';
            finalIsPremium = false;
          }
        } else {
          // No entitlements and trial already used
          console.log('📊 No entitlements and trial already used:', { hasUsedTrial, currentUserId });
          finalStatus = 'free';
          finalIsPremium = false;
        }
        
        set({
          subscriptionStatus: finalStatus,
          isPremium: finalIsPremium,
          customerInfo,
          trialInfo: finalTrialInfo || null,
        });
        
        await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, finalStatus);
        
        console.log('📊 Final subscription status after purchase:', {
          status: finalStatus,
          isPremium: finalIsPremium,
          trialInfo: finalTrialInfo,
          currentUserId,
        });
        
        return finalIsPremium;
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
  
  syncPurchases: async () => {
    try {
      // Check if Purchases is configured
      try {
        await Purchases.syncPurchases();
        // Refresh customer info after sync
        await get().checkSubscriptionStatus();
      } catch (purchasesError: any) {
        // If Purchases isn't configured, just return
        if (purchasesError.message?.includes('no singleton instance') ||
            purchasesError.message?.includes('not configured')) {
          console.warn('RevenueCat not configured. Cannot sync purchases.');
          return;
        } else {
          throw purchasesError;
        }
      }
    } catch (error) {
      console.error('Failed to sync purchases:', error);
    }
  },
  
  getSubscriptionInfo: () => {
    const state = get();
    const customerInfo = state.customerInfo;
    
    if (!customerInfo) {
      return {
        productIdentifier: null,
        expirationDate: null,
        willRenew: false,
        isActive: false,
        periodType: null as 'NORMAL' | 'TRIAL' | 'INTRO' | null,
      };
    }
    
    const entitlement = customerInfo.entitlements.active['premium'];
    
    if (!entitlement) {
      return {
        productIdentifier: null,
        expirationDate: null,
        willRenew: false,
        isActive: false,
        periodType: null as 'NORMAL' | 'TRIAL' | 'INTRO' | null,
      };
    }
    
    // Type-safe period type conversion
    const periodType = entitlement.periodType;
    let typedPeriodType: 'NORMAL' | 'TRIAL' | 'INTRO' | null = null;
    if (periodType === 'NORMAL' || periodType === 'TRIAL' || periodType === 'INTRO') {
      typedPeriodType = periodType;
    }
    
    return {
      productIdentifier: entitlement.productIdentifier || null,
      expirationDate: entitlement.expirationDate || null,
      willRenew: entitlement.willRenew ?? false,
      isActive: true,
      periodType: typedPeriodType,
    };
  },
  
  openManageSubscription: async () => {
    try {
      // Check if Purchases is configured
      try {
        // RevenueCat provides a method to open the platform's subscription management
        // On iOS: Opens App Store subscription management
        // On Android: Opens Google Play subscription management
        const platform = require('react-native').Platform.OS;
        const { Linking } = require('react-native');
        
        if (platform === 'ios') {
          // iOS App Store subscription management URL
          await Linking.openURL('https://apps.apple.com/account/subscriptions');
        } else if (platform === 'android') {
          // Android Google Play subscription management URL
          // This requires the package name - using a generic approach
          await Linking.openURL('https://play.google.com/store/account/subscriptions?package=YOUR_PACKAGE_NAME&sku=YOUR_SKU');
          // Note: Replace YOUR_PACKAGE_NAME and YOUR_SKU with actual values
          // Alternative: Use RevenueCat's manage account if available
        }
      } catch (purchasesError: any) {
        // If Purchases isn't configured, show manual instructions
        if (purchasesError.message?.includes('no singleton instance') ||
            purchasesError.message?.includes('not configured')) {
          throw new Error('Please manage your subscription through your device\'s App Store or Google Play settings.');
        } else {
          throw purchasesError;
        }
      }
    } catch (error: any) {
      console.error('Failed to open subscription management:', error);
      throw error;
    }
  },
}));

