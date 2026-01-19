// Fitness Integration Settings Utility
// Manages user preferences for HealthKit (iOS) and Google Fit (Android) sync

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// HealthKit keys (iOS)
const HEALTHKIT_ENABLED_KEY = '@nutrisnap_healthkit_enabled';
const HEALTHKIT_SYNC_WEIGHT_KEY = '@nutrisnap_healthkit_sync_weight';
const HEALTHKIT_SYNC_MEALS_KEY = '@nutrisnap_healthkit_sync_meals';
const HEALTHKIT_SYNC_EXERCISE_KEY = '@nutrisnap_healthkit_sync_exercise';

// Google Fit keys (Android)
const GOOGLEFIT_ENABLED_KEY = '@nutrisnap_googlefit_enabled';
const GOOGLEFIT_SYNC_WEIGHT_KEY = '@nutrisnap_googlefit_sync_weight';
const GOOGLEFIT_SYNC_MEALS_KEY = '@nutrisnap_googlefit_sync_meals';
const GOOGLEFIT_SYNC_STEPS_KEY = '@nutrisnap_googlefit_sync_steps';
const GOOGLEFIT_SYNC_EXERCISE_KEY = '@nutrisnap_googlefit_sync_exercise';

/**
 * Check if HealthKit sync is enabled
 */
export const isHealthKitEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(HEALTHKIT_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking HealthKit enabled status:', error);
    return false;
  }
};

/**
 * Set HealthKit sync enabled/disabled
 */
export const setHealthKitEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(HEALTHKIT_ENABLED_KEY, enabled.toString());
  } catch (error) {
    console.error('Error setting HealthKit enabled status:', error);
  }
};

/**
 * Check if weight sync is enabled
 */
export const isWeightSyncEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(HEALTHKIT_SYNC_WEIGHT_KEY);
    return enabled !== 'false'; // Default to true if not set
  } catch (error) {
    console.error('Error checking weight sync status:', error);
    return true;
  }
};

/**
 * Set weight sync enabled/disabled
 */
export const setWeightSyncEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(HEALTHKIT_SYNC_WEIGHT_KEY, enabled.toString());
  } catch (error) {
    console.error('Error setting weight sync status:', error);
  }
};

/**
 * Check if meal sync is enabled
 */
export const isMealSyncEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(HEALTHKIT_SYNC_MEALS_KEY);
    return enabled !== 'false'; // Default to true if not set
  } catch (error) {
    console.error('Error checking meal sync status:', error);
    return true;
  }
};

/**
 * Set meal sync enabled/disabled
 */
export const setMealSyncEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(HEALTHKIT_SYNC_MEALS_KEY, enabled.toString());
  } catch (error) {
    console.error('Error setting meal sync status:', error);
  }
};

/**
 * Check if exercise sync is enabled (HealthKit)
 */
export const isExerciseSyncEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(HEALTHKIT_SYNC_EXERCISE_KEY);
    return enabled !== 'false'; // Default to true if not set
  } catch (error) {
    console.error('Error checking exercise sync status:', error);
    return true;
  }
};

/**
 * Set exercise sync enabled/disabled (HealthKit)
 */
export const setExerciseSyncEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(HEALTHKIT_SYNC_EXERCISE_KEY, enabled.toString());
  } catch (error) {
    console.error('Error setting exercise sync status:', error);
  }
};

// ==================== GOOGLE FIT SETTINGS (Android) ====================

/**
 * Check if Google Fit sync is enabled
 */
export const isGoogleFitEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(GOOGLEFIT_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking Google Fit enabled status:', error);
    return false;
  }
};

/**
 * Set Google Fit sync enabled/disabled
 */
export const setGoogleFitEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(GOOGLEFIT_ENABLED_KEY, enabled.toString());
  } catch (error) {
    console.error('Error setting Google Fit enabled status:', error);
  }
};

/**
 * Check if Google Fit weight sync is enabled
 */
export const isGoogleFitWeightSyncEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(GOOGLEFIT_SYNC_WEIGHT_KEY);
    return enabled !== 'false'; // Default to true if not set
  } catch (error) {
    console.error('Error checking Google Fit weight sync status:', error);
    return true;
  }
};

/**
 * Set Google Fit weight sync enabled/disabled
 */
export const setGoogleFitWeightSyncEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(GOOGLEFIT_SYNC_WEIGHT_KEY, enabled.toString());
  } catch (error) {
    console.error('Error setting Google Fit weight sync status:', error);
  }
};

/**
 * Check if Google Fit meal sync is enabled
 */
export const isGoogleFitMealSyncEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(GOOGLEFIT_SYNC_MEALS_KEY);
    return enabled !== 'false'; // Default to true if not set
  } catch (error) {
    console.error('Error checking Google Fit meal sync status:', error);
    return true;
  }
};

/**
 * Set Google Fit meal sync enabled/disabled
 */
export const setGoogleFitMealSyncEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(GOOGLEFIT_SYNC_MEALS_KEY, enabled.toString());
  } catch (error) {
    console.error('Error setting Google Fit meal sync status:', error);
  }
};

/**
 * Check if Google Fit steps sync is enabled
 */
export const isGoogleFitStepsSyncEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(GOOGLEFIT_SYNC_STEPS_KEY);
    return enabled !== 'false'; // Default to true if not set
  } catch (error) {
    console.error('Error checking Google Fit steps sync status:', error);
    return true;
  }
};

/**
 * Set Google Fit steps sync enabled/disabled
 */
export const setGoogleFitStepsSyncEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(GOOGLEFIT_SYNC_STEPS_KEY, enabled.toString());
  } catch (error) {
    console.error('Error setting Google Fit steps sync status:', error);
  }
};

/**
 * Check if Google Fit exercise sync is enabled
 */
export const isGoogleFitExerciseSyncEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(GOOGLEFIT_SYNC_EXERCISE_KEY);
    return enabled !== 'false'; // Default to true if not set
  } catch (error) {
    console.error('Error checking Google Fit exercise sync status:', error);
    return true;
  }
};

/**
 * Set Google Fit exercise sync enabled/disabled
 */
export const setGoogleFitExerciseSyncEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(GOOGLEFIT_SYNC_EXERCISE_KEY, enabled.toString());
  } catch (error) {
    console.error('Error setting Google Fit exercise sync status:', error);
  }
};

// ==================== CROSS-PLATFORM HELPERS ====================

/**
 * Check if fitness integration is enabled (platform-aware)
 */
export const isFitnessIntegrationEnabled = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return isHealthKitEnabled();
  } else if (Platform.OS === 'android') {
    return isGoogleFitEnabled();
  }
  return false;
};

/**
 * Get the fitness platform name
 */
export const getFitnessPlatformName = (): string => {
  if (Platform.OS === 'ios') {
    return 'Apple Health';
  } else if (Platform.OS === 'android') {
    return 'Google Fit';
  }
  return 'Fitness';
};

