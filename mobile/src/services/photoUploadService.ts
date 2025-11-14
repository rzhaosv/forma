// Photo Analysis Service
// Sends photos directly to backend API for AI analysis

const API_URL = 'http://localhost:3000'; // Change to your backend URL

export interface AnalysisResult {
  success: boolean;
  foods?: Array<{
    name: string;
    portion: string;
    portion_g: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    confidence: number;
  }>;
  total_calories?: number;
  error?: string;
}

/**
 * Analyze photo for food recognition
 * Sends photo directly to backend API (backend handles OpenAI)
 * No storage needed - photo is processed and discarded
 * 
 * @param photoUri - Local file URI from camera or gallery
 * @returns Analysis result with recognized foods
 */
export async function analyzePhoto(photoUri: string): Promise<AnalysisResult> {
  try {
    // Demo mode - simulate AI response
    console.log('📸 Analyzing photo:', photoUri);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI response (for testing without backend)
    return {
      success: true,
      foods: [
        {
          name: 'Grilled Chicken Breast',
          portion: '150g (1 medium breast)',
          portion_g: 150,
          calories: 248,
          protein_g: 46.5,
          carbs_g: 0,
          fat_g: 5.4,
          confidence: 0.92,
        },
        {
          name: 'Brown Rice',
          portion: '1 cup (cooked)',
          portion_g: 195,
          calories: 218,
          protein_g: 4.5,
          carbs_g: 45.8,
          fat_g: 1.6,
          confidence: 0.88,
        },
        {
          name: 'Broccoli',
          portion: '1/2 cup',
          portion_g: 50,
          calories: 17,
          protein_g: 1.4,
          carbs_g: 3.3,
          fat_g: 0.2,
          confidence: 0.75,
        },
      ],
      total_calories: 483,
    };

    /* Real implementation (uncomment when backend is ready):
    
    // Convert photo to base64
    const response = await fetch(photoUri);
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);

    // Send to backend API
    const apiResponse = await fetch(`${API_URL}/api/v1/ai/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`, // Add auth token
      },
      body: JSON.stringify({
        image_base64: base64,
      }),
    });

    const result = await apiResponse.json();
    return result;
    */
  } catch (error: any) {
    console.error('Analysis error:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze photo',
    };
  }
}

// Helper to convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data:image/jpeg;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Optional: Upload photo to Supabase Storage (for meal diary display)
 * This is only if you want to keep photos in the meal history
 * Not required for AI analysis
 */
export async function savePhotoForDiary(
  photoUri: string,
  userId: string
): Promise<{ success: boolean; url?: string }> {
  // This would upload to Supabase Storage
  // Only call this if user wants to keep the photo in their meal diary
  // For now, we'll skip this to keep it simple
  
  console.log('💡 Photo storage skipped (not needed for AI analysis)');
  return { success: true, url: photoUri };
}

