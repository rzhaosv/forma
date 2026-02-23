import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking } from 'react-native';

// Lazy load StoreReview to prevent crashes on unsupported devices
let StoreReview: typeof import('expo-store-review') | null = null;
const getStoreReview = async () => {
  if (StoreReview === null) {
    try {
      StoreReview = await import('expo-store-review');
    } catch (error) {
      console.warn('[ReviewService] Failed to load expo-store-review:', error);
    }
  }
  return StoreReview;
};

// Storage keys
const STORAGE_KEY_LAST_REVIEW = '@nutrisnap_last_review_prompt_date';
const STORAGE_KEY_UNIQUE_DAYS = '@nutrisnap_unique_days_used';
const STORAGE_KEY_TOTAL_MEALS = '@nutrisnap_total_meals_logged';
const STORAGE_KEY_REVIEW_DECLINED = '@nutrisnap_review_declined';

// Configuration
const COOLDOWN_DAYS = 30; // Don't prompt more than once per month
const MIN_MEALS_REQUIRED = 5; // Must have logged at least 5 meals
const MIN_DAYS_REQUIRED = 3; // Must have used app on at least 3 separate days

// Feedback destinations
const TELEGRAM_URL = 'https://t.me/+tyaqT57kKmQ3MGUx';
const FEEDBACK_EMAIL = 'mailto:tryformaapp@gmail.com?subject=NutriSnap%20Feedback';

/**
 * Track a meal being logged - updates engagement metrics
 */
export const trackMealLogged = async (): Promise<void> => {
  try {
    // Increment total meals
    const mealsStr = await AsyncStorage.getItem(STORAGE_KEY_TOTAL_MEALS);
    const totalMeals = (mealsStr ? parseInt(mealsStr, 10) : 0) + 1;
    await AsyncStorage.setItem(STORAGE_KEY_TOTAL_MEALS, totalMeals.toString());

    // Track unique days
    const today = new Date().toISOString().split('T')[0];
    const daysStr = await AsyncStorage.getItem(STORAGE_KEY_UNIQUE_DAYS);
    const uniqueDays: string[] = daysStr ? JSON.parse(daysStr) : [];
    
    if (!uniqueDays.includes(today)) {
      uniqueDays.push(today);
      await AsyncStorage.setItem(STORAGE_KEY_UNIQUE_DAYS, JSON.stringify(uniqueDays));
    }

    console.log(`[ReviewService] Engagement: ${totalMeals} meals, ${uniqueDays.length} unique days`);
  } catch (error) {
    console.error('[ReviewService] Error tracking meal:', error);
  }
};

/**
 * Check if user meets engagement criteria
 */
const meetsEngagementCriteria = async (): Promise<boolean> => {
  try {
    const mealsStr = await AsyncStorage.getItem(STORAGE_KEY_TOTAL_MEALS);
    const totalMeals = mealsStr ? parseInt(mealsStr, 10) : 0;

    const daysStr = await AsyncStorage.getItem(STORAGE_KEY_UNIQUE_DAYS);
    const uniqueDays: string[] = daysStr ? JSON.parse(daysStr) : [];

    const meetsRequirements = totalMeals >= MIN_MEALS_REQUIRED && uniqueDays.length >= MIN_DAYS_REQUIRED;
    
    console.log(`[ReviewService] Engagement check: ${totalMeals}/${MIN_MEALS_REQUIRED} meals, ${uniqueDays.length}/${MIN_DAYS_REQUIRED} days = ${meetsRequirements}`);
    
    return meetsRequirements;
  } catch (error) {
    console.error('[ReviewService] Error checking engagement:', error);
    return false;
  }
};

/**
 * Check if we're still in cooldown period
 */
const isInCooldown = async (): Promise<boolean> => {
  try {
    const lastPromptDateStr = await AsyncStorage.getItem(STORAGE_KEY_LAST_REVIEW);
    if (!lastPromptDateStr) return false;

    const lastPromptDate = new Date(lastPromptDateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastPromptDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < COOLDOWN_DAYS) {
      console.log(`[ReviewService] In cooldown. Last prompt: ${diffDays} days ago.`);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Show the pre-review sentiment question
 */
const showSentimentPrompt = (): Promise<'positive' | 'negative' | 'dismissed'> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Quick question! 💬',
      'Are you enjoying NutriSnap?',
      [
        {
          text: 'Not really',
          style: 'cancel',
          onPress: () => resolve('negative'),
        },
        {
          text: 'Yes! 😊',
          onPress: () => resolve('positive'),
        },
      ],
      { cancelable: true, onDismiss: () => resolve('dismissed') }
    );
  });
};

/**
 * Show feedback options for users who aren't enjoying the app
 */
const showFeedbackOptions = (): void => {
  Alert.alert(
    'We\'d love to hear from you',
    'Your feedback helps us improve! How would you like to share?',
    [
      {
        text: 'Maybe later',
        style: 'cancel',
      },
      {
        text: 'Join Community',
        onPress: () => Linking.openURL(TELEGRAM_URL),
      },
      {
        text: 'Send Email',
        onPress: () => Linking.openURL(FEEDBACK_EMAIL),
      },
    ]
  );
};

/**
 * Request the actual App Store review
 */
const requestAppStoreReview = async (): Promise<void> => {
  try {
    const storeReviewModule = await getStoreReview();
    if (!storeReviewModule) {
      console.warn('[ReviewService] StoreReview module not available');
      return;
    }
    
    const isAvailable = await storeReviewModule.hasAction();
    if (isAvailable) {
      console.log('[ReviewService] Showing App Store review prompt');
      await storeReviewModule.requestReview();
    } else {
      console.log('[ReviewService] Store review not available on this device');
    }
  } catch (error) {
    console.error('[ReviewService] Error requesting App Store review:', error);
  }
};

/**
 * Mark that we showed the review prompt
 */
const markReviewPromptShown = async (): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY_LAST_REVIEW, new Date().toISOString());
};

/**
 * Smart review prompt - triggered at win moments
 * Call this after streak celebrations or weekly summaries
 * 
 * @param trigger - What triggered this (e.g., 'streak_milestone', 'weekly_summary')
 */
export const triggerSmartReviewPrompt = async (trigger: string): Promise<void> => {
  try {
    console.log(`[ReviewService] Smart review triggered by: ${trigger}`);

    // Check engagement criteria
    const engagementMet = await meetsEngagementCriteria();
    if (!engagementMet) {
      console.log('[ReviewService] Engagement criteria not met');
      return;
    }

    // Check cooldown
    const inCooldown = await isInCooldown();
    if (inCooldown) {
      return;
    }

    // Small delay to let win moment settle
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Show sentiment prompt
    const sentiment = await showSentimentPrompt();

    if (sentiment === 'positive') {
      // Happy user → show App Store review
      await requestAppStoreReview();
      await markReviewPromptShown();
    } else if (sentiment === 'negative') {
      // Unhappy user → show feedback options
      showFeedbackOptions();
      await markReviewPromptShown();
    }
    // If dismissed, don't mark as shown - try again next time
  } catch (error) {
    console.error('[ReviewService] Error in smart review prompt:', error);
  }
};

/**
 * Legacy function - still tracks meals but doesn't auto-prompt
 * The smart prompt should be triggered at win moments instead
 */
export const checkAndRequestReview = async (actionName: string): Promise<void> => {
  // Just track the meal, don't auto-prompt
  if (actionName === 'meal_logged') {
    await trackMealLogged();
  }
  // Smart prompts are now triggered by triggerSmartReviewPrompt at win moments
};
