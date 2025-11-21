// HealthKit Settings Utility
// Manages user preferences for HealthKit sync

import AsyncStorage from '@react-native-async-storage/async-storage';

const HEALTHKIT_ENABLED_KEY = '@forma_healthkit_enabled';
const HEALTHKIT_SYNC_WEIGHT_KEY = '@forma_healthkit_sync_weight';
const HEALTHKIT_SYNC_MEALS_KEY = '@forma_healthkit_sync_meals';

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

