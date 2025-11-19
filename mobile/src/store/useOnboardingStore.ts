// Onboarding Store
// Manages onboarding state and user goal data

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type WeightGoal = 'lose' | 'maintain' | 'gain';

export interface OnboardingData {
  // Step 1: Physical Info
  weight_kg?: number;
  height_cm?: number;
  
  // Step 2: Demographics
  age?: number;
  gender?: Gender;
  
  // Step 3: Activity
  activityLevel?: ActivityLevel;
  
  // Step 4: Goals
  weightGoal?: WeightGoal;
  targetWeight_kg?: number;
  
  // Calculated
  calorieGoal?: number;
  proteinGoal?: number;
}

interface OnboardingState {
  isComplete: boolean;
  isLoading: boolean;
  currentStep: number;
  data: OnboardingData;
  setStep: (step: number) => void;
  updateData: (data: Partial<OnboardingData>) => void;
  calculateGoals: () => void;
  completeOnboarding: () => Promise<void>;
  initialize: () => Promise<void>;
  reset: () => Promise<void>;
}

const ONBOARDING_STORAGE_KEY = '@forma_onboarding_complete';
const ONBOARDING_DATA_KEY = '@forma_onboarding_data';

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  isComplete: false,
  isLoading: true,
  currentStep: 1,
  data: {},
  
  setStep: (step: number) => {
    set({ currentStep: step });
  },
  
  updateData: (newData: Partial<OnboardingData>) => {
    set((state) => ({
      data: { ...state.data, ...newData },
    }));
  },
  
  calculateGoals: () => {
    const { data } = get();
    const { weight_kg, height_cm, age, gender, activityLevel, weightGoal, targetWeight_kg } = data;
    
    if (!weight_kg || !height_cm || !age || !gender || !activityLevel) {
      return;
    }
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
    } else {
      bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
    }
    
    // Activity multipliers
    const activityMultipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    
    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityMultipliers[activityLevel];
    
    // Adjust based on weight goal
    let calorieGoal = tdee;
    if (weightGoal === 'lose' && targetWeight_kg) {
      // Aim for 500 calorie deficit per day (0.5kg per week)
      calorieGoal = tdee - 500;
    } else if (weightGoal === 'gain' && targetWeight_kg) {
      // Aim for 500 calorie surplus per day
      calorieGoal = tdee + 500;
    }
    // maintain: use TDEE as-is
    
    // Ensure minimum calories (1200 for safety)
    calorieGoal = Math.max(1200, Math.round(calorieGoal));
    
    // Calculate macros (40% protein, 30% carbs, 30% fat)
    const proteinGoal = Math.round((calorieGoal * 0.3) / 4); // 30% of calories from protein
    // Carbs and fat will be calculated dynamically based on remaining calories
    
    set((state) => ({
      data: {
        ...state.data,
        calorieGoal,
        proteinGoal,
      },
    }));
  },
  
  completeOnboarding: async () => {
    const { data } = get();
    
    // Calculate goals before completing
    get().calculateGoals();
    
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      await AsyncStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
      set({ isComplete: true, currentStep: 1 });
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
    }
  },
  
  initialize: async () => {
    try {
      const isComplete = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      const dataStr = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
      
      if (isComplete === 'true') {
        const data = dataStr ? JSON.parse(dataStr) : {};
        set({ isComplete: true, data, currentStep: 1, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load onboarding data:', error);
      set({ isLoading: false });
    }
  },
  
  reset: async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
      await AsyncStorage.removeItem(ONBOARDING_DATA_KEY);
      set({ isComplete: false, currentStep: 1, data: {} });
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
    }
  },
}));

