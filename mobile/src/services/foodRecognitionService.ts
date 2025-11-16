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

    // Call OpenAI Vision API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Latest vision model
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a nutrition expert analyzing food photos. Identify all food items in this image and return ONLY a JSON object with no other text.

For each food item provide:
- name: specific food name
- confidence: 0-100 (how certain you are)
- serving_size: realistic portion (e.g., "150g", "1 cup")
- calories: estimated calories for that serving
- protein_g: protein in grams
- carbs_g: carbohydrates in grams
- fat_g: fat in grams

Return ONLY this JSON structure with NO markdown, NO explanations, NO code blocks:
{
  "foods": [
    {
      "name": "Grilled Chicken Breast",
      "confidence": 92,
      "serving_size": "150g",
      "calories": 248,
      "protein_g": 46.5,
      "carbs_g": 0,
      "fat_g": 5.5
    }
  ]
}

If multiple foods are visible, include all of them in the array. Be realistic with portions and nutrition values.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

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

