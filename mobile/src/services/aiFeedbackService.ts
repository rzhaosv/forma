// AI Feedback Service
// Collects user feedback on AI food recognition accuracy

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AIFeedback {
  mealId: string;
  foodItemId: string;
  aiPrediction: {
    name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    confidence: number;
  };
  userCorrection?: {
    name?: string;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
  };
  feedbackType: 'accurate' | 'edited' | 'deleted';
  notes?: string;
}

/**
 * Track when user edits an AI-suggested food item
 */
export async function trackFoodEdit(
  mealId: string,
  foodItemId: string,
  aiPrediction: AIFeedback['aiPrediction'],
  userCorrection: AIFeedback['userCorrection']
) {
  const feedback: AIFeedback = {
    mealId,
    foodItemId,
    aiPrediction,
    userCorrection,
    feedbackType: 'edited',
  };

  // Store in AsyncStorage for now (can sync to backend later)
  const feedbacks = await getStoredFeedbacks();
  feedbacks.push(feedback);
  await storeFeedbacks(feedbacks);

  console.log('📊 AI Feedback tracked:', feedback);
}

/**
 * Track when user marks AI result as accurate
 */
export async function trackFoodAccurate(
  mealId: string,
  foodItemId: string,
  aiPrediction: AIFeedback['aiPrediction']
) {
  const feedback: AIFeedback = {
    mealId,
    foodItemId,
    aiPrediction,
    feedbackType: 'accurate',
  };

  const feedbacks = await getStoredFeedbacks();
  feedbacks.push(feedback);
  await storeFeedbacks(feedbacks);

  console.log('✅ AI Feedback (accurate):', feedback);
}

/**
 * Track when user deletes an AI-suggested food
 */
export async function trackFoodDeleted(
  mealId: string,
  foodItemId: string,
  aiPrediction: AIFeedback['aiPrediction']
) {
  const feedback: AIFeedback = {
    mealId,
    foodItemId,
    aiPrediction,
    feedbackType: 'deleted',
  };

  const feedbacks = await getStoredFeedbacks();
  feedbacks.push(feedback);
  await storeFeedbacks(feedbacks);

  console.log('❌ AI Feedback (deleted):', feedback);
}

/**
 * Get all stored feedbacks (for analytics)
 */
export async function getStoredFeedbacks(): Promise<AIFeedback[]> {
  try {
    const stored = await AsyncStorage.getItem('ai_feedback');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Store feedbacks in AsyncStorage
 */
async function storeFeedbacks(feedbacks: AIFeedback[]) {
  try {
    await AsyncStorage.setItem('ai_feedback', JSON.stringify(feedbacks));
  } catch (error) {
    console.error('Failed to store AI feedback:', error);
  }
}

/**
 * Calculate accuracy metrics from feedback
 */
export async function calculateAccuracyMetrics(): Promise<{
  totalScans: number;
  accurateCount: number;
  editedCount: number;
  deletedCount: number;
  accuracyRate: number;
  avgConfidence: number;
  avgCalorieError: number;
}> {
  const feedbacks = await getStoredFeedbacks();
  
  const accurate = feedbacks.filter(f => f.feedbackType === 'accurate');
  const edited = feedbacks.filter(f => f.feedbackType === 'edited');
  const deleted = feedbacks.filter(f => f.feedbackType === 'deleted');

  const totalScans = feedbacks.length;
  const accuracyRate = totalScans > 0 ? (accurate.length / totalScans) * 100 : 0;

  // Calculate average confidence
  const avgConfidence = feedbacks.length > 0
    ? feedbacks.reduce((sum, f) => sum + f.aiPrediction.confidence, 0) / feedbacks.length
    : 0;

  // Calculate average calorie error for edited items
  const calorieErrors = edited
    .filter(f => f.userCorrection?.calories && f.aiPrediction.calories)
    .map(f => {
      const error = Math.abs((f.userCorrection!.calories! - f.aiPrediction.calories) / f.aiPrediction.calories * 100);
      return error;
    });

  const avgCalorieError = calorieErrors.length > 0
    ? calorieErrors.reduce((sum, e) => sum + e, 0) / calorieErrors.length
    : 0;

  return {
    totalScans,
    accurateCount: accurate.length,
    editedCount: edited.length,
    deletedCount: deleted.length,
    accuracyRate,
    avgConfidence,
    avgCalorieError,
  };
}

