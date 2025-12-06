// Google Fit Service
// Handles reading and writing health data to/from Google Fit on Android

import { Platform } from 'react-native';

// Dynamic import for Google Fit - loaded lazily to prevent startup crash
let GoogleFit: any = null;
let googleFitLoadAttempted = false;

const loadGoogleFitModule = () => {
  if (googleFitLoadAttempted) return GoogleFit;
  googleFitLoadAttempted = true;
  
  try {
    if (Platform.OS === 'android') {
      GoogleFit = require('react-native-google-fit').default;
      console.log('✅ Google Fit module loaded');
    }
  } catch (error) {
    console.warn('⚠️ Google Fit module not available:', error);
    GoogleFit = null;
  }
  return GoogleFit;
};

// Scopes for Google Fit permissions
const GOOGLE_FIT_OPTIONS = {
  scopes: [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.activity.write',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.body.write',
    'https://www.googleapis.com/auth/fitness.nutrition.read',
    'https://www.googleapis.com/auth/fitness.nutrition.write',
  ],
};

/**
 * Check if Google Fit is available on this device
 */
export const isGoogleFitAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return false;
  }
  
  const gf = loadGoogleFitModule();
  if (!gf) {
    console.log('Google Fit: Module not loaded');
    return false;
  }
  
  return true;
};

/**
 * Check if Google Fit is authorized
 */
export const isGoogleFitAuthorized = async (): Promise<boolean> => {
  const gf = loadGoogleFitModule();
  if (Platform.OS !== 'android' || !gf) {
    return false;
  }
  
  try {
    const isAuthorized = await gf.isAuthorized;
    return isAuthorized;
  } catch (error) {
    console.error('Error checking Google Fit authorization:', error);
    return false;
  }
};

/**
 * Request Google Fit permissions
 */
export const requestGoogleFitPermissions = async (): Promise<boolean> => {
  try {
    const available = await isGoogleFitAvailable();
    if (!available) {
      throw new Error('Google Fit is not available on this device');
    }

    const gf = loadGoogleFitModule();
    if (!gf) {
      throw new Error('Google Fit module not loaded');
    }

    console.log('🏃 Requesting Google Fit permissions...');
    
    const authResult = await gf.authorize(GOOGLE_FIT_OPTIONS);
    
    if (authResult.success) {
      console.log('✅ Google Fit authorized');
      
      // Start recording after authorization
      gf.startRecording((callback: any) => {
        console.log('Google Fit recording started:', callback);
      });
      
      return true;
    } else {
      console.log('❌ Google Fit authorization failed:', authResult.message);
      throw new Error(authResult.message || 'Authorization failed');
    }
  } catch (error) {
    console.error('Error requesting Google Fit permissions:', error);
    throw error;
  }
};

/**
 * Disconnect from Google Fit
 */
export const disconnectGoogleFit = async (): Promise<void> => {
  const gf = loadGoogleFitModule();
  if (Platform.OS !== 'android' || !gf) {
    return;
  }
  
  try {
    await gf.disconnect();
    console.log('✅ Disconnected from Google Fit');
  } catch (error) {
    console.error('Error disconnecting from Google Fit:', error);
  }
};

/**
 * Read weight from Google Fit
 */
export const readWeight = async (days: number = 30): Promise<any[]> => {
  try {
    const available = await isGoogleFitAvailable();
    if (!available) {
      throw new Error('Google Fit is not available');
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      bucketUnit: 'DAY',
      bucketInterval: 1,
    };

    const gf = loadGoogleFitModule();
    const weights = await gf.getWeightSamples(options);
    console.log('📊 Read weights from Google Fit:', weights.length, 'entries');
    
    return weights.map((w: any) => ({
      date: w.startDate || w.date,
      weight: w.value,
      unit: 'kg',
      source: 'google_fit',
    }));
  } catch (error) {
    console.error('Error reading weight from Google Fit:', error);
    throw error;
  }
};

/**
 * Write weight to Google Fit
 */
export const writeWeight = async (weightKg: number, date?: Date): Promise<boolean> => {
  try {
    const available = await isGoogleFitAvailable();
    if (!available) {
      throw new Error('Google Fit is not available');
    }

    const weightDate = date || new Date();
    
    const options = {
      value: weightKg,
      date: weightDate.toISOString(),
      unit: 'kg',
    };

    const gf = loadGoogleFitModule();
    const result = await gf.saveWeight(options);
    console.log('✅ Weight written to Google Fit:', weightKg, 'kg');
    return true;
  } catch (error) {
    console.error('Error writing weight to Google Fit:', error);
    throw error;
  }
};

/**
 * Read calories from Google Fit
 */
export const readCalories = async (
  startDate: Date,
  endDate: Date
): Promise<any[]> => {
  try {
    const available = await isGoogleFitAvailable();
    if (!available) {
      throw new Error('Google Fit is not available');
    }

    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      basalCalculation: false,
    };

    const gf = loadGoogleFitModule();
    const calories = await gf.getDailyCalorieSamples(options);
    console.log('📊 Read calories from Google Fit:', calories.length, 'entries');
    
    return calories;
  } catch (error) {
    console.error('Error reading calories from Google Fit:', error);
    throw error;
  }
};

/**
 * Write nutrition data to Google Fit
 */
export const writeNutritionData = async (
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  mealType: string,
  date: Date
): Promise<boolean> => {
  try {
    const available = await isGoogleFitAvailable();
    if (!available) {
      throw new Error('Google Fit is not available');
    }

    // Map meal type to Google Fit meal type
    const mealTypeMap: { [key: string]: number } = {
      'Breakfast': 1,
      'Lunch': 2,
      'Dinner': 3,
      'Snack': 4,
    };

    const nutritionData = {
      mealType: mealTypeMap[mealType] || 0, // 0 = unknown
      foodName: mealType,
      nutrients: {
        'calories': calories,
        'protein': protein,
        'total_carbs': carbs,
        'total_fat': fat,
      },
      date: date.toISOString(),
    };

    // Note: react-native-google-fit may not have direct nutrition write support
    // This is a placeholder for when/if the feature becomes available
    console.log('📝 Nutrition data prepared for Google Fit:', nutritionData);
    
    // For now, we'll just log it - actual implementation depends on library support
    // await GoogleFit.saveFood(nutritionData);
    
    return true;
  } catch (error) {
    console.error('Error writing nutrition to Google Fit:', error);
    throw error;
  }
};

/**
 * Read steps from Google Fit
 */
export const readSteps = async (
  startDate: Date,
  endDate: Date
): Promise<any[]> => {
  try {
    const available = await isGoogleFitAvailable();
    if (!available) {
      throw new Error('Google Fit is not available');
    }

    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      bucketUnit: 'DAY',
      bucketInterval: 1,
    };

    const gf = loadGoogleFitModule();
    const steps = await gf.getDailyStepCountSamples(options);
    console.log('📊 Read steps from Google Fit');
    
    return steps;
  } catch (error) {
    console.error('Error reading steps from Google Fit:', error);
    throw error;
  }
};

/**
 * Sync meal data to Google Fit
 */
export const syncMealToGoogleFit = async (
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  mealType: string,
  date: Date
): Promise<boolean> => {
  try {
    await writeNutritionData(calories, protein, carbs, fat, mealType, date);
    return true;
  } catch (error) {
    console.error('Error syncing meal to Google Fit:', error);
    return false;
  }
};

/**
 * Get daily summary from Google Fit
 */
export const getDailySummary = async (date: Date): Promise<{
  steps: number;
  calories: number;
  distance: number;
}> => {
  try {
    const available = await isGoogleFitAvailable();
    if (!available) {
      throw new Error('Google Fit is not available');
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const options = {
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
    };

    const gf = loadGoogleFitModule();
    if (!gf) {
      return { steps: 0, calories: 0, distance: 0 };
    }

    // Get steps
    const stepsData = await gf.getDailyStepCountSamples(options);
    let totalSteps = 0;
    if (stepsData && stepsData.length > 0) {
      stepsData.forEach((source: any) => {
        if (source.steps && source.steps.length > 0) {
          source.steps.forEach((step: any) => {
            totalSteps += step.value || 0;
          });
        }
      });
    }

    // Get calories burned
    const caloriesData = await gf.getDailyCalorieSamples(options);
    let totalCalories = 0;
    if (caloriesData && caloriesData.length > 0) {
      caloriesData.forEach((cal: any) => {
        totalCalories += cal.calorie || 0;
      });
    }

    // Get distance
    const distanceData = await gf.getDailyDistanceSamples(options);
    let totalDistance = 0;
    if (distanceData && distanceData.length > 0) {
      distanceData.forEach((dist: any) => {
        totalDistance += dist.distance || 0;
      });
    }

    return {
      steps: Math.round(totalSteps),
      calories: Math.round(totalCalories),
      distance: Math.round(totalDistance),
    };
  } catch (error) {
    console.error('Error getting daily summary from Google Fit:', error);
    return { steps: 0, calories: 0, distance: 0 };
  }
};

