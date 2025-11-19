// Subscription Limits Utility
// Handles free tier limits and premium feature checks

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscriptionStore } from '../store/useSubscriptionStore';

const PHOTO_SCANS_KEY = '@forma_photo_scans';
const PHOTO_SCANS_DATE_KEY = '@forma_photo_scans_date';

export interface SubscriptionLimits {
  maxPhotoScansPerDay: number;
  maxHistoryDays: number;
  allowBarcodeScanning: boolean;
  allowAdvancedAnalytics: boolean;
  allowRecipeBuilder: boolean;
  allowDataExport: boolean;
}

/**
 * Get subscription limits based on user's subscription status
 */
export const getSubscriptionLimits = (): SubscriptionLimits => {
  const { isPremium } = useSubscriptionStore.getState();
  
  if (isPremium) {
    return {
      maxPhotoScansPerDay: Infinity,
      maxHistoryDays: Infinity,
      allowBarcodeScanning: true,
      allowAdvancedAnalytics: true,
      allowRecipeBuilder: true,
      allowDataExport: true,
    };
  }
  
  // Free tier limits
  return {
    maxPhotoScansPerDay: 5,
    maxHistoryDays: 7,
    allowBarcodeScanning: false, // Limited in free tier
    allowAdvancedAnalytics: false,
    allowRecipeBuilder: true, // Recipe builder is available in free tier
    allowDataExport: false,
  };
};

/**
 * Check if user can perform a photo scan
 */
export const canPerformPhotoScan = async (): Promise<boolean> => {
  const { isPremium } = useSubscriptionStore.getState();
  
  if (isPremium) {
    return true;
  }
  
  // Check daily limit for free users
  const today = new Date().toISOString().split('T')[0];
  const lastScanDate = await AsyncStorage.getItem(PHOTO_SCANS_DATE_KEY);
  const scanCountStr = await AsyncStorage.getItem(PHOTO_SCANS_KEY);
  
  if (lastScanDate !== today) {
    // New day, reset count
    await AsyncStorage.setItem(PHOTO_SCANS_KEY, '0');
    await AsyncStorage.setItem(PHOTO_SCANS_DATE_KEY, today);
    return true;
  }
  
  const scanCount = parseInt(scanCountStr || '0', 10);
  return scanCount < 5;
};

/**
 * Record a photo scan
 */
export const recordPhotoScan = async (): Promise<void> => {
  const { isPremium } = useSubscriptionStore.getState();
  
  if (isPremium) {
    return; // No limit for premium
  }
  
  const today = new Date().toISOString().split('T')[0];
  const lastScanDate = await AsyncStorage.getItem(PHOTO_SCANS_DATE_KEY);
  const scanCountStr = await AsyncStorage.getItem(PHOTO_SCANS_KEY);
  
  if (lastScanDate !== today) {
    // New day, reset count
    await AsyncStorage.setItem(PHOTO_SCANS_KEY, '1');
    await AsyncStorage.setItem(PHOTO_SCANS_DATE_KEY, today);
  } else {
    const scanCount = parseInt(scanCountStr || '0', 10);
    await AsyncStorage.setItem(PHOTO_SCANS_KEY, (scanCount + 1).toString());
  }
};

/**
 * Get remaining photo scans for today
 */
export const getRemainingPhotoScans = async (): Promise<number> => {
  const { isPremium } = useSubscriptionStore.getState();
  
  if (isPremium) {
    return Infinity;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const lastScanDate = await AsyncStorage.getItem(PHOTO_SCANS_DATE_KEY);
  const scanCountStr = await AsyncStorage.getItem(PHOTO_SCANS_KEY);
  
  if (lastScanDate !== today) {
    return 5; // New day, full quota
  }
  
  const scanCount = parseInt(scanCountStr || '0', 10);
  return Math.max(0, 5 - scanCount);
};

/**
 * Check if date is within history limit
 */
export const isDateWithinHistoryLimit = (date: Date): boolean => {
  const { isPremium } = useSubscriptionStore.getState();
  
  if (isPremium) {
    return true;
  }
  
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff <= 7;
};

