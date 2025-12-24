// Meal logging state management
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meal, FoodItem, DailySummary } from '../types/meal.types';
import { syncMealToHealthKit } from '../services/healthKitService';
import { isHealthKitEnabled, isMealSyncEnabled } from '../utils/healthKitSettings';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getLocalDateString } from '../utils/dateUtils';

interface MealStore {
  meals: Meal[];
  dailySummary: DailySummary | null;
  calorieGoal: number;
  proteinGoal: number;
  currentUserId: string | null;

  // Actions
  addMeal: (meal: Meal) => Promise<void>;
  addFoodToMeal: (mealId: string, food: FoodItem) => void;
  removeFoodFromMeal: (mealId: string, foodId: string) => void;
  deleteMeal: (mealId: string) => void;
  updateDailySummary: () => void;
  setGoals: (calorieGoal: number, proteinGoal: number) => Promise<void>;
  initialize: (userId: string) => Promise<void>;
  clearData: () => Promise<void>;
}

const getStorageKeys = (userId: string) => ({
  meals: `@forma_meals_${userId}`,
  goals: `@forma_goals_${userId}`,
});

const calculateMealTotals = (foods: FoodItem[]) => {
  return foods.reduce(
    (totals, food) => ({
      totalCalories: totals.totalCalories + food.calories * food.quantity,
      totalProtein: totals.totalProtein + food.protein_g * food.quantity,
      totalCarbs: totals.totalCarbs + food.carbs_g * food.quantity,
      totalFat: totals.totalFat + food.fat_g * food.quantity,
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
  );
};

export const useMealStore = create<MealStore>((set, get) => ({
  meals: [],
  dailySummary: null,
  calorieGoal: 2000,
  proteinGoal: 150,
  currentUserId: null,

  addMeal: async (meal) => {
    set((state) => ({
      meals: [...state.meals, meal],
    }));
    get().updateDailySummary();

    // Persist meals
    const userId = get().currentUserId;
    if (userId) {
      try {
        const keys = getStorageKeys(userId);
        const meals = get().meals;
        await AsyncStorage.setItem(keys.meals, JSON.stringify(meals));

        // Sync to Firestore
        await setDoc(doc(db, 'users', userId, 'data', 'meals'), { meals });
      } catch (error) {
        console.error('Failed to save meals to Firestore:', error);
      }
    }

    // Sync to HealthKit if enabled
    try {
      const healthKitEnabled = await isHealthKitEnabled();
      const mealSyncEnabled = await isMealSyncEnabled();

      if (healthKitEnabled && mealSyncEnabled) {
        const mealDate = new Date(meal.timestamp);
        await syncMealToHealthKit(
          meal.totalCalories,
          meal.totalProtein,
          meal.totalCarbs,
          meal.totalFat,
          mealDate
        );
        console.log('Meal synced to HealthKit');
      }
    } catch (error) {
      console.error('Failed to sync meal to HealthKit:', error);
      // Don't throw - we don't want to block the meal entry if HealthKit sync fails
    }
  },

  addFoodToMeal: async (mealId, food) => {
    set((state) => ({
      meals: state.meals.map((meal) => {
        if (meal.id === mealId) {
          const updatedFoods = [...meal.foods, food];
          const totals = calculateMealTotals(updatedFoods);
          return {
            ...meal,
            foods: updatedFoods,
            ...totals,
          };
        }
        return meal;
      }),
    }));
    get().updateDailySummary();

    // Persist meals
    const userId = get().currentUserId;
    if (userId) {
      try {
        const keys = getStorageKeys(userId);
        const meals = get().meals;
        await AsyncStorage.setItem(keys.meals, JSON.stringify(meals));

        // Sync to Firestore
        await setDoc(doc(db, 'users', userId, 'data', 'meals'), { meals });
      } catch (error) {
        console.error('Failed to sync food update:', error);
      }
    }
  },

  removeFoodFromMeal: async (mealId, foodId) => {
    set((state) => ({
      meals: state.meals.map((meal) => {
        if (meal.id === mealId) {
          const updatedFoods = meal.foods.filter((food) => food.id !== foodId);
          const totals = calculateMealTotals(updatedFoods);
          return {
            ...meal,
            foods: updatedFoods,
            ...totals,
          };
        }
        return meal;
      }),
    }));
    get().updateDailySummary();

    // Persist meals
    const userId = get().currentUserId;
    if (userId) {
      try {
        const keys = getStorageKeys(userId);
        const meals = get().meals;
        await AsyncStorage.setItem(keys.meals, JSON.stringify(meals));

        // Sync to Firestore
        await setDoc(doc(db, 'users', userId, 'data', 'meals'), { meals });
      } catch (error) {
        console.error('Failed to save meals:', error);
      }
    }
  },

  deleteMeal: async (mealId) => {
    set((state) => ({
      meals: state.meals.filter((meal) => meal.id !== mealId),
    }));
    get().updateDailySummary();

    // Persist meals
    const userId = get().currentUserId;
    if (userId) {
      try {
        const keys = getStorageKeys(userId);
        const meals = get().meals;
        await AsyncStorage.setItem(keys.meals, JSON.stringify(meals));

        // Sync to Firestore
        await setDoc(doc(db, 'users', userId, 'data', 'meals'), { meals });
      } catch (error) {
        console.error('Failed to save meals:', error);
      }
    }
  },

  updateDailySummary: () => {
    const state = get();
    const today = getLocalDateString();
    const todayMeals = state.meals.filter(
      (meal) => getLocalDateString(new Date(meal.timestamp)) === today
    );

    const totals = todayMeals.reduce(
      (sum, meal) => ({
        totalCalories: sum.totalCalories + meal.totalCalories,
        totalProtein: sum.totalProtein + meal.totalProtein,
        totalCarbs: sum.totalCarbs + meal.totalCarbs,
        totalFat: sum.totalFat + meal.totalFat,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
    );

    set({
      dailySummary: {
        date: today,
        meals: todayMeals,
        ...totals,
        calorieGoal: state.calorieGoal,
        proteinGoal: state.proteinGoal,
      },
    });
  },

  setGoals: async (calorieGoal, proteinGoal) => {
    set({ calorieGoal, proteinGoal });
    get().updateDailySummary();

    // Persist goals to AsyncStorage
    const userId = get().currentUserId;
    if (userId) {
      try {
        const keys = getStorageKeys(userId);
        const goals = { calorieGoal, proteinGoal };
        await AsyncStorage.setItem(keys.goals, JSON.stringify(goals));

        // Sync to Firestore
        await setDoc(doc(db, 'users', userId, 'data', 'goals'), goals);
      } catch (error) {
        console.error('Failed to save goals:', error);
      }
    }
  },

  initialize: async (userId: string) => {
    try {
      set({ currentUserId: userId });
      const keys = getStorageKeys(userId);

      // Load meals
      const mealsStr = await AsyncStorage.getItem(keys.meals);
      let localMeals = [];
      if (mealsStr) {
        localMeals = JSON.parse(mealsStr);
      }

      // Try to sync with Firestore
      try {
        if (!userId) return;

        const mealsDoc = await getDoc(doc(db, 'users', userId, 'data', 'meals'));
        if (mealsDoc.exists()) {
          const remoteMeals = mealsDoc.data().meals;
          // Merge logic: remote if it has more or equal entries
          if (remoteMeals.length >= localMeals.length) {
            localMeals = remoteMeals;
            await AsyncStorage.setItem(keys.meals, JSON.stringify(localMeals));
          }
        }
      } catch (error) {
        console.warn('Failed to load meals from Firestore:', error);
      }

      set({ meals: localMeals });
      get().updateDailySummary();

      // Load goals
      const goalsStr = await AsyncStorage.getItem(keys.goals);
      let localGoals = null;
      if (goalsStr) {
        localGoals = JSON.parse(goalsStr);
      }

      // Try to sync goals from Firestore
      try {
        const goalsDoc = await getDoc(doc(db, 'users', userId, 'data', 'goals'));
        if (goalsDoc.exists()) {
          const remoteGoals = goalsDoc.data();
          localGoals = remoteGoals;
          await AsyncStorage.setItem(keys.goals, JSON.stringify(localGoals));
        }
      } catch (error) {
        console.warn('Failed to load goals from Firestore:', error);
      }

      if (localGoals) {
        const { calorieGoal, proteinGoal } = localGoals;
        set({ calorieGoal, proteinGoal });
      }
    } catch (error) {
      console.error('Failed to load meal data:', error);
    }
  },

  clearData: async () => {
    set({
      meals: [],
      dailySummary: null,
      calorieGoal: 2000,
      proteinGoal: 150,
      currentUserId: null,
    });
  },
}));
