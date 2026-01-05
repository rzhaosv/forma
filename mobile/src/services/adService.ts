// Ad Service
// Handles Google AdMob integration for displaying ads to free users

import { Platform } from 'react-native';

// AdMob App IDs (replace with your actual IDs before production)
// These are test IDs for development
export const ADMOB_APP_ID = Platform.select({
  ios: 'ca-app-pub-5844884651380174~4273331628', // Live App ID
  android: 'ca-app-pub-5844884651380174~8167765982', // Live App ID
});

// Ad Unit IDs - Production IDs for App Store submission
export const AD_UNIT_IDS = {
  banner: Platform.select({
    ios: 'ca-app-pub-5844884651380174/2726531003', // Production Banner ID
    android: 'ca-app-pub-5844884651380174/4097299661', // Production Banner ID
  }) || '',
  interstitial: Platform.select({
    ios: 'ca-app-pub-5844884651380174/8540849859', // Production Interstitial ID
    android: 'ca-app-pub-5844884651380174/1911618518', // Production Interstitial ID
  }) || '',
  rewarded: Platform.select({
    ios: 'ca-app-pub-5844884651380174/5355168713', // Production Rewarded ID
    android: 'ca-app-pub-5844884651380174/2955562286', // Production Rewarded ID
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

