// Meal logging state management
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meal, FoodItem, DailySummary } from '../types/meal.types';

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
      } catch (error) {
        console.error('Failed to save meals:', error);
      }
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
      } catch (error) {
        console.error('Failed to save meals:', error);
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
      } catch (error) {
        console.error('Failed to save meals:', error);
      }
    }
  },
  
  updateDailySummary: () => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = state.meals.filter(
      (meal) => meal.timestamp.startsWith(today)
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
        await AsyncStorage.setItem(keys.goals, JSON.stringify({ calorieGoal, proteinGoal }));
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
      if (mealsStr) {
        const meals = JSON.parse(mealsStr);
        set({ meals });
        get().updateDailySummary();
      } else {
        set({ meals: [] });
      }
      
      // Load goals
      const goalsStr = await AsyncStorage.getItem(keys.goals);
      if (goalsStr) {
        const { calorieGoal, proteinGoal } = JSON.parse(goalsStr);
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
