// Data Export Service
// Allows premium users to export their data (meals, progress, recipes)

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useMealStore } from '../store/useMealStore';
import { useProgressStore } from '../store/useProgressStore';
import { useRecipeStore } from '../store/useRecipeStore';

export type ExportFormat = 'csv' | 'json';
export type ExportDataType = 'meals' | 'progress' | 'recipes' | 'all';

interface ExportOptions {
  format: ExportFormat;
  dataType: ExportDataType;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Escape CSV values that contain commas, quotes, or newlines
 */
const escapeCSV = (value: string): string => {
  if (!value) return '';
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

/**
 * Export meals data
 */
export const exportMeals = async (format: ExportFormat): Promise<string> => {
  const { meals } = useMealStore.getState();
  
  console.log('📊 Exporting meals:', meals.length, 'meals');
  console.log('📊 First meal sample:', JSON.stringify(meals[0], null, 2));
  
  if (format === 'json') {
    return JSON.stringify(meals, null, 2);
  }
  
  // Create CSV with proper headers
  const rows: string[] = [];
  rows.push('Date,Meal Type,Food Name,Calories,Protein (g),Carbs (g),Fat (g),Portion,Quantity,Time Logged');
  
  // Sort by timestamp (newest first)
  const sortedMeals = [...meals].sort((a, b) => 
    new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
  );
  
  sortedMeals.forEach(meal => {
    // Extract date from timestamp
    const mealDate = meal.timestamp ? meal.timestamp.split('T')[0] : '';
    
    if (meal.foods && meal.foods.length > 0) {
      meal.foods.forEach(food => {
        rows.push([
          mealDate,
          meal.mealType || '',
          escapeCSV(food.name || 'Unknown Food'),
          (food.calories * (food.quantity || 1))?.toFixed(0) || '0',
          (food.protein_g * (food.quantity || 1))?.toFixed(1) || '0',
          (food.carbs_g * (food.quantity || 1))?.toFixed(1) || '0',
          (food.fat_g * (food.quantity || 1))?.toFixed(1) || '0',
          escapeCSV(food.portion || ''),
          food.quantity?.toString() || '1',
          meal.timestamp || '',
        ].join(','));
      });
    } else {
      // Meal with no foods (shouldn't happen but handle it)
      rows.push([
        mealDate,
        meal.mealType || '',
        'No foods logged',
        meal.totalCalories?.toString() || '0',
        meal.totalProtein?.toString() || '0',
        meal.totalCarbs?.toString() || '0',
        meal.totalFat?.toString() || '0',
        '', '1',
        meal.timestamp || '',
      ].join(','));
    }
  });
  
  console.log('📊 CSV rows:', rows.length - 1, 'food entries');
  return rows.join('\n');
};

/**
 * Export progress/weight data
 */
export const exportProgress = async (format: ExportFormat): Promise<string> => {
  const { weightEntries } = useProgressStore.getState();
  
  console.log('📊 Exporting progress:', weightEntries.length, 'entries');
  
  if (format === 'json') {
    return JSON.stringify(weightEntries, null, 2);
  }
  
  const rows: string[] = [];
  rows.push('Date,Weight,Unit');
  
  // Sort by date (newest first)
  const sorted = [...weightEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  sorted.forEach(entry => {
    rows.push(`${entry.date},${entry.weight},${entry.unit || 'kg'}`);
  });
  
  return rows.join('\n');
};

/**
 * Export recipes
 */
export const exportRecipes = async (format: ExportFormat): Promise<string> => {
  const { recipes } = useRecipeStore.getState();
  
  console.log('📊 Exporting recipes:', recipes.length, 'recipes');
  
  if (format === 'json') {
    return JSON.stringify(recipes, null, 2);
  }
  
  const rows: string[] = [];
  rows.push('Recipe Name,Servings,Total Calories,Total Protein (g),Total Carbs (g),Total Fat (g),Calories/Serving,Ingredient,Ingredient Calories,Ingredient Protein,Amount,Unit,Created');
  
  recipes.forEach(recipe => {
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach((ingredient, index) => {
        rows.push([
          index === 0 ? escapeCSV(recipe.name || '') : '', // Only show recipe name on first row
          index === 0 ? (recipe.servings?.toString() || '1') : '',
          index === 0 ? (recipe.totalCalories?.toFixed(0) || '0') : '',
          index === 0 ? (recipe.totalProtein?.toFixed(1) || '0') : '',
          index === 0 ? (recipe.totalCarbs?.toFixed(1) || '0') : '',
          index === 0 ? (recipe.totalFat?.toFixed(1) || '0') : '',
          index === 0 ? (recipe.caloriesPerServing?.toFixed(0) || '0') : '',
          escapeCSV(ingredient.name || ''),
          ingredient.calories?.toFixed(0) || '0',
          ingredient.protein_g?.toFixed(1) || '0',
          ingredient.amount?.toString() || '1',
          ingredient.unit || '',
          index === 0 ? (recipe.createdAt || '') : '',
        ].join(','));
      });
    } else {
      // Recipe with no ingredients
      rows.push([
        escapeCSV(recipe.name || ''),
        recipe.servings?.toString() || '1',
        recipe.totalCalories?.toFixed(0) || '0',
        recipe.totalProtein?.toFixed(1) || '0',
        recipe.totalCarbs?.toFixed(1) || '0',
        recipe.totalFat?.toFixed(1) || '0',
        recipe.caloriesPerServing?.toFixed(0) || '0',
        'No ingredients',
        '0', '0', '', '',
        recipe.createdAt || '',
      ].join(','));
    }
  });
  
  return rows.join('\n');
};

/**
 * Export all data
 */
export const exportAllData = async (format: ExportFormat): Promise<string> => {
  const { meals } = useMealStore.getState();
  const { weightEntries } = useProgressStore.getState();
  const { recipes } = useRecipeStore.getState();
  
  const allData = {
    exportDate: new Date().toISOString(),
    appName: 'NutriSnap',
    summary: {
      totalMeals: meals.length,
      totalFoodItems: meals.reduce((sum, m) => sum + m.foods.length, 0),
      totalWeightEntries: weightEntries.length,
      totalRecipes: recipes.length,
    },
    meals: meals,
    weightProgress: weightEntries,
    recipes: recipes,
  };
  
  if (format === 'json') {
    return JSON.stringify(allData, null, 2);
  }
  
  // For CSV "all" export, create a comprehensive meals + nutrition log
  // This is the most useful format for spreadsheet analysis
  const rows: string[] = [];
  
  // Header row
  rows.push('Date,Meal Type,Food Name,Calories,Protein (g),Carbs (g),Fat (g),Portion,Quantity,Time Logged');
  
  // Sort meals by timestamp
  const sortedMeals = [...meals].sort((a, b) => 
    new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
  );
  
  // Add meal data
  sortedMeals.forEach(meal => {
    const mealDate = meal.timestamp ? meal.timestamp.split('T')[0] : '';
    
    if (meal.foods && meal.foods.length > 0) {
      meal.foods.forEach(food => {
        const row = [
          mealDate,
          meal.mealType || '',
          escapeCSV(food.name || ''),
          (food.calories * (food.quantity || 1))?.toFixed(0) || '0',
          (food.protein_g * (food.quantity || 1))?.toFixed(1) || '0',
          (food.carbs_g * (food.quantity || 1))?.toFixed(1) || '0',
          (food.fat_g * (food.quantity || 1))?.toFixed(1) || '0',
          escapeCSV(food.portion || ''),
          food.quantity?.toString() || '1',
          meal.timestamp || '',
        ];
        rows.push(row.join(','));
      });
    }
  });
  
  // Add empty row and weight data section
  if (weightEntries.length > 0) {
    rows.push('');
    rows.push('');
    rows.push('Weight Progress');
    rows.push('Date,Weight,Unit');
    
    const sortedWeight = [...weightEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    sortedWeight.forEach(entry => {
      rows.push(`${entry.date},${entry.weight},${entry.unit || 'kg'}`);
    });
  }
  
  // Add recipes section
  if (recipes.length > 0) {
    rows.push('');
    rows.push('');
    rows.push('Custom Recipes');
    rows.push('Recipe Name,Servings,Total Calories,Total Protein,Total Carbs,Total Fat,Ingredient Count');
    
    recipes.forEach(recipe => {
      rows.push([
        escapeCSV(recipe.name || ''),
        recipe.servings?.toString() || '1',
        recipe.totalCalories?.toString() || '0',
        recipe.totalProtein?.toString() || '0',
        recipe.totalCarbs?.toString() || '0',
        recipe.totalFat?.toString() || '0',
        recipe.ingredients?.length?.toString() || '0',
      ].join(','));
    });
  }
  
  return rows.join('\n');
};

/**
 * Get the document directory path
 * Handles both old and new expo-file-system API
 */
const getDocumentDirectory = (): string | null => {
  // Try legacy API first
  if (FileSystem.documentDirectory) {
    return FileSystem.documentDirectory;
  }
  
  // Try new API (Paths object)
  if (FileSystem.Paths?.document) {
    return FileSystem.Paths.document;
  }
  
  // Try Directory class
  if (FileSystem.Directory) {
    try {
      const docDir = new FileSystem.Directory(FileSystem.Paths?.document || 'document');
      return docDir.uri || null;
    } catch (e) {
      console.log('Directory class error:', e);
    }
  }
  
  return null;
};

/**
 * Get the cache directory path
 */
const getCacheDirectory = (): string | null => {
  if (FileSystem.cacheDirectory) {
    return FileSystem.cacheDirectory;
  }
  
  if (FileSystem.Paths?.cache) {
    return FileSystem.Paths.cache;
  }
  
  return null;
};

/**
 * Generate and share export file
 */
export const generateExportFile = async (options: ExportOptions): Promise<boolean> => {
  try {
    // Debug FileSystem module
    console.log('🔍 Debug FileSystem:');
    console.log('  - FileSystem keys:', Object.keys(FileSystem || {}).join(', '));
    console.log('  - Paths:', FileSystem.Paths);
    console.log('  - documentDirectory (legacy):', FileSystem.documentDirectory);
    
    let content: string;
    let filename: string;
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (options.dataType) {
      case 'meals':
        content = await exportMeals(options.format);
        filename = `nutrisnap-meals-${timestamp}.${options.format}`;
        break;
      case 'progress':
        content = await exportProgress(options.format);
        filename = `nutrisnap-progress-${timestamp}.${options.format}`;
        break;
      case 'recipes':
        content = await exportRecipes(options.format);
        filename = `nutrisnap-recipes-${timestamp}.${options.format}`;
        break;
      case 'all':
      default:
        content = await exportAllData(options.format);
        filename = `nutrisnap-all-data-${timestamp}.${options.format}`;
        break;
    }
    
    // Try new File API first (expo-file-system v19+)
    if (FileSystem.File) {
      try {
        console.log('📁 Using new File API...');
        const file = new FileSystem.File(FileSystem.Paths?.cache || 'cache', filename);
        await file.write(content);
        console.log('✅ File written with new API:', file.uri);
        
        // Share the file
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          throw new Error('Sharing is not available on this device');
        }
        
        await Sharing.shareAsync(file.uri, {
          mimeType: options.format === 'json' ? 'application/json' : 'text/csv',
          dialogTitle: 'Export Your NutriSnap Data',
        });
        
        return true;
      } catch (newApiError) {
        console.log('⚠️ New File API failed, trying legacy:', newApiError);
      }
    }
    
    // Fallback to legacy API
    let directory = getDocumentDirectory() || getCacheDirectory();
    
    if (!directory) {
      console.error('❌ No directory available');
      throw new Error(
        'Export is not available in this build.\n\n' +
        'The file system module has a newer API structure.\n' +
        'Please contact support or try updating expo-file-system.'
      );
    }
    
    // Ensure directory ends with /
    if (!directory.endsWith('/')) {
      directory += '/';
    }
    
    // Save to file system
    const fileUri = `${directory}${filename}`;
    console.log('📁 Writing file to:', fileUri);
    
    await FileSystem.writeAsStringAsync(fileUri, content);
    console.log('✅ File written successfully');
    
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }
    
    // Share the file
    await Sharing.shareAsync(fileUri, {
      mimeType: options.format === 'json' ? 'application/json' : 'text/csv',
      dialogTitle: 'Export Your NutriSnap Data',
      UTI: options.format === 'json' ? 'public.json' : 'public.comma-separated-values-text',
    });
    
    return true;
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
};

/**
 * Get export summary (for display before export)
 */
export const getExportSummary = (): {
  mealsCount: number;
  foodItemsCount: number;
  weightEntriesCount: number;
  recipesCount: number;
} => {
  const { meals } = useMealStore.getState();
  const { weightEntries } = useProgressStore.getState();
  const { recipes } = useRecipeStore.getState();
  
  const foodItemsCount = meals.reduce((sum, meal) => sum + meal.foods.length, 0);
  
  return {
    mealsCount: meals.length,
    foodItemsCount,
    weightEntriesCount: weightEntries.length,
    recipesCount: recipes.length,
  };
};

