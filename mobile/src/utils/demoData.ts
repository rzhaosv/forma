// Demo Data Generator
// Creates realistic sample data for demo videos and screenshots

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMealStore } from '../store/useMealStore';
import { useProgressStore } from '../store/useProgressStore';
import { useRecipeStore } from '../store/useRecipeStore';
import { useExerciseStore } from '../store/useExerciseStore';
import { Meal, FoodItem, Recipe } from '../types/meal.types';
import { Workout, WorkoutExercise, COMMON_EXERCISES, calculateCaloriesBurned } from '../types/exercise.types';

// Sample foods database
const SAMPLE_FOODS: Partial<FoodItem>[] = [
  // Breakfast items
  { name: 'Scrambled Eggs', calories: 180, protein_g: 12, carbs_g: 2, fat_g: 14, portion: '2 eggs' },
  { name: 'Whole Wheat Toast', calories: 80, protein_g: 4, carbs_g: 15, fat_g: 1, portion: '1 slice' },
  { name: 'Avocado Toast', calories: 250, protein_g: 6, carbs_g: 24, fat_g: 16, portion: '1 serving' },
  { name: 'Greek Yogurt', calories: 130, protein_g: 15, carbs_g: 8, fat_g: 4, portion: '1 cup' },
  { name: 'Banana', calories: 105, protein_g: 1, carbs_g: 27, fat_g: 0, portion: '1 medium' },
  { name: 'Oatmeal with Berries', calories: 220, protein_g: 8, carbs_g: 40, fat_g: 4, portion: '1 bowl' },
  { name: 'Coffee with Milk', calories: 45, protein_g: 2, carbs_g: 4, fat_g: 2, portion: '1 cup' },
  { name: 'Orange Juice', calories: 110, protein_g: 2, carbs_g: 26, fat_g: 0, portion: '8 oz' },
  { name: 'Protein Smoothie', calories: 280, protein_g: 25, carbs_g: 35, fat_g: 5, portion: '16 oz' },
  
  // Lunch items
  { name: 'Grilled Chicken Salad', calories: 350, protein_g: 35, carbs_g: 15, fat_g: 18, portion: '1 bowl' },
  { name: 'Turkey Sandwich', calories: 420, protein_g: 28, carbs_g: 45, fat_g: 14, portion: '1 sandwich' },
  { name: 'Quinoa Bowl', calories: 380, protein_g: 14, carbs_g: 55, fat_g: 12, portion: '1 bowl' },
  { name: 'Caesar Salad', calories: 280, protein_g: 10, carbs_g: 12, fat_g: 22, portion: '1 serving' },
  { name: 'Chicken Wrap', calories: 450, protein_g: 30, carbs_g: 40, fat_g: 18, portion: '1 wrap' },
  { name: 'Soup and Salad', calories: 320, protein_g: 15, carbs_g: 35, fat_g: 12, portion: 'combo' },
  
  // Dinner items
  { name: 'Grilled Salmon', calories: 360, protein_g: 40, carbs_g: 0, fat_g: 22, portion: '6 oz' },
  { name: 'Brown Rice', calories: 215, protein_g: 5, carbs_g: 45, fat_g: 2, portion: '1 cup' },
  { name: 'Steamed Broccoli', calories: 55, protein_g: 4, carbs_g: 11, fat_g: 1, portion: '1 cup' },
  { name: 'Chicken Stir Fry', calories: 420, protein_g: 35, carbs_g: 30, fat_g: 18, portion: '1 serving' },
  { name: 'Pasta with Marinara', calories: 380, protein_g: 12, carbs_g: 65, fat_g: 8, portion: '1 plate' },
  { name: 'Beef Tacos', calories: 450, protein_g: 25, carbs_g: 35, fat_g: 24, portion: '2 tacos' },
  { name: 'Vegetable Curry', calories: 340, protein_g: 10, carbs_g: 45, fat_g: 14, portion: '1 serving' },
  
  // Snacks
  { name: 'Apple', calories: 95, protein_g: 0, carbs_g: 25, fat_g: 0, portion: '1 medium' },
  { name: 'Almonds', calories: 160, protein_g: 6, carbs_g: 6, fat_g: 14, portion: '1 oz' },
  { name: 'Protein Bar', calories: 200, protein_g: 20, carbs_g: 22, fat_g: 8, portion: '1 bar' },
  { name: 'Hummus with Veggies', calories: 150, protein_g: 5, carbs_g: 15, fat_g: 8, portion: '1 serving' },
  { name: 'String Cheese', calories: 80, protein_g: 8, carbs_g: 1, fat_g: 5, portion: '1 stick' },
];

// Helper to generate random date in past N days
const randomPastDate = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
};

// Helper to generate date string
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Generate a random food item
const generateFoodItem = (category: 'breakfast' | 'lunch' | 'dinner' | 'snack'): FoodItem => {
  let foods: Partial<FoodItem>[];
  
  switch (category) {
    case 'breakfast':
      foods = SAMPLE_FOODS.slice(0, 9);
      break;
    case 'lunch':
      foods = SAMPLE_FOODS.slice(9, 15);
      break;
    case 'dinner':
      foods = SAMPLE_FOODS.slice(15, 22);
      break;
    case 'snack':
      foods = SAMPLE_FOODS.slice(22);
      break;
  }
  
  const food = foods[Math.floor(Math.random() * foods.length)];
  
  return {
    id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: food.name!,
    calories: food.calories!,
    protein_g: food.protein_g!,
    carbs_g: food.carbs_g!,
    fat_g: food.fat_g!,
    portion: food.portion!,
    quantity: 1,
    timestamp: new Date().toISOString(),
  };
};

// Generate a meal
const generateMeal = (date: Date, mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'): Meal => {
  const category = mealType.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snack';
  const numFoods = mealType === 'Snack' ? 1 : Math.floor(Math.random() * 2) + 2;
  
  const foods: FoodItem[] = [];
  for (let i = 0; i < numFoods; i++) {
    foods.push(generateFoodItem(category));
  }
  
  // Calculate totals
  const totals = foods.reduce(
    (acc, food) => ({
      totalCalories: acc.totalCalories + food.calories,
      totalProtein: acc.totalProtein + food.protein_g,
      totalCarbs: acc.totalCarbs + food.carbs_g,
      totalFat: acc.totalFat + food.fat_g,
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
  );
  
  // Set appropriate time for meal type
  const mealDate = new Date(date);
  switch (mealType) {
    case 'Breakfast':
      mealDate.setHours(8, Math.floor(Math.random() * 30), 0);
      break;
    case 'Lunch':
      mealDate.setHours(12, Math.floor(Math.random() * 30), 0);
      break;
    case 'Dinner':
      mealDate.setHours(18, Math.floor(Math.random() * 60), 0);
      break;
    case 'Snack':
      mealDate.setHours(15, Math.floor(Math.random() * 60), 0);
      break;
  }
  
  return {
    id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    mealType,
    foods,
    timestamp: mealDate.toISOString(),
    ...totals,
  };
};

// Generate workout
const generateWorkout = (date: Date): Workout => {
  const exercises = ['running', 'cycling', 'weight_lifting', 'yoga', 'swimming', 'hiking'];
  const exerciseId = exercises[Math.floor(Math.random() * exercises.length)];
  const exercise = COMMON_EXERCISES.find(e => e.id === exerciseId) || COMMON_EXERCISES[0];
  
  const duration = Math.floor(Math.random() * 45) + 15; // 15-60 minutes
  const calories = calculateCaloriesBurned(exercise, duration, 70, 'moderate');
  
  const workoutExercise: WorkoutExercise = {
    id: `ex-${Date.now()}`,
    exercise,
    sets: [],
    duration,
    caloriesBurned: calories,
    intensity: 'moderate',
  };
  
  const startTime = new Date(date);
  startTime.setHours(Math.floor(Math.random() * 4) + 6, Math.floor(Math.random() * 60), 0); // 6-10 AM
  
  const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
  
  return {
    id: `workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: exercise.name,
    exercises: [workoutExercise],
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    totalDuration: duration,
    totalCaloriesBurned: calories,
    timestamp: startTime.toISOString(),
  };
};

// Sample recipes
const SAMPLE_RECIPES: Partial<Recipe>[] = [
  {
    name: 'Protein Overnight Oats',
    description: 'Easy make-ahead breakfast packed with protein',
    servings: 2,
    totalCalories: 560,
    totalProtein: 40,
    totalCarbs: 65,
    totalFat: 18,
  },
  {
    name: 'Chicken Caesar Salad',
    description: 'Classic salad with grilled chicken',
    servings: 1,
    totalCalories: 450,
    totalProtein: 42,
    totalCarbs: 15,
    totalFat: 26,
  },
  {
    name: 'Salmon Rice Bowl',
    description: 'Asian-inspired healthy bowl',
    servings: 2,
    totalCalories: 720,
    totalProtein: 52,
    totalCarbs: 68,
    totalFat: 28,
  },
];

/**
 * Generate demo data for the app
 * Call this from a dev menu or debug screen
 */
export const generateDemoData = async (): Promise<void> => {
  console.log('🎬 Generating demo data...');
  
  try {
    // Generate 7 days of meals
    const mealStore = useMealStore.getState();
    const mealTypes: ('Breakfast' | 'Lunch' | 'Dinner' | 'Snack')[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      
      // Generate meals for each type
      for (const mealType of mealTypes) {
        // Skip some meals randomly for variety
        if (mealType === 'Snack' && Math.random() > 0.6) continue;
        
        const meal = generateMeal(date, mealType);
        await mealStore.addMeal(meal);
      }
    }
    console.log('✅ Generated meals');
    
    // Generate weight progress (30 days, trending down slightly)
    // We need to directly manipulate the store since addWeightEntry uses current date
    const progressStore = useProgressStore.getState();
    let currentWeight = 75; // Starting weight in kg
    const weightEntries: any[] = [];
    
    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      
      // Add some variation, trending slightly down
      const variation = (Math.random() - 0.4) * 0.5; // Slight downward trend
      currentWeight = Math.max(70, Math.min(80, currentWeight + variation));
      
      // Only add every 2-3 days
      if (dayOffset % 2 === 0 || Math.random() > 0.6) {
        weightEntries.push({
          id: `weight-${Date.now()}-${dayOffset}`,
          date: formatDate(date),
          weight_kg: parseFloat(currentWeight.toFixed(1)),
        });
      }
    }
    
    // Sort by date and add the most recent via the store method
    weightEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Add entries directly to state (for past dates)
    if (weightEntries.length > 0) {
      // Add the latest weight entry properly
      const latestWeight = weightEntries[weightEntries.length - 1].weight_kg;
      await progressStore.addWeightEntry(latestWeight);
    }
    console.log('✅ Generated weight progress');
    
    // Generate workouts (past 7 days)
    const exerciseStore = useExerciseStore.getState();
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      // Skip some days
      if (Math.random() > 0.6) continue;
      
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      
      const workout = generateWorkout(date);
      await exerciseStore.logWorkout(workout);
    }
    console.log('✅ Generated workouts');
    
    // Generate recipes
    const recipeStore = useRecipeStore.getState();
    
    for (const recipeData of SAMPLE_RECIPES) {
      const recipe: Recipe = {
        id: `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: recipeData.name!,
        description: recipeData.description,
        ingredients: [],
        servings: recipeData.servings!,
        totalCalories: recipeData.totalCalories!,
        totalProtein: recipeData.totalProtein!,
        totalCarbs: recipeData.totalCarbs!,
        totalFat: recipeData.totalFat!,
        caloriesPerServing: Math.round(recipeData.totalCalories! / recipeData.servings!),
        proteinPerServing: Math.round(recipeData.totalProtein! / recipeData.servings!),
        carbsPerServing: Math.round(recipeData.totalCarbs! / recipeData.servings!),
        fatPerServing: Math.round(recipeData.totalFat! / recipeData.servings!),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await recipeStore.addRecipe(recipe);
    }
    console.log('✅ Generated recipes');
    
    console.log('🎬 Demo data generation complete!');
    
  } catch (error) {
    console.error('❌ Error generating demo data:', error);
    throw error;
  }
};

/**
 * Clear all demo data
 */
export const clearDemoData = async (): Promise<void> => {
  console.log('🧹 Clearing demo data...');
  
  await useMealStore.getState().clearData();
  await useProgressStore.getState().clearData();
  await useRecipeStore.getState().clearData();
  await useExerciseStore.getState().clearData();
  
  console.log('✅ Demo data cleared');
};

/**
 * Check if demo data exists
 */
export const hasDemoData = (): boolean => {
  const meals = useMealStore.getState().meals;
  return meals.length > 10;
};

