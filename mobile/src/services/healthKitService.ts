// HealthKit Service
// Handles reading and writing health data to/from Apple HealthKit using @kingstinct/react-native-healthkit

import { Platform } from 'react-native';
import HealthKit, {
  HKQuantityTypeIdentifier,
  HKAuthorizationRequestStatus,
} from '@kingstinct/react-native-healthkit';

/**
 * Check if HealthKit is available on this device
 */
export const isHealthKitAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    return false;
  }
  try {
    return await HealthKit.isHealthDataAvailable();
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
      HKQuantityTypeIdentifier.bodyMass,
      HKQuantityTypeIdentifier.height,
      HKQuantityTypeIdentifier.stepCount,
      HKQuantityTypeIdentifier.activeEnergyBurned,
      HKQuantityTypeIdentifier.dietaryEnergyConsumed,
    ];

    const writePermissions = [
      HKQuantityTypeIdentifier.bodyMass,
      HKQuantityTypeIdentifier.dietaryEnergyConsumed,
      HKQuantityTypeIdentifier.dietaryProtein,
      HKQuantityTypeIdentifier.dietaryCarbohydrates,
      HKQuantityTypeIdentifier.dietaryFatTotal,
    ];

    await HealthKit.requestAuthorization(readPermissions, writePermissions);
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

    const result = await HealthKit.querySamples(
      HKQuantityTypeIdentifier.bodyMass,
      {
        from: startDate.toISOString(),
        to: now.toISOString(),
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

    await HealthKit.saveQuantitySample(
      HKQuantityTypeIdentifier.bodyMass,
      weightKg,
      {
        start: weightDate.toISOString(),
        end: weightDate.toISOString(),
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

    const result = await HealthKit.querySamples(
      HKQuantityTypeIdentifier.dietaryEnergyConsumed,
      {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
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

    await HealthKit.saveQuantitySample(
      HKQuantityTypeIdentifier.dietaryEnergyConsumed,
      calories,
      {
        start: date.toISOString(),
        end: date.toISOString(),
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
        HealthKit.saveQuantitySample(
          HKQuantityTypeIdentifier.dietaryProtein,
          protein,
          {
            start: date.toISOString(),
            end: date.toISOString(),
          }
        )
      );
    }

    // Write carbohydrates
    if (carbs > 0) {
      promises.push(
        HealthKit.saveQuantitySample(
          HKQuantityTypeIdentifier.dietaryCarbohydrates,
          carbs,
          {
            start: date.toISOString(),
            end: date.toISOString(),
          }
        )
      );
    }

    // Write fat
    if (fat > 0) {
      promises.push(
        HealthKit.saveQuantitySample(
          HKQuantityTypeIdentifier.dietaryFatTotal,
          fat,
          {
            start: date.toISOString(),
            end: date.toISOString(),
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
