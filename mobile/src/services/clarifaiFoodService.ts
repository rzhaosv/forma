// Clarifai Food Recognition Service
// Fast food identification using Clarifai's specialized food model
// Response time: 300-500ms (vs OpenAI's 4+ seconds)

const CLARIFAI_API_KEY = process.env.EXPO_PUBLIC_CLARIFAI_API_KEY;

export interface ClarifaiConcept {
  id: string;
  name: string;
  value: number; // Confidence 0-1
  app_id: string;
}

export interface ClarifaiResponse {
  status: {
    code: number;
    description: string;
  };
  outputs: Array<{
    id: string;
    status: {
      code: number;
      description: string;
    };
    created_at: string;
    model: {
      id: string;
      name: string;
      created_at: string;
      app_id: string;
      output_info: any;
      model_version: {
        id: string;
        created_at: string;
        status: any;
      };
    };
    data: {
      concepts: ClarifaiConcept[];
    };
  }>;
}

/**
 * Identify foods in an image using Clarifai's food-item-recognition model
 * This model recognizes 500+ food types including vegetables, fruits, grains,
 * dairy, meat, seafood, and prepared dishes
 *
 * @param base64Image - Base64 encoded JPEG image
 * @returns Array of identified foods with confidence scores
 */
export async function identifyFoods(base64Image: string): Promise<ClarifaiConcept[]> {
  try {
    if (!CLARIFAI_API_KEY || CLARIFAI_API_KEY.includes('YOUR_')) {
      throw new Error('Clarifai API Key is missing or invalid. Please add EXPO_PUBLIC_CLARIFAI_API_KEY to EAS secrets.');
    }

    const response = await fetch(
      'https://api.clarifai.com/v2/users/clarifai/apps/main/models/food-item-recognition/outputs',
      {
        method: 'POST',
        headers: {
          'Authorization': `Key ${CLARIFAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: [
            {
              data: {
                image: {
                  base64: base64Image,
                },
              },
            },
          ],
        }),
      }
    );

    const data: ClarifaiResponse = await response.json();

    if (!response.ok || data.status.code !== 10000) {
      console.error('Clarifai API Error:', data);
      throw new Error(data.status.description || 'Failed to identify foods');
    }

    if (!data.outputs || data.outputs.length === 0) {
      return [];
    }

    // Return concepts sorted by confidence (highest first)
    const concepts = data.outputs[0].data.concepts || [];
    return concepts.sort((a, b) => b.value - a.value);
  } catch (error) {
    console.error('Clarifai food identification failed:', error);
    throw error;
  }
}
