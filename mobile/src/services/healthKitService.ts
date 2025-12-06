// HealthKit Service
// Handles reading and writing health data to/from Apple HealthKit using @kingstinct/react-native-healthkit

import { Platform } from 'react-native';

// Dynamic import to handle cases where HealthKit isn't available
let HealthKit: any = null;
let HKQuantityTypeIdentifier: any = null;

try {
  const healthKitModule = require('@kingstinct/react-native-healthkit');
  HealthKit = healthKitModule.default;
  HKQuantityTypeIdentifier = healthKitModule.HKQuantityTypeIdentifier;
  console.log('✅ HealthKit module loaded successfully');
} catch (error) {
  console.warn('⚠️ HealthKit module not available:', error);
}

// Check if HealthKit is properly initialized
const isHealthKitModuleAvailable = (): boolean => {
  return HealthKit !== null && HKQuantityTypeIdentifier !== null;
};

/**
 * Check if HealthKit is available on this device
 */
export const isHealthKitAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    console.log('HealthKit: Not iOS platform');
    return false;
  }
  
  if (!isHealthKitModuleAvailable()) {
    console.log('HealthKit: Native module not available (development build may need rebuild)');
    return false;
  }
  
  try {
    const available = await HealthKit.isHealthDataAvailable();
    console.log('HealthKit availability:', available);
    return available;
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
    if (!isHealthKitModuleAvailable()) {
      throw new Error('HealthKit native module is not available. Please rebuild the app with: npx expo prebuild --clean && npx expo run:ios');
    }
    
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
      HKQuantityTypeIdentifier.activeEnergyBurned,
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

/**
 * Write active energy burned to HealthKit
 */
export const writeActiveEnergyBurned = async (
  calories: number,
  startDate: Date,
  endDate?: Date
): Promise<boolean> => {
  try {
    if (!isHealthKitModuleAvailable()) {
      console.log('HealthKit module not available for active energy');
      return false;
    }
    
    const available = await isHealthKitAvailable();
    if (!available) {
      throw new Error('HealthKit is not available');
    }

    const start = startDate;
    const end = endDate || startDate;

    await HealthKit.saveQuantitySample(
      HKQuantityTypeIdentifier.activeEnergyBurned,
      calories,
      {
        start: start.toISOString(),
        end: end.toISOString(),
      }
    );

    console.log('✅ Active energy written to HealthKit:', calories, 'kcal');
    return true;
  } catch (error) {
    console.error('Error writing active energy to HealthKit:', error);
    throw error;
  }
};

/**
 * Read active energy burned from HealthKit for a date range
 */
export const readActiveEnergyBurned = async (
  startDate: Date,
  endDate: Date
): Promise<number> => {
  try {
    if (!isHealthKitModuleAvailable()) {
      return 0;
    }
    
    const available = await isHealthKitAvailable();
    if (!available) {
      return 0;
    }

    const result = await HealthKit.querySamples(
      HKQuantityTypeIdentifier.activeEnergyBurned,
      {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      }
    );

    // Sum up all active energy samples
    const totalCalories = result.reduce((sum: number, sample: any) => {
      return sum + (sample.quantity || sample.value || 0);
    }, 0);

    console.log('📊 Read active energy from HealthKit:', totalCalories, 'kcal');
    return Math.round(totalCalories);
  } catch (error) {
    console.error('Error reading active energy from HealthKit:', error);
    return 0;
  }
};

/**
 * Sync workout/exercise data to HealthKit
 */
export const syncWorkoutToHealthKit = async (
  caloriesBurned: number,
  durationMinutes: number,
  workoutName: string,
  startTime: Date,
  endTime?: Date
): Promise<boolean> => {
  try {
    const start = startTime;
    const end = endTime || new Date(start.getTime() + durationMinutes * 60 * 1000);
    
    // Write active energy burned
    await writeActiveEnergyBurned(caloriesBurned, start, end);
    
    console.log('✅ Workout synced to HealthKit:', workoutName, '-', caloriesBurned, 'kcal');
    return true;
  } catch (error) {
    console.error('Error syncing workout to HealthKit:', error);
    return false;
  }
};
