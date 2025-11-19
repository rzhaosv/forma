// Calorie Calculation Utilities
// BMR and TDEE calculations for goal setting

import { Gender, ActivityLevel, WeightGoal } from '../store/useOnboardingStore';

export interface CalorieCalculationResult {
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 */
export function calculateBMR(
  weight_kg: number,
  height_cm: number,
  age: number,
  gender: Gender
): number {
  if (gender === 'male') {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }
}

/**
 * Calculate TDEE based on activity level
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  return bmr * multipliers[activityLevel];
}

/**
 * Calculate calorie goal based on weight goal
 */
export function calculateCalorieGoal(
  tdee: number,
  weightGoal: WeightGoal,
  currentWeight_kg?: number,
  targetWeight_kg?: number
): number {
  let calorieGoal = tdee;
  
  if (weightGoal === 'lose' && currentWeight_kg && targetWeight_kg) {
    // Aim for 500 calorie deficit per day (0.5kg per week)
    calorieGoal = tdee - 500;
  } else if (weightGoal === 'gain' && currentWeight_kg && targetWeight_kg) {
    // Aim for 500 calorie surplus per day
    calorieGoal = tdee + 500;
  }
  // maintain: use TDEE as-is
  
  // Ensure minimum calories (1200 for safety)
  return Math.max(1200, Math.round(calorieGoal));
}

/**
 * Calculate macro goals
 */
export function calculateMacros(calorieGoal: number) {
  // 30% protein, 40% carbs, 30% fat
  const proteinGoal = Math.round((calorieGoal * 0.3) / 4); // 4 cal per gram
  const carbsGoal = Math.round((calorieGoal * 0.4) / 4); // 4 cal per gram
  const fatGoal = Math.round((calorieGoal * 0.3) / 9); // 9 cal per gram
  
  return {
    proteinGoal,
    carbsGoal,
    fatGoal,
  };
}

/**
 * Complete calorie calculation
 */
export function calculateAll(
  weight_kg: number,
  height_cm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  weightGoal: WeightGoal,
  targetWeight_kg?: number
): CalorieCalculationResult {
  const bmr = calculateBMR(weight_kg, height_cm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const calorieGoal = calculateCalorieGoal(tdee, weightGoal, weight_kg, targetWeight_kg);
  const { proteinGoal, carbsGoal, fatGoal } = calculateMacros(calorieGoal);
  
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatGoal,
  };
}

