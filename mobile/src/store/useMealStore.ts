// Meal logging state management
import { create } from 'zustand';
import { Meal, FoodItem, DailySummary } from '../types/meal.types';

interface MealStore {
  meals: Meal[];
  dailySummary: DailySummary | null;
  calorieGoal: number;
  proteinGoal: number;
  
  // Actions
  addMeal: (meal: Meal) => void;
  addFoodToMeal: (mealId: string, food: FoodItem) => void;
  removeFoodFromMeal: (mealId: string, foodId: string) => void;
  deleteMeal: (mealId: string) => void;
  updateDailySummary: () => void;
  setGoals: (calorieGoal: number, proteinGoal: number) => void;
}

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
  
  addMeal: (meal) => {
    set((state) => ({
      meals: [...state.meals, meal],
    }));
    get().updateDailySummary();
  },
  
  addFoodToMeal: (mealId, food) => {
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
  },
  
  removeFoodFromMeal: (mealId, foodId) => {
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
  },
  
  deleteMeal: (mealId) => {
    set((state) => ({
      meals: state.meals.filter((meal) => meal.id !== mealId),
    }));
    get().updateDailySummary();
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
  
  setGoals: (calorieGoal, proteinGoal) => {
    set({ calorieGoal, proteinGoal });
    get().updateDailySummary();
  },
}));
