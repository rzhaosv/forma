import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_LAST_REVIEW = '@forma_last_review_prompt_date';
const STORAGE_KEY_ACTION_COUNT = '@forma_review_action_count';

// Configuration
const COOLDOWN_DAYS = 14; // Don't prompt more than once every 2 weeks
const MIN_ACTIONS_REQUIRED = 3; // Example: user must have logged at least 3 meals (or hit this trigger 3 times) before first prompt

/**
 * Checks criteria and potentially requests a store review.
 * @param actionName - A label for what triggered this check (e.g., 'meal_logged', 'streak_milestone')
 */
export const checkAndRequestReview = async (actionName: string) => {
    try {
        // 1. Check if StoreReview is available
        const isAvailable = await StoreReview.hasAction();
        if (!isAvailable) {
            console.log('[ReviewService] StoreReview not available on this device');
            return;
        }

        // 2. Check Cooldown
        const lastPromptDateStr = await AsyncStorage.getItem(STORAGE_KEY_LAST_REVIEW);
        if (lastPromptDateStr) {
            const lastPromptDate = new Date(lastPromptDateStr);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - lastPromptDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < COOLDOWN_DAYS) {
                console.log(`[ReviewService] In cooldown. Last prompt: ${diffDays} days ago.`);
                return;
            }
        }

        // 3. Check Action Count (Engagement)
        // We increment a counter every time this function is called (e.g. every meal log)
        // and only prompt if they've done it enough times.
        const currentCountStr = await AsyncStorage.getItem(STORAGE_KEY_ACTION_COUNT);
        let currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;
        currentCount++;
        await AsyncStorage.setItem(STORAGE_KEY_ACTION_COUNT, currentCount.toString());

        if (currentCount < MIN_ACTIONS_REQUIRED) {
            console.log(`[ReviewService] Not enough actions yet: ${currentCount}/${MIN_ACTIONS_REQUIRED}`);
            return;
        }

        // 4. Request Review
        console.log(`[ReviewService] Requesting review for action: ${actionName}`);
        await StoreReview.requestReview();

        // 5. Update Last Prompt Date and Reset Action Count (optional, depending on strategy)
        await AsyncStorage.setItem(STORAGE_KEY_LAST_REVIEW, new Date().toISOString());
        // We typically reset the count or increase the threshold for the next time
        // For simplicity, let's reset the count so they have to work for it again
        await AsyncStorage.setItem(STORAGE_KEY_ACTION_COUNT, '0');

    } catch (error) {
        console.error('[ReviewService] Error requesting review:', error);
    }
};
