// HealthKit Service
// Handles reading and writing health data to/from Apple HealthKit using expo-health-kit

import { Platform } from 'react-native';
import * as HealthKit from 'expo-health-kit';

/**
 * Check if HealthKit is available on this device
 */
export const isHealthKitAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    return false;
  }
  try {
    return await HealthKit.isAvailableAsync();
  } catch (error) {
    console.error('Error checking HealthKit availability:', error);
    return false;
  }
};

/**
 * Request HealthKit permissions
 */
export const requestHealthKitPermissions = async (): Promise<boolean> => {
  try {
    const available = await isHealthKitAvailable();
    if (!available) {
      throw new Error('HealthKit is not available on this device');
    }

    const readPermissions = [
      HealthKit.HealthDataType.BodyMass,
      HealthKit.HealthDataType.Height,
      HealthKit.HealthDataType.StepCount,
      HealthKit.HealthDataType.ActiveEnergyBurned,
      HealthKit.HealthDataType.DietaryEnergyConsumed,
    ];

    const writePermissions = [
      HealthKit.HealthDataType.BodyMass,
      HealthKit.HealthDataType.DietaryEnergyConsumed,
      HealthKit.HealthDataType.DietaryProtein,
      HealthKit.HealthDataType.DietaryCarbohydrates,
      HealthKit.HealthDataType.DietaryFatTotal,
    ];

    await HealthKit.requestAuthorizationAsync(readPermissions, writePermissions);
    console.log('✅ HealthKit permissions requested');
    return true;
  } catch (error) {
    console.error('Error requesting HealthKit permissions:', error);
    throw error;
  }
};

/**
 * Read weight from HealthKit
 */
export const readWeight = async (limit: number = 10): Promise<any[]> => {
  try {
    const available = await isHealthKitAvailable();
    if (!available) {
      throw new Error('HealthKit is not available');
    }

    const now = new Date();
    const startDate = new Date(0); // All time

    const result = await HealthKit.queryQuantitySamplesAsync(
      HealthKit.HealthDataType.BodyMass,
      {
        from: startDate,
        to: now,
        limit,
        ascending: false,
      }
    );

    return result;
  } catch (error) {
    console.error('Error reading weight from HealthKit:', error);
    throw error;
  }
};

/**
 * Write weight to HealthKit
 */
export const writeWeight = async (weightKg: number, date?: Date): Promise<boolean> => {
  try {
    const available = await isHealthKitAvailable();
    if (!available) {
      throw new Error('HealthKit is not available');
    }

    const weightDate = date || new Date();

    await HealthKit.saveQuantitySampleAsync(
      HealthKit.HealthDataType.BodyMass,
      {
        quantity: weightKg,
        startDate: weightDate,
        endDate: weightDate,
      }
    );

    console.log('✅ Weight written to HealthKit:', weightKg, 'kg');
    return true;
  } catch (error) {
    console.error('Error writing weight to HealthKit:', error);
    throw error;
  }
};

/**
 * Read dietary energy (calories) from HealthKit
 */
export const readDietaryEnergy = async (
  startDate: Date,
  endDate: Date
): Promise<any[]> => {
  try {
    const available = await isHealthKitAvailable();
    if (!available) {
      throw new Error('HealthKit is not available');
    }

    const result = await HealthKit.queryQuantitySamplesAsync(
      HealthKit.HealthDataType.DietaryEnergyConsumed,
      {
        from: startDate,
        to: endDate,
        ascending: false,
      }
    );

    return result;
  } catch (error) {
    console.error('Error reading dietary energy from HealthKit:', error);
    throw error;
  }
};

/**
 * Write dietary energy (calories) to HealthKit
 */
export const writeDietaryEnergy = async (
  calories: number,
  date: Date
): Promise<boolean> => {
  try {
    const available = await isHealthKitAvailable();
    if (!available) {
      throw new Error('HealthKit is not available');
    }

    await HealthKit.saveQuantitySampleAsync(
      HealthKit.HealthDataType.DietaryEnergyConsumed,
      {
        quantity: calories,
        startDate: date,
        endDate: date,
      }
    );

    console.log('✅ Dietary energy written to HealthKit:', calories, 'kcal');
    return true;
  } catch (error) {
    console.error('Error writing dietary energy to HealthKit:', error);
    throw error;
  }
};

/**
 * Write nutrition data (protein, carbs, fat) to HealthKit
 */
export const writeNutritionData = async (
  protein: number,
  carbs: number,
  fat: number,
  date: Date
): Promise<boolean> => {
  try {
    const available = await isHealthKitAvailable();
    if (!available) {
      throw new Error('HealthKit is not available');
    }

    const promises: Promise<void>[] = [];

    // Write protein
    if (protein > 0) {
      promises.push(
        HealthKit.saveQuantitySampleAsync(
          HealthKit.HealthDataType.DietaryProtein,
          {
            quantity: protein,
            startDate: date,
            endDate: date,
          }
        )
      );
    }

    // Write carbohydrates
    if (carbs > 0) {
      promises.push(
        HealthKit.saveQuantitySampleAsync(
          HealthKit.HealthDataType.DietaryCarbohydrates,
          {
            quantity: carbs,
            startDate: date,
            endDate: date,
          }
        )
      );
    }

    // Write fat
    if (fat > 0) {
      promises.push(
        HealthKit.saveQuantitySampleAsync(
          HealthKit.HealthDataType.DietaryFatTotal,
          {
            quantity: fat,
            startDate: date,
            endDate: date,
          }
        )
      );
    }

    await Promise.all(promises);
    console.log('✅ Nutrition data written to HealthKit');
    return true;
  } catch (error) {
    console.error('Error writing nutrition data to HealthKit:', error);
    throw error;
  }
};

/**
 * Sync meal data to HealthKit
 */
export const syncMealToHealthKit = async (
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  date: Date
): Promise<boolean> => {
  try {
    // Write all nutrition data
    await writeDietaryEnergy(calories, date);
    await writeNutritionData(protein, carbs, fat, date);

    return true;
  } catch (error) {
    console.error('Error syncing meal to HealthKit:', error);
    return false;
  }
};
