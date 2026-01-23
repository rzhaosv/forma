// Meal and food data types
export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  portion: string;
  quantity: number;
  timestamp: string;
}

export interface Meal {
  id: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  foods: FoodItem[];
  timestamp: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  logType?: 'photo' | 'voice' | 'manual' | 'barcode'; // How the meal was logged
}

export interface DailySummary {
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  calorieGoal: number;
  proteinGoal: number;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

// Recipe types
export interface RecipeIngredient {
  id: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  amount: number; // quantity/amount used in recipe
  unit: string; // unit of measurement (g, cups, etc.)
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: RecipeIngredient[];
  servings: number; // number of servings this recipe makes
  totalCalories: number; // total for entire recipe
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  createdAt: string;
  updatedAt: string;
}

