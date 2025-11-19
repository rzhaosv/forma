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

interface SubscriptionState {
  subscriptionStatus: SubscriptionStatus;
  isPremium: boolean;
  customerInfo: CustomerInfo | null;
  availablePackages: PurchasesPackage[] | null;
  
  // Actions
  initialize: (userId: string) => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
  purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  getAvailablePackages: () => Promise<PurchasesPackage[] | null>;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
}

const SUBSCRIPTION_STATUS_KEY = '@forma_subscription_status';
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
  
  initialize: async (userId: string) => {
    try {
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
        console.warn('⚠️ RevenueCat API key not configured. Using free tier.');
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.warn('💡 For Expo Go, get Test Store key: https://rev.cat/sdk-test-store');
          console.warn('   Set EXPO_PUBLIC_REVENUECAT_TEST_KEY=rcb_... in your .env file');
        }
        set({ subscriptionStatus: 'free', isPremium: false });
        return;
      }
      
      await Purchases.configure({ apiKey });
      
      // Set user ID for RevenueCat
      await Purchases.logIn(userId);
      
      // Check subscription status
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
      
      // Default to free tier if initialization fails
      console.warn('⚠️ Using free tier. RevenueCat features will be limited.');
      set({ subscriptionStatus: 'free', isPremium: false });
    }
  },
  
  checkSubscriptionStatus: async () => {
    try {
      // Check if Purchases is configured
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        
        const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
        const isTrial = customerInfo.entitlements.active['premium']?.isSandbox === true ||
                        customerInfo.entitlements.active['premium']?.willRenew === false;
        
        let status: SubscriptionStatus = 'free';
        if (isPremium) {
          status = isTrial ? 'trial' : 'premium';
        }
        
        set({
          subscriptionStatus: status,
          isPremium,
          customerInfo,
        });
        
        // Persist status
        await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, status);
      } catch (purchasesError: any) {
        // If Purchases isn't configured, default to free
        if (purchasesError.message?.includes('no singleton instance') ||
            purchasesError.message?.includes('not configured')) {
          console.warn('RevenueCat not configured. Using free tier.');
          set({ subscriptionStatus: 'free', isPremium: false });
        } else {
          throw purchasesError;
        }
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      set({ subscriptionStatus: 'free', isPremium: false });
    }
  },
  
  purchasePackage: async (packageToPurchase: PurchasesPackage) => {
    try {
      // Check if Purchases is configured
      try {
        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
        
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
      
      // User cancelled
      if (error.userCancelled) {
        return false;
      }
      
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

