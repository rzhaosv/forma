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
  // Return mock for now if no API key or during development
  // In a real app, you would call OpenAI API here
  return mockAnalyzeFoodPhoto(imageUri);
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
