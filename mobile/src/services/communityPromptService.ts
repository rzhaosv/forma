// Community Prompt Service
// Shows a prompt to join the Telegram community after the second food log

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking } from 'react-native';

const COMMUNITY_PROMPT_KEY = '@nutrisnap_community_prompt_shown';
const TELEGRAM_URL = 'https://t.me/+tyaqT57kKmQ3MGUx';

export const hasShownCommunityPrompt = async (): Promise<boolean> => {
  try {
    const shown = await AsyncStorage.getItem(COMMUNITY_PROMPT_KEY);
    return shown === 'true';
  } catch (error) {
    return false;
  }
};

export const markCommunityPromptShown = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(COMMUNITY_PROMPT_KEY, 'true');
  } catch (error) {
    console.error('Error marking community prompt as shown:', error);
  }
};

// Reset for testing - call this from dev tools if needed
export const resetCommunityPrompt = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(COMMUNITY_PROMPT_KEY);
    console.log('Community prompt reset');
  } catch (error) {
    console.error('Error resetting community prompt:', error);
  }
};

export const checkAndShowCommunityPrompt = async (totalMealCount: number): Promise<void> => {
  try {
    const alreadyShown = await hasShownCommunityPrompt();

    console.log(`Community prompt check: meals=${totalMealCount}, alreadyShown=${alreadyShown}`);

    // Show prompt after the 2nd food log, but only once
    if (totalMealCount >= 2 && !alreadyShown) {
      // Small delay to let the meal logging UI settle
      setTimeout(() => {
        Alert.alert(
          '🎉 Great progress!',
          'You\'re on a roll! Want to join our community to share progress and support each other?',
          [
            {
              text: 'Maybe Later',
              style: 'cancel',
              onPress: () => markCommunityPromptShown(),
            },
            {
              text: 'Join Community',
              onPress: () => {
                markCommunityPromptShown();
                Linking.openURL(TELEGRAM_URL);
              },
            },
          ]
        );
      }, 800);
    }
  } catch (error) {
    console.error('Error checking community prompt:', error);
  }
};
