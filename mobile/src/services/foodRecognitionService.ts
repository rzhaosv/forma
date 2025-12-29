// OpenAI Vision API Service for Food Recognition
// Analyzes food photos and returns identified foods with nutrition estimates

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
  error?: string;
}

/**
 * Analyze a food photo using OpenAI Vision API
 * @param imageUri - Local URI of the captured photo
 * @returns Identified foods with nutrition information
 */
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

/**
 * Analyze a food photo using OpenAI Vision API
 * @param imageUri - Local URI of the captured photo
 * @returns Identified foods with nutrition information
 */
export async function analyzeFoodPhoto(imageUri: string): Promise<FoodRecognitionResult> {
  const startTime = Date.now();

  try {
    if (!OPENAI_API_KEY) throw new Error('OpenAI API Key is missing');

    // 1. Fetch image and convert to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64Image = await blobToBase64(blob);

    // 2. Call OpenAI Vision API
    const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert nutritionist. Analyze this food image and identify the food items present.
            Estimate the serving size and nutritional content for each item.
            Return ONLY a valid JSON object with the following structure:
            {
              "success": true,
              "foods": [
                {
                  "name": "Food Name",
                  "confidence": 95,
                  "serving_size": "e.g. 1 medium bowl",
                  "calories": 0,
                  "protein_g": 0,
                  "carbs_g": 0,
                  "fat_g": 0
                }
              ],
              "total_calories": 0
            }
            If no food is detected, return { "success": false, "foods": [], "total_calories": 0 }.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this meal.' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
      }),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('OpenAI API Error:', data);
      throw new Error(data.error?.message || 'Failed to analyze image');
    }

    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    return {
      success: result.success,
      foods: result.foods || [],
      total_calories: result.total_calories || 0,
      analysis_time_ms: Date.now() - startTime,
    };

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
      // Remove data:image/jpeg;base64, prefix if present, otherwise assume it's the whole string
      const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
