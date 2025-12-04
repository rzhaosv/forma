// Ad Service
// Handles Google AdMob integration for displaying ads to free users

import { Platform } from 'react-native';

// AdMob App IDs (replace with your actual IDs before production)
// These are test IDs for development
export const ADMOB_APP_ID = Platform.select({
  ios: 'ca-app-pub-5844884651380174~4273331628', // Live App ID
  android: 'ca-app-pub-3940256099942544~3347511713', // Test App ID
});

// Ad Unit IDs
// Using test ad unit IDs for development - replace with real ones for production
export const AD_UNIT_IDS = {
  banner: Platform.select({
    ios: 'ca-app-pub-5844884651380174~4273331628', // Live Banner ID
    android: 'ca-app-pub-5844884651380174~4273331628', // Live Banner ID
  }) || '',
  interstitial: Platform.select({
    ios: 'ca-app-pub-5844884651380174~4273331628', // Live Interstitial ID
    android: 'ca-app-pub-5844884651380174/1911618518', // Test Interstitial ID
  }) || '',
  rewarded: Platform.select({
    ios: 'ca-app-pub-5844884651380174~4273331628', // Test Rewarded ID
    android: 'ca-app-pub-5844884651380174/2955562286', // Test Rewarded ID
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

