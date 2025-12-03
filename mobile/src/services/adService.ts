// Ad Service
// Handles Google AdMob integration for displaying ads to free users

import { Platform } from 'react-native';

// AdMob App IDs (replace with your actual IDs before production)
// These are test IDs for development
export const ADMOB_APP_ID = Platform.select({
  ios: 'ca-app-pub-3940256099942544~1458002511', // Test App ID
  android: 'ca-app-pub-3940256099942544~3347511713', // Test App ID
});

// Ad Unit IDs
// Using test ad unit IDs for development - replace with real ones for production
export const AD_UNIT_IDS = {
  banner: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716', // Test Banner ID
    android: 'ca-app-pub-3940256099942544/6300978111', // Test Banner ID
  }) || '',
  interstitial: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910', // Test Interstitial ID
    android: 'ca-app-pub-3940256099942544/1033173712', // Test Interstitial ID
  }) || '',
  rewarded: Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313', // Test Rewarded ID
    android: 'ca-app-pub-3940256099942544/5224354917', // Test Rewarded ID
  }) || '',
};

// Check if ads should be shown (only for free users)
export const shouldShowAds = (isPremium: boolean): boolean => {
  return !isPremium;
};

// Ad placement locations
export type AdPlacement = 
  | 'home_bottom'
  | 'camera_bottom'
  | 'meal_detail'
  | 'progress_screen'
  | 'recipe_list';

// Track ad impressions (for analytics)
let adImpressions: Record<AdPlacement, number> = {
  home_bottom: 0,
  camera_bottom: 0,
  meal_detail: 0,
  progress_screen: 0,
  recipe_list: 0,
};

export const recordAdImpression = (placement: AdPlacement): void => {
  adImpressions[placement]++;
  console.log(`📊 Ad impression recorded: ${placement} (total: ${adImpressions[placement]})`);
};

export const getAdImpressions = (): Record<AdPlacement, number> => {
  return { ...adImpressions };
};

