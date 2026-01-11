// USDA FoodData Central API Service
// Free nutrition database with 300K+ food items
// No API key required, government-verified data

export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

export interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  foodNutrients: USDANutrient[];
}

export interface NutritionInfo {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_size: string;
}

// Nutrient IDs in USDA database
const NUTRIENT_IDS = {
  CALORIES: 1008, // Energy (kcal)
  PROTEIN: 1003,  // Protein
  CARBS: 1005,    // Carbohydrate, by difference
  FAT: 1004,      // Total lipid (fat)
};

/**
 * Search USDA FoodData Central for a food item and get its nutrition info
 * @param foodName - Name of the food to search for
 * @returns Nutrition information or null if not found
 */
export async function getNutritionInfo(foodName: string): Promise<NutritionInfo | null> {
  try {
    // Search for the food
    const searchResponse = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&pageSize=1&api_key=DEMO_KEY`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const searchData = await searchResponse.json();

    if (!searchData.foods || searchData.foods.length === 0) {
      console.log(`No USDA data found for: ${foodName}`);
      return null;
    }

    const food = searchData.foods[0];
    const nutrients = food.foodNutrients || [];

    // Extract macronutrients
    const calories = nutrients.find((n: any) => n.nutrientId === NUTRIENT_IDS.CALORIES)?.value || 0;
    const protein = nutrients.find((n: any) => n.nutrientId === NUTRIENT_IDS.PROTEIN)?.value || 0;
    const carbs = nutrients.find((n: any) => n.nutrientId === NUTRIENT_IDS.CARBS)?.value || 0;
    const fat = nutrients.find((n: any) => n.nutrientId === NUTRIENT_IDS.FAT)?.value || 0;

    return {
      calories: Math.round(calories),
      protein_g: Math.round(protein * 10) / 10,
      carbs_g: Math.round(carbs * 10) / 10,
      fat_g: Math.round(fat * 10) / 10,
      serving_size: food.servingSize ? `${food.servingSize} ${food.servingSizeUnit || 'g'}` : '100g',
    };
  } catch (error) {
    console.error(`USDA lookup failed for ${foodName}:`, error);
    return null;
  }
}

/**
 * Estimate nutrition for common serving sizes
 * Fallback estimates when USDA data is not available
 */
export function estimateNutrition(foodName: string): NutritionInfo {
  const lower = foodName.toLowerCase();

  // Common food estimates (per typical serving)
  if (lower.includes('apple') || lower.includes('orange')) {
    return { calories: 95, protein_g: 0.5, carbs_g: 25, fat_g: 0.3, serving_size: '1 medium' };
  }
  if (lower.includes('banana')) {
    return { calories: 105, protein_g: 1.3, carbs_g: 27, fat_g: 0.4, serving_size: '1 medium' };
  }
  if (lower.includes('egg')) {
    return { calories: 70, protein_g: 6, carbs_g: 0.6, fat_g: 5, serving_size: '1 large' };
  }
  if (lower.includes('chicken breast')) {
    return { calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, serving_size: '100g' };
  }
  if (lower.includes('rice')) {
    return { calories: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3, serving_size: '1 cup cooked' };
  }
  if (lower.includes('bread') || lower.includes('toast')) {
    return { calories: 80, protein_g: 4, carbs_g: 15, fat_g: 1, serving_size: '1 slice' };
  }
  if (lower.includes('salad')) {
    return { calories: 50, protein_g: 2, carbs_g: 10, fat_g: 0.5, serving_size: '1 cup' };
  }
  if (lower.includes('pizza')) {
    return { calories: 285, protein_g: 12, carbs_g: 36, fat_g: 10, serving_size: '1 slice' };
  }
  if (lower.includes('burger') || lower.includes('hamburger')) {
    return { calories: 540, protein_g: 25, carbs_g: 40, fat_g: 29, serving_size: '1 burger' };
  }

  // Default estimate for unknown foods
  return { calories: 150, protein_g: 5, carbs_g: 20, fat_g: 5, serving_size: '1 serving' };
}
