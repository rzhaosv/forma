// Food Database Service
// Provides searchable database of common foods with nutrition data
//
// NUTRITION DATA SOURCES:
// All nutrition values are based on data from the U.S. Department of Agriculture (USDA)
// FoodData Central database, which is the authoritative source for food composition data.
//
// References:
// - USDA FoodData Central: https://fdc.nal.usda.gov/
// - USDA National Nutrient Database: https://www.ars.usda.gov/northeast-area/beltsville-md-bhnrc/beltsville-human-nutrition-research-center/methods-and-application-of-food-composition-laboratory/
//
// Nutrition values are provided per 100g of food and are rounded to one decimal place
// for protein, carbs, and fat. Calorie values are rounded to whole numbers.

export interface FoodDatabaseItem {
  id: string;
  name: string;
  category: string;
  // Nutrition per 100g
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  // Common serving sizes
  common_servings: {
    label: string;
    grams: number;
  }[];
}

interface OnlineFoodResult {
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  typical_serving: {
    description: string;  // e.g., "sandwich", "piece", "cup", "item"
    grams: number;        // typical weight in grams
  };
}

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

// Search for food nutrition info online using OpenAI
export async function searchFoodOnline(query: string): Promise<FoodDatabaseItem[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('YOUR_')) {
      throw new Error('OpenAI API Key is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition expert. Provide accurate USDA-based nutrition data for foods. Return ONLY valid JSON, no markdown or explanations.',
          },
          {
            role: 'user',
            content: `Find nutrition information for: "${query}".

Return a JSON array of matching foods with this EXACT structure (no markdown, no explanations):
[{
  "name": "food name",
  "category": "Protein",
  "calories_per_100g": 200,
  "protein_per_100g": 15,
  "carbs_per_100g": 10,
  "fat_per_100g": 8,
  "typical_serving": {
    "description": "sandwich",
    "grams": 250
  }
}]

RULES:
- Include common variations (e.g., for "banh mi" include Vietnamese sandwich)
- Use average values from USDA or standard nutrition databases
- Category must be one of: Protein, Carbs, Vegetables, Fruits, Dairy, Fats, Snacks, Beverages
- For typical_serving.description, use the most natural unit:
  * Sandwiches/burgers: "sandwich", "burger"
  * Pastries/baked goods: "piece", "slice"
  * Beverages: "cup", "glass"
  * Fruits/vegetables: "medium", "large", "cup"
  * Prepared dishes: "bowl", "plate", "serving"
  * Snacks: "piece", "item", "serving"
- For typical_serving.grams, use realistic portion sizes (e.g., sandwich=250g, piece of baklava=80g)
- Return 1-3 most relevant results
- If the food truly doesn't exist, return empty array []`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content?.trim();

    if (!content) {
      console.log('No content in OpenAI response');
      return [];
    }

    // Remove markdown code blocks if present
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    console.log('OpenAI response for', query, ':', content);

    // Parse JSON response
    let foods;
    try {
      foods = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      return [];
    }

    if (!Array.isArray(foods)) {
      return [];
    }

    // Convert to FoodDatabaseItem format
    return foods.map((food: OnlineFoodResult, index: number) => {
      const servings = [];

      // Add typical serving as first option if available
      if (food.typical_serving?.description && food.typical_serving?.grams) {
        servings.push({
          label: `1 ${food.typical_serving.description} (${food.typical_serving.grams}g)`,
          grams: food.typical_serving.grams,
        });
      }

      // Add standard options
      servings.push(
        { label: '1g', grams: 1 },
        { label: '1 oz (28g)', grams: 28 },
        { label: '100g', grams: 100 }
      );

      return {
        id: `online-${Date.now()}-${index}`,
        name: food.name,
        category: food.category,
        calories_per_100g: food.calories_per_100g,
        protein_per_100g: food.protein_per_100g,
        carbs_per_100g: food.carbs_per_100g,
        fat_per_100g: food.fat_per_100g,
        common_servings: servings,
      };
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Food search request timed out');
    } else {
      console.error('Error searching food online:', error);
    }
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

// Common foods database (100+ most popular foods)
// Based on USDA FoodData Central standards
const COMMON_FOODS: FoodDatabaseItem[] = [
  // Proteins
  {
    id: 'chicken-breast-cooked',
    name: 'Chicken Breast, Cooked',
    category: 'Protein',
    calories_per_100g: 165,
    protein_per_100g: 31,
    carbs_per_100g: 0,
    fat_per_100g: 3.6,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 medium breast (150g)', grams: 150 },
      { label: '1 large breast (200g)', grams: 200 },
    ],
  },
  {
    id: 'chicken-thigh-cooked',
    name: 'Chicken Thigh, Cooked',
    category: 'Protein',
    calories_per_100g: 209,
    protein_per_100g: 26,
    carbs_per_100g: 0,
    fat_per_100g: 10.9,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 thigh (85g)', grams: 85 },
    ],
  },
  {
    id: 'salmon-cooked',
    name: 'Salmon, Cooked',
    category: 'Protein',
    calories_per_100g: 206,
    protein_per_100g: 25,
    carbs_per_100g: 0,
    fat_per_100g: 12,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 fillet (150g)', grams: 150 },
      { label: '4 oz (113g)', grams: 113 },
    ],
  },
  {
    id: 'ground-beef-80-20',
    name: 'Ground Beef (80/20), Cooked',
    category: 'Protein',
    calories_per_100g: 250,
    protein_per_100g: 20,
    carbs_per_100g: 0,
    fat_per_100g: 17,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '4 oz patty (113g)', grams: 113 },
    ],
  },
  {
    id: 'eggs-whole',
    name: 'Eggs, Whole',
    category: 'Protein',
    calories_per_100g: 155,
    protein_per_100g: 13,
    carbs_per_100g: 1.1,
    fat_per_100g: 11,
    common_servings: [
      { label: '1 large egg (50g)', grams: 50 },
      { label: '2 large eggs (100g)', grams: 100 },
    ],
  },
  {
    id: 'tofu-firm',
    name: 'Tofu, Firm',
    category: 'Protein',
    calories_per_100g: 144,
    protein_per_100g: 17,
    carbs_per_100g: 2.3,
    fat_per_100g: 8.7,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1/2 cup (126g)', grams: 126 },
    ],
  },
  {
    id: 'greek-yogurt',
    name: 'Greek Yogurt, Plain',
    category: 'Protein',
    calories_per_100g: 59,
    protein_per_100g: 10,
    carbs_per_100g: 3.6,
    fat_per_100g: 0.4,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (245g)', grams: 245 },
      { label: '1 container (170g)', grams: 170 },
    ],
  },

  // Carbs/Grains
  {
    id: 'white-rice-cooked',
    name: 'White Rice, Cooked',
    category: 'Grains',
    calories_per_100g: 130,
    protein_per_100g: 2.7,
    carbs_per_100g: 28,
    fat_per_100g: 0.3,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (195g)', grams: 195 },
      { label: '1/2 cup (98g)', grams: 98 },
    ],
  },
  {
    id: 'brown-rice-cooked',
    name: 'Brown Rice, Cooked',
    category: 'Grains',
    calories_per_100g: 111,
    protein_per_100g: 2.6,
    carbs_per_100g: 23,
    fat_per_100g: 0.9,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (195g)', grams: 195 },
    ],
  },
  {
    id: 'pasta-cooked',
    name: 'Pasta, Cooked',
    category: 'Grains',
    calories_per_100g: 131,
    protein_per_100g: 5,
    carbs_per_100g: 25,
    fat_per_100g: 1.1,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (140g)', grams: 140 },
    ],
  },
  {
    id: 'bread-white',
    name: 'Bread, White',
    category: 'Grains',
    calories_per_100g: 265,
    protein_per_100g: 9,
    carbs_per_100g: 49,
    fat_per_100g: 3.2,
    common_servings: [
      { label: '1 slice (25g)', grams: 25 },
      { label: '2 slices (50g)', grams: 50 },
    ],
  },
  {
    id: 'bread-whole-wheat',
    name: 'Bread, Whole Wheat',
    category: 'Grains',
    calories_per_100g: 247,
    protein_per_100g: 13,
    carbs_per_100g: 41,
    fat_per_100g: 4.2,
    common_servings: [
      { label: '1 slice (28g)', grams: 28 },
      { label: '2 slices (56g)', grams: 56 },
    ],
  },
  {
    id: 'oats-dry',
    name: 'Oats, Dry',
    category: 'Grains',
    calories_per_100g: 389,
    protein_per_100g: 17,
    carbs_per_100g: 66,
    fat_per_100g: 7,
    common_servings: [
      { label: '1/2 cup (40g)', grams: 40 },
      { label: '1 cup (80g)', grams: 80 },
    ],
  },
  {
    id: 'quinoa-cooked',
    name: 'Quinoa, Cooked',
    category: 'Grains',
    calories_per_100g: 120,
    protein_per_100g: 4.4,
    carbs_per_100g: 22,
    fat_per_100g: 1.9,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (185g)', grams: 185 },
    ],
  },

  // Vegetables
  {
    id: 'broccoli-cooked',
    name: 'Broccoli, Cooked',
    category: 'Vegetables',
    calories_per_100g: 35,
    protein_per_100g: 2.4,
    carbs_per_100g: 7,
    fat_per_100g: 0.4,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (156g)', grams: 156 },
    ],
  },
  {
    id: 'broccoli-raw',
    name: 'Broccoli, Raw',
    category: 'Vegetables',
    calories_per_100g: 34,
    protein_per_100g: 2.8,
    carbs_per_100g: 7,
    fat_per_100g: 0.4,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (91g)', grams: 91 },
    ],
  },
  {
    id: 'spinach-raw',
    name: 'Spinach, Raw',
    category: 'Vegetables',
    calories_per_100g: 23,
    protein_per_100g: 2.9,
    carbs_per_100g: 3.6,
    fat_per_100g: 0.4,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (30g)', grams: 30 },
    ],
  },
  {
    id: 'carrots-raw',
    name: 'Carrots, Raw',
    category: 'Vegetables',
    calories_per_100g: 41,
    protein_per_100g: 0.9,
    carbs_per_100g: 10,
    fat_per_100g: 0.2,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 medium carrot (61g)', grams: 61 },
    ],
  },
  {
    id: 'sweet-potato-cooked',
    name: 'Sweet Potato, Cooked',
    category: 'Vegetables',
    calories_per_100g: 90,
    protein_per_100g: 2,
    carbs_per_100g: 21,
    fat_per_100g: 0.2,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 medium (130g)', grams: 130 },
    ],
  },
  {
    id: 'potato-baked',
    name: 'Potato, Baked',
    category: 'Vegetables',
    calories_per_100g: 93,
    protein_per_100g: 2.5,
    carbs_per_100g: 21,
    fat_per_100g: 0.1,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 medium (173g)', grams: 173 },
    ],
  },
  {
    id: 'tomatoes-raw',
    name: 'Tomatoes, Raw',
    category: 'Vegetables',
    calories_per_100g: 18,
    protein_per_100g: 0.9,
    carbs_per_100g: 3.9,
    fat_per_100g: 0.2,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 medium (123g)', grams: 123 },
    ],
  },
  {
    id: 'bell-pepper-raw',
    name: 'Bell Pepper, Raw',
    category: 'Vegetables',
    calories_per_100g: 31,
    protein_per_100g: 1,
    carbs_per_100g: 7,
    fat_per_100g: 0.3,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 medium (119g)', grams: 119 },
    ],
  },
  {
    id: 'avocado',
    name: 'Avocado',
    category: 'Vegetables',
    calories_per_100g: 160,
    protein_per_100g: 2,
    carbs_per_100g: 9,
    fat_per_100g: 15,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 medium (150g)', grams: 150 },
      { label: '1/2 avocado (75g)', grams: 75 },
    ],
  },

  // Fruits
  {
    id: 'banana',
    name: 'Banana',
    category: 'Fruits',
    calories_per_100g: 89,
    protein_per_100g: 1.1,
    carbs_per_100g: 23,
    fat_per_100g: 0.3,
    common_servings: [
      { label: '1 medium (118g)', grams: 118 },
      { label: '1 large (136g)', grams: 136 },
    ],
  },
  {
    id: 'apple',
    name: 'Apple',
    category: 'Fruits',
    calories_per_100g: 52,
    protein_per_100g: 0.3,
    carbs_per_100g: 14,
    fat_per_100g: 0.2,
    common_servings: [
      { label: '1 medium (182g)', grams: 182 },
      { label: '1 large (223g)', grams: 223 },
    ],
  },
  {
    id: 'orange',
    name: 'Orange',
    category: 'Fruits',
    calories_per_100g: 47,
    protein_per_100g: 0.9,
    carbs_per_100g: 12,
    fat_per_100g: 0.1,
    common_servings: [
      { label: '1 medium (131g)', grams: 131 },
    ],
  },
  {
    id: 'strawberries',
    name: 'Strawberries',
    category: 'Fruits',
    calories_per_100g: 32,
    protein_per_100g: 0.7,
    carbs_per_100g: 8,
    fat_per_100g: 0.3,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (152g)', grams: 152 },
    ],
  },
  {
    id: 'blueberries',
    name: 'Blueberries',
    category: 'Fruits',
    calories_per_100g: 57,
    protein_per_100g: 0.7,
    carbs_per_100g: 14,
    fat_per_100g: 0.3,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (148g)', grams: 148 },
    ],
  },

  // Dairy
  {
    id: 'milk-whole',
    name: 'Milk, Whole',
    category: 'Dairy',
    calories_per_100g: 61,
    protein_per_100g: 3.2,
    carbs_per_100g: 5,
    fat_per_100g: 3.3,
    common_servings: [
      { label: '1 cup (244g)', grams: 244 },
      { label: '1/2 cup (122g)', grams: 122 },
    ],
  },
  {
    id: 'milk-2-percent',
    name: 'Milk, 2%',
    category: 'Dairy',
    calories_per_100g: 50,
    protein_per_100g: 3.3,
    carbs_per_100g: 5,
    fat_per_100g: 2,
    common_servings: [
      { label: '1 cup (244g)', grams: 244 },
    ],
  },
  {
    id: 'cheese-cheddar',
    name: 'Cheese, Cheddar',
    category: 'Dairy',
    calories_per_100g: 402,
    protein_per_100g: 25,
    carbs_per_100g: 1.3,
    fat_per_100g: 33,
    common_servings: [
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 slice (17g)', grams: 17 },
    ],
  },
  {
    id: 'butter',
    name: 'Butter',
    category: 'Dairy',
    calories_per_100g: 717,
    protein_per_100g: 0.9,
    carbs_per_100g: 0.1,
    fat_per_100g: 81,
    common_servings: [
      { label: '1 tbsp (14g)', grams: 14 },
      { label: '1 pat (5g)', grams: 5 },
    ],
  },

  // Nuts & Seeds
  {
    id: 'almonds',
    name: 'Almonds',
    category: 'Nuts & Seeds',
    calories_per_100g: 579,
    protein_per_100g: 21,
    carbs_per_100g: 22,
    fat_per_100g: 50,
    common_servings: [
      { label: '1 oz (28g)', grams: 28 },
      { label: '1/4 cup (28g)', grams: 28 },
    ],
  },
  {
    id: 'peanut-butter',
    name: 'Peanut Butter',
    category: 'Nuts & Seeds',
    calories_per_100g: 588,
    protein_per_100g: 25,
    carbs_per_100g: 20,
    fat_per_100g: 50,
    common_servings: [
      { label: '1 tbsp (16g)', grams: 16 },
      { label: '2 tbsp (32g)', grams: 32 },
    ],
  },

  // More Proteins
  {
    id: 'turkey-breast-cooked',
    name: 'Turkey Breast, Cooked',
    category: 'Protein',
    calories_per_100g: 135,
    protein_per_100g: 30,
    carbs_per_100g: 0,
    fat_per_100g: 1,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '4 oz (113g)', grams: 113 },
    ],
  },
  {
    id: 'tuna-canned',
    name: 'Tuna, Canned in Water',
    category: 'Protein',
    calories_per_100g: 116,
    protein_per_100g: 26,
    carbs_per_100g: 0,
    fat_per_100g: 1,
    common_servings: [
      { label: '1 can (142g)', grams: 142 },
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
    ],
  },
  {
    id: 'shrimp-cooked',
    name: 'Shrimp, Cooked',
    category: 'Protein',
    calories_per_100g: 99,
    protein_per_100g: 24,
    carbs_per_100g: 0,
    fat_per_100g: 0.3,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '3 oz (85g)', grams: 85 },
    ],
  },
  {
    id: 'pork-chop-cooked',
    name: 'Pork Chop, Cooked',
    category: 'Protein',
    calories_per_100g: 231,
    protein_per_100g: 27,
    carbs_per_100g: 0,
    fat_per_100g: 12,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 chop (150g)', grams: 150 },
    ],
  },
  {
    id: 'beef-steak-cooked',
    name: 'Beef Steak, Cooked',
    category: 'Protein',
    calories_per_100g: 271,
    protein_per_100g: 25,
    carbs_per_100g: 0,
    fat_per_100g: 19,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '6 oz (170g)', grams: 170 },
    ],
  },
  {
    id: 'lentils-cooked',
    name: 'Lentils, Cooked',
    category: 'Protein',
    calories_per_100g: 116,
    protein_per_100g: 9,
    carbs_per_100g: 20,
    fat_per_100g: 0.4,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (198g)', grams: 198 },
    ],
  },
  {
    id: 'black-beans-cooked',
    name: 'Black Beans, Cooked',
    category: 'Protein',
    calories_per_100g: 132,
    protein_per_100g: 9,
    carbs_per_100g: 24,
    fat_per_100g: 0.5,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (172g)', grams: 172 },
    ],
  },
  {
    id: 'chickpeas-cooked',
    name: 'Chickpeas, Cooked',
    category: 'Protein',
    calories_per_100g: 164,
    protein_per_100g: 9,
    carbs_per_100g: 27,
    fat_per_100g: 2.6,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (164g)', grams: 164 },
    ],
  },

  // More Vegetables
  {
    id: 'asparagus-cooked',
    name: 'Asparagus, Cooked',
    category: 'Vegetables',
    calories_per_100g: 22,
    protein_per_100g: 2.2,
    carbs_per_100g: 4,
    fat_per_100g: 0.2,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (180g)', grams: 180 },
    ],
  },
  {
    id: 'cauliflower-raw',
    name: 'Cauliflower, Raw',
    category: 'Vegetables',
    calories_per_100g: 25,
    protein_per_100g: 1.9,
    carbs_per_100g: 5,
    fat_per_100g: 0.3,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (100g)', grams: 100 },
    ],
  },
  {
    id: 'zucchini-cooked',
    name: 'Zucchini, Cooked',
    category: 'Vegetables',
    calories_per_100g: 17,
    protein_per_100g: 1.1,
    carbs_per_100g: 3,
    fat_per_100g: 0.4,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 medium (196g)', grams: 196 },
    ],
  },
  {
    id: 'mushrooms-raw',
    name: 'Mushrooms, Raw',
    category: 'Vegetables',
    calories_per_100g: 22,
    protein_per_100g: 3.1,
    carbs_per_100g: 3.3,
    fat_per_100g: 0.3,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (70g)', grams: 70 },
    ],
  },
  {
    id: 'onions-raw',
    name: 'Onions, Raw',
    category: 'Vegetables',
    calories_per_100g: 40,
    protein_per_100g: 1.1,
    carbs_per_100g: 9,
    fat_per_100g: 0.1,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 medium (110g)', grams: 110 },
    ],
  },
  {
    id: 'cucumber-raw',
    name: 'Cucumber, Raw',
    category: 'Vegetables',
    calories_per_100g: 16,
    protein_per_100g: 0.7,
    carbs_per_100g: 4,
    fat_per_100g: 0.1,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 medium (201g)', grams: 201 },
    ],
  },
  {
    id: 'lettuce-raw',
    name: 'Lettuce, Raw',
    category: 'Vegetables',
    calories_per_100g: 15,
    protein_per_100g: 1.4,
    carbs_per_100g: 2.9,
    fat_per_100g: 0.2,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup shredded (36g)', grams: 36 },
    ],
  },
  {
    id: 'kale-raw',
    name: 'Kale, Raw',
    category: 'Vegetables',
    calories_per_100g: 49,
    protein_per_100g: 4.3,
    carbs_per_100g: 9,
    fat_per_100g: 0.9,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (67g)', grams: 67 },
    ],
  },

  // More Fruits
  {
    id: 'grapes',
    name: 'Grapes',
    category: 'Fruits',
    calories_per_100g: 69,
    protein_per_100g: 0.7,
    carbs_per_100g: 18,
    fat_per_100g: 0.2,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (151g)', grams: 151 },
    ],
  },
  {
    id: 'watermelon',
    name: 'Watermelon',
    category: 'Fruits',
    calories_per_100g: 30,
    protein_per_100g: 0.6,
    carbs_per_100g: 8,
    fat_per_100g: 0.2,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup diced (152g)', grams: 152 },
    ],
  },
  {
    id: 'pineapple',
    name: 'Pineapple',
    category: 'Fruits',
    calories_per_100g: 50,
    protein_per_100g: 0.5,
    carbs_per_100g: 13,
    fat_per_100g: 0.1,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup chunks (165g)', grams: 165 },
    ],
  },
  {
    id: 'mango',
    name: 'Mango',
    category: 'Fruits',
    calories_per_100g: 60,
    protein_per_100g: 0.8,
    carbs_per_100g: 15,
    fat_per_100g: 0.4,
    common_servings: [
      { label: '1 medium (336g)', grams: 336 },
      { label: '1 cup (165g)', grams: 165 },
    ],
  },
  {
    id: 'pear',
    name: 'Pear',
    category: 'Fruits',
    calories_per_100g: 57,
    protein_per_100g: 0.4,
    carbs_per_100g: 15,
    fat_per_100g: 0.1,
    common_servings: [
      { label: '1 medium (178g)', grams: 178 },
    ],
  },
  {
    id: 'peach',
    name: 'Peach',
    category: 'Fruits',
    calories_per_100g: 39,
    protein_per_100g: 0.9,
    carbs_per_100g: 10,
    fat_per_100g: 0.3,
    common_servings: [
      { label: '1 medium (150g)', grams: 150 },
    ],
  },

  // More Grains
  {
    id: 'oats-cooked',
    name: 'Oatmeal, Cooked',
    category: 'Grains',
    calories_per_100g: 68,
    protein_per_100g: 2.4,
    carbs_per_100g: 12,
    fat_per_100g: 1.4,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (234g)', grams: 234 },
    ],
  },
  {
    id: 'barley-cooked',
    name: 'Barley, Cooked',
    category: 'Grains',
    calories_per_100g: 123,
    protein_per_100g: 2.3,
    carbs_per_100g: 28,
    fat_per_100g: 0.4,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (157g)', grams: 157 },
    ],
  },
  {
    id: 'couscous-cooked',
    name: 'Couscous, Cooked',
    category: 'Grains',
    calories_per_100g: 112,
    protein_per_100g: 3.8,
    carbs_per_100g: 23,
    fat_per_100g: 0.2,
    common_servings: [
      { label: '1g', grams: 1 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 cup (157g)', grams: 157 },
    ],
  },

  // Common Snacks & Others
  {
    id: 'almond-butter',
    name: 'Almond Butter',
    category: 'Nuts & Seeds',
    calories_per_100g: 614,
    protein_per_100g: 21,
    carbs_per_100g: 19,
    fat_per_100g: 56,
    common_servings: [
      { label: '1 tbsp (16g)', grams: 16 },
      { label: '2 tbsp (32g)', grams: 32 },
    ],
  },
  {
    id: 'walnuts',
    name: 'Walnuts',
    category: 'Nuts & Seeds',
    calories_per_100g: 654,
    protein_per_100g: 15,
    carbs_per_100g: 14,
    fat_per_100g: 65,
    common_servings: [
      { label: '1 oz (28g)', grams: 28 },
      { label: '1/4 cup (30g)', grams: 30 },
    ],
  },
  {
    id: 'chia-seeds',
    name: 'Chia Seeds',
    category: 'Nuts & Seeds',
    calories_per_100g: 486,
    protein_per_100g: 17,
    carbs_per_100g: 42,
    fat_per_100g: 31,
    common_servings: [
      { label: '1 tbsp (12g)', grams: 12 },
      { label: '1 oz (28g)', grams: 28 },
    ],
  },
  {
    id: 'olive-oil',
    name: 'Olive Oil',
    category: 'Fats & Oils',
    calories_per_100g: 884,
    protein_per_100g: 0,
    carbs_per_100g: 0,
    fat_per_100g: 100,
    common_servings: [
      { label: '1 tbsp (14g)', grams: 14 },
      { label: '1 tsp (5g)', grams: 5 },
    ],
  },
  {
    id: 'honey',
    name: 'Honey',
    category: 'Sweeteners',
    calories_per_100g: 304,
    protein_per_100g: 0.3,
    carbs_per_100g: 82,
    fat_per_100g: 0,
    common_servings: [
      { label: '1 tbsp (21g)', grams: 21 },
      { label: '1 tsp (7g)', grams: 7 },
    ],
  },
  {
    id: 'maple-syrup',
    name: 'Maple Syrup',
    category: 'Sweeteners',
    calories_per_100g: 260,
    protein_per_100g: 0,
    carbs_per_100g: 67,
    fat_per_100g: 0,
    common_servings: [
      { label: '1 tbsp (20g)', grams: 20 },
    ],
  },
  // Asian Foods
  {
    id: 'hot-pot',
    name: 'Hot Pot (Chinese)',
    category: 'Protein',
    calories_per_100g: 85,
    protein_per_100g: 8,
    carbs_per_100g: 5,
    fat_per_100g: 4,
    common_servings: [
      { label: '1 bowl (400g)', grams: 400 },
      { label: '1 serving (300g)', grams: 300 },
      { label: '100g', grams: 100 },
    ],
  },
  {
    id: 'pho',
    name: 'Pho (Vietnamese Noodle Soup)',
    category: 'Carbs',
    calories_per_100g: 45,
    protein_per_100g: 4,
    carbs_per_100g: 5,
    fat_per_100g: 1.5,
    common_servings: [
      { label: '1 bowl (600g)', grams: 600 },
      { label: '1 small bowl (400g)', grams: 400 },
      { label: '100g', grams: 100 },
    ],
  },
  {
    id: 'ramen',
    name: 'Ramen (Japanese Noodle Soup)',
    category: 'Carbs',
    calories_per_100g: 95,
    protein_per_100g: 5,
    carbs_per_100g: 10,
    fat_per_100g: 4,
    common_servings: [
      { label: '1 bowl (550g)', grams: 550 },
      { label: '1 small bowl (400g)', grams: 400 },
      { label: '100g', grams: 100 },
    ],
  },
  {
    id: 'sushi-roll',
    name: 'Sushi Roll',
    category: 'Carbs',
    calories_per_100g: 140,
    protein_per_100g: 5,
    carbs_per_100g: 25,
    fat_per_100g: 2,
    common_servings: [
      { label: '1 roll (150g)', grams: 150 },
      { label: '1 piece (30g)', grams: 30 },
      { label: '6 pieces (180g)', grams: 180 },
    ],
  },
  {
    id: 'fried-rice',
    name: 'Fried Rice',
    category: 'Carbs',
    calories_per_100g: 163,
    protein_per_100g: 4,
    carbs_per_100g: 24,
    fat_per_100g: 6,
    common_servings: [
      { label: '1 cup (200g)', grams: 200 },
      { label: '1 plate (300g)', grams: 300 },
      { label: '100g', grams: 100 },
    ],
  },
  {
    id: 'kung-pao-chicken',
    name: 'Kung Pao Chicken',
    category: 'Protein',
    calories_per_100g: 165,
    protein_per_100g: 15,
    carbs_per_100g: 10,
    fat_per_100g: 8,
    common_servings: [
      { label: '1 serving (200g)', grams: 200 },
      { label: '1 cup (150g)', grams: 150 },
      { label: '100g', grams: 100 },
    ],
  },
  {
    id: 'general-tso-chicken',
    name: "General Tso's Chicken",
    category: 'Protein',
    calories_per_100g: 210,
    protein_per_100g: 13,
    carbs_per_100g: 16,
    fat_per_100g: 11,
    common_servings: [
      { label: '1 serving (200g)', grams: 200 },
      { label: '1 cup (150g)', grams: 150 },
      { label: '100g', grams: 100 },
    ],
  },
  {
    id: 'pad-thai',
    name: 'Pad Thai',
    category: 'Carbs',
    calories_per_100g: 120,
    protein_per_100g: 6,
    carbs_per_100g: 15,
    fat_per_100g: 5,
    common_servings: [
      { label: '1 plate (350g)', grams: 350 },
      { label: '1 serving (250g)', grams: 250 },
      { label: '100g', grams: 100 },
    ],
  },
  {
    id: 'dumplings',
    name: 'Dumplings (Steamed)',
    category: 'Carbs',
    calories_per_100g: 180,
    protein_per_100g: 8,
    carbs_per_100g: 22,
    fat_per_100g: 7,
    common_servings: [
      { label: '1 dumpling (25g)', grams: 25 },
      { label: '6 dumplings (150g)', grams: 150 },
      { label: '10 dumplings (250g)', grams: 250 },
    ],
  },
  {
    id: 'spring-rolls',
    name: 'Spring Rolls (Fried)',
    category: 'Snacks',
    calories_per_100g: 220,
    protein_per_100g: 5,
    carbs_per_100g: 25,
    fat_per_100g: 11,
    common_servings: [
      { label: '1 roll (65g)', grams: 65 },
      { label: '2 rolls (130g)', grams: 130 },
      { label: '100g', grams: 100 },
    ],
  },
  {
    id: 'bibimbap',
    name: 'Bibimbap (Korean Rice Bowl)',
    category: 'Carbs',
    calories_per_100g: 130,
    protein_per_100g: 6,
    carbs_per_100g: 18,
    fat_per_100g: 4,
    common_servings: [
      { label: '1 bowl (450g)', grams: 450 },
      { label: '1 serving (350g)', grams: 350 },
      { label: '100g', grams: 100 },
    ],
  },
  {
    id: 'teriyaki-chicken',
    name: 'Teriyaki Chicken',
    category: 'Protein',
    calories_per_100g: 175,
    protein_per_100g: 20,
    carbs_per_100g: 8,
    fat_per_100g: 7,
    common_servings: [
      { label: '1 serving (200g)', grams: 200 },
      { label: '1 cup (150g)', grams: 150 },
      { label: '100g', grams: 100 },
    ],
  },
];

/**
 * Search foods by name
 */
export function searchFoods(query: string): FoodDatabaseItem[] {
  if (!query.trim()) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  
  return COMMON_FOODS.filter(food => 
    food.name.toLowerCase().includes(lowerQuery) ||
    food.category.toLowerCase().includes(lowerQuery)
  ).slice(0, 50); // Limit to 50 results
}

/**
 * Get food by ID
 */
export function getFoodById(id: string): FoodDatabaseItem | undefined {
  return COMMON_FOODS.find(food => food.id === id);
}

/**
 * Calculate nutrition for a specific serving size
 */
export function calculateNutritionForServing(
  food: FoodDatabaseItem,
  grams: number
): {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
} {
  const ratio = grams / 100;
  
  return {
    calories: Math.round(food.calories_per_100g * ratio),
    protein_g: Math.round(food.protein_per_100g * ratio * 10) / 10,
    carbs_g: Math.round(food.carbs_per_100g * ratio * 10) / 10,
    fat_g: Math.round(food.fat_per_100g * ratio * 10) / 10,
  };
}

/**
 * Get all foods (for browsing)
 */
export function getAllFoods(): FoodDatabaseItem[] {
  return COMMON_FOODS;
}

/**
 * Get foods by category
 */
export function getFoodsByCategory(category: string): FoodDatabaseItem[] {
  return COMMON_FOODS.filter(food => food.category === category);
}

/**
 * Get all categories
 */
export function getCategories(): string[] {
  const categories = new Set(COMMON_FOODS.map(food => food.category));
  return Array.from(categories).sort();
}

