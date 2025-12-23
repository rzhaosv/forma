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
export async function analyzeFoodPhoto(imageUri: string): Promise<FoodRecognitionResult> {
  const startTime = Date.now();

  try {
    // Get API key from environment
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Read the image file and convert to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);

    // precision: approx 0.75 bytes per character for base64
    const sizeInKb = (base64.length * 0.75) / 1024;
    console.log(`📸 Image size: ${sizeInKb.toFixed(2)} KB`);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    // Call OpenAI Vision API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.2', // Latest "Thinking" model released Dec 2025
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: `Analyze the provided food photo using your advanced reasoning (Thinking) capabilities to provide a precise nutritionist's breakdown.
            
If the image contains a mixed meal (like a sandwich, salad, or bowl), use your spatial reasoning to decompose it into its primary ingredients (e.g., Bread, Main protein, specific veggies or sauces) so the user can see exactly where the calories are coming from.

PORTION REASONING:
- Estimate weights based on standard food servings and visual context.
- Bread: For a sandwich, check if it's 2 slices (~80g) or a large roll (~100g+).
- Protein: A typical protein portion (tuna, chicken) is 100-150g for a full meal.
- Fats: Account for condiments (mayo, butter) which add significant calories.

Return the result strictly in this JSON format:
{
  "foods": [
    {
      "name": "Specific ingredient or item name",
      "confidence": 99,
      "serving_size": "Estimated portion (e.g., 90g, 2 slices)",
      "calories": 250,
      "protein_g": 20,
      "carbs_g": 30,
      "fat_g": 10
    }
  ]
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                },
              },
              {
                type: 'text',
                text: "Use your thinking capabilities to identify all foods and ingredients in this image. Break down complex items into their core components with calories and macros for each."
              }
            ],
          },
        ],
        max_completion_tokens: 1000,
      }),
    });

    clearTimeout(timeoutId);

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await openaiResponse.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    console.log('OpenAI raw response:', content);

    // Extract JSON from the response (in case there's markdown or extra text)
    let jsonString = content.trim();

    // Remove markdown code blocks if present
    if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    // Find JSON object in the response
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Attempted to parse:', jsonString);
      throw new Error('Failed to parse AI response. The AI may have returned unexpected format.');
    }

    const foods: IdentifiedFood[] = parsed.foods || [];

    // Calculate total calories
    const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);

    const analysisTime = Date.now() - startTime;

    return {
      success: true,
      foods,
      total_calories: totalCalories,
      analysis_time_ms: analysisTime,
    };

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Food recognition timeout');
      return {
        success: false,
        foods: [],
        total_calories: 0,
        analysis_time_ms: Date.now() - startTime,
        error: 'Analysis timed out. Please check your internet connection and try again.',
      };
    }

    console.error('Food recognition error:', error);

    return {
      success: false,
      foods: [],
      total_calories: 0,
      analysis_time_ms: Date.now() - startTime,
      error: error.message || 'Failed to analyze food photo',
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
      // Remove data:image/jpeg;base64, prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Mock food recognition for testing without API key
 * Remove this once real API is configured
 */
export async function mockAnalyzeFoodPhoto(imageUri: string): Promise<FoodRecognitionResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    success: true,
    foods: [
      {
        name: 'Grilled Chicken Breast',
        confidence: 92,
        serving_size: '150g',
        calories: 248,
        protein_g: 46.5,
        carbs_g: 0,
        fat_g: 5.5,
      },
      {
        name: 'Brown Rice',
        confidence: 88,
        serving_size: '200g',
        calories: 218,
        protein_g: 4.5,
        carbs_g: 45.8,
        fat_g: 1.6,
      },
      {
        name: 'Steamed Broccoli',
        confidence: 85,
        serving_size: '100g',
        calories: 35,
        protein_g: 2.4,
        carbs_g: 7.2,
        fat_g: 0.4,
      },
    ],
    total_calories: 501,
    analysis_time_ms: 2000,
  };
}

