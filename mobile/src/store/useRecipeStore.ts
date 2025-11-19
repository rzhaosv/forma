// Recipe Store
// Manages recipe creation, storage, and retrieval

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, RecipeIngredient } from '../types/meal.types';

interface RecipeStore {
  recipes: Recipe[];
  
  // Actions
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  getRecipe: (id: string) => Recipe | undefined;
  initialize: () => Promise<void>;
  
  // Helper to calculate recipe totals
  calculateRecipeTotals: (ingredients: RecipeIngredient[]) => {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  };
}

const RECIPES_STORAGE_KEY = '@forma_recipes';

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  
  calculateRecipeTotals: (ingredients) => {
    return ingredients.reduce(
      (totals, ingredient) => ({
        // Nutrition values are already calculated for the full amount, so just add them
        totalCalories: totals.totalCalories + ingredient.calories,
        totalProtein: totals.totalProtein + ingredient.protein_g,
        totalCarbs: totals.totalCarbs + ingredient.carbs_g,
        totalFat: totals.totalFat + ingredient.fat_g,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
    );
  },
  
  addRecipe: async (recipeData) => {
    const now = new Date().toISOString();
    const totals = get().calculateRecipeTotals(recipeData.ingredients);
    
    const recipe: Recipe = {
      id: `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...recipeData,
      ...totals,
      caloriesPerServing: Math.round(totals.totalCalories / recipeData.servings),
      proteinPerServing: Math.round(totals.totalProtein / recipeData.servings),
      carbsPerServing: Math.round(totals.totalCarbs / recipeData.servings),
      fatPerServing: Math.round(totals.totalFat / recipeData.servings),
      createdAt: now,
      updatedAt: now,
    };
    
    const updatedRecipes = [...get().recipes, recipe];
    set({ recipes: updatedRecipes });
    
    try {
      await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(updatedRecipes));
    } catch (error) {
      console.error('Failed to save recipe:', error);
    }
  },
  
  updateRecipe: async (id, updates) => {
    const recipes = get().recipes;
    const recipeIndex = recipes.findIndex(r => r.id === id);
    
    if (recipeIndex === -1) return;
    
    const existingRecipe = recipes[recipeIndex];
    const updatedRecipe = {
      ...existingRecipe,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    // Recalculate totals if ingredients changed
    if (updates.ingredients || updates.servings) {
      const ingredients = updates.ingredients || existingRecipe.ingredients;
      const servings = updates.servings || existingRecipe.servings;
      const totals = get().calculateRecipeTotals(ingredients);
      
      updatedRecipe.totalCalories = totals.totalCalories;
      updatedRecipe.totalProtein = totals.totalProtein;
      updatedRecipe.totalCarbs = totals.totalCarbs;
      updatedRecipe.totalFat = totals.totalFat;
      updatedRecipe.caloriesPerServing = Math.round(totals.totalCalories / servings);
      updatedRecipe.proteinPerServing = Math.round(totals.totalProtein / servings);
      updatedRecipe.carbsPerServing = Math.round(totals.totalCarbs / servings);
      updatedRecipe.fatPerServing = Math.round(totals.totalFat / servings);
    }
    
    const updatedRecipes = [...recipes];
    updatedRecipes[recipeIndex] = updatedRecipe;
    set({ recipes: updatedRecipes });
    
    try {
      await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(updatedRecipes));
    } catch (error) {
      console.error('Failed to update recipe:', error);
    }
  },
  
  deleteRecipe: async (id) => {
    const updatedRecipes = get().recipes.filter(r => r.id !== id);
    set({ recipes: updatedRecipes });
    
    try {
      await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(updatedRecipes));
    } catch (error) {
      console.error('Failed to delete recipe:', error);
    }
  },
  
  getRecipe: (id) => {
    return get().recipes.find(r => r.id === id);
  },
  
  initialize: async () => {
    try {
      const recipesStr = await AsyncStorage.getItem(RECIPES_STORAGE_KEY);
      if (recipesStr) {
        const recipes = JSON.parse(recipesStr);
        set({ recipes });
      }
    } catch (error) {
      console.error('Failed to load recipes:', error);
    }
  },
}));

