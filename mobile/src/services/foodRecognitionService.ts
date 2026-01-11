// Hybrid Food Recognition Service
// Uses Clarifai for fast food identification + USDA for nutrition data
// OPTIMIZED: 10s → <2s (Clarifai: 300-500ms, USDA: ~500ms)

import { compressFoodPhoto } from '../utils/imageCompression';
import { generateImageHash, getCachedResult, cacheResult } from '../utils/scanCache';
import { identifyFoods } from './clarifaiFoodService';
import { getNutritionInfo, estimateNutrition } from './usdaNutritionService';

export interface IdentifiedFood {
  name: string;
  confidence: number; // 0-100
  serving_size: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface FoodRecognitionResult {
  success: boolean;
  foods: IdentifiedFood[];
  total_calories: number;
  analysis_time_ms: number;
  cached?: boolean;
  error?: string;
}

/**
 * Analyze a food photo using Clarifai + USDA
 * OPTIMIZED FOR SPEED:
 * - Compresses image to ~100-150KB → saves upload time
 * - Uses Clarifai food model (300-500ms) instead of OpenAI (4s+)
 * - USDA nutrition lookup (~500ms per food, free, no API key)
 * - Checks cache first → instant if previously scanned
 *
 * TARGET: <2 seconds (vs 10s with old OpenAI approach)
 * COST: Clarifai pricing + $0 for USDA (government API)
 *
 * @param imageUri - Local URI of the captured photo
 * @returns Identified foods with nutrition information
 */
export async function analyzeFoodPhoto(imageUri: string): Promise<FoodRecognitionResult> {
  const startTime = Date.now();

  try {
    console.log('📸 Starting food analysis (Clarifai + USDA)...');

    // STEP 1: Compress image
    const compressionStart = Date.now();
    console.log('🗜️ Compressing image...');
    const compressed = await compressFoodPhoto(imageUri);
    console.log(`✅ Compression done in ${Date.now() - compressionStart}ms`);

    // STEP 2: Convert to base64
    const base64Start = Date.now();
    const response = await fetch(compressed.uri);
    const blob = await response.blob();
    const base64Image = await blobToBase64(blob);
    console.log(`✅ Base64 conversion done in ${Date.now() - base64Start}ms (size: ${(base64Image.length / 1024).toFixed(1)}KB)`);

    // STEP 3: Check cache
    const cacheStart = Date.now();
    const imageHash = await generateImageHash(base64Image);
    const cachedResult = await getCachedResult(imageHash);
    console.log(`✅ Cache check done in ${Date.now() - cacheStart}ms`);

    if (cachedResult) {
      console.log('🎯 Cache HIT - returning cached result');
      return {
        ...cachedResult,
        cached: true,
        analysis_time_ms: Date.now() - startTime,
      };
    }

    // STEP 4: Identify foods with Clarifai (fast!)
    const clarifaiStart = Date.now();
    console.log('🤖 Calling Clarifai API...');
    const concepts = await identifyFoods(base64Image);
    console.log(`✅ Clarifai done in ${Date.now() - clarifaiStart}ms - found ${concepts.length} foods`);

    if (concepts.length === 0) {
      return {
        success: false,
        foods: [],
        total_calories: 0,
        analysis_time_ms: Date.now() - startTime,
        error: 'No food detected in image',
      };
    }

    // STEP 5: Get nutrition data for top foods (take top 3 highest confidence)
    const nutritionStart = Date.now();
    console.log('📊 Fetching nutrition data...');

    const topFoods = concepts.slice(0, 3); // Top 3 foods
    const identifiedFoods: IdentifiedFood[] = [];

    for (const concept of topFoods) {
      // Try USDA first, fallback to estimates
      let nutrition = await getNutritionInfo(concept.name);

      if (!nutrition) {
        console.log(`⚠️ No USDA data for ${concept.name}, using estimate`);
        nutrition = estimateNutrition(concept.name);
      }

      identifiedFoods.push({
        name: concept.name,
        confidence: Math.round(concept.value * 100), // Convert 0-1 to 0-100
        serving_size: nutrition.serving_size,
        calories: nutrition.calories,
        protein_g: nutrition.protein_g,
        carbs_g: nutrition.carbs_g,
        fat_g: nutrition.fat_g,
      });

      console.log(`✅ ${concept.name}: ${nutrition.calories} cal (${Math.round(concept.value * 100)}% confidence)`);
    }

    console.log(`✅ Nutrition lookup done in ${Date.now() - nutritionStart}ms`);

    const total_calories = identifiedFoods.reduce((sum, food) => sum + food.calories, 0);

    const finalResult: FoodRecognitionResult = {
      success: true,
      foods: identifiedFoods,
      total_calories,
      analysis_time_ms: Date.now() - startTime,
      cached: false,
    };

    // Cache the result
    if (finalResult.success && finalResult.foods.length > 0) {
      await cacheResult(imageHash, finalResult);
      console.log('💾 Scan result cached');
    }

    console.log(`✅ Analysis complete in ${finalResult.analysis_time_ms}ms`);

    return finalResult;

  } catch (error) {
    console.error('Food analysis failed:', error);
    return {
      success: false,
      foods: [],
      total_calories: 0,
      analysis_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Convert Blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data:image/jpeg;base64, prefix if present
      const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
