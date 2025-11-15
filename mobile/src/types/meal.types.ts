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
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  timestamp: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
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

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

