// Notification Service
// Handles push notifications for meal reminders and insights

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotificationTip } from './insightsService';
import { Meal } from '../types/meal.types';
import { DailyGoals } from '../store/useMealStore';

// Lazy load expo-notifications to prevent crash if native module not available
let Notifications: typeof import('expo-notifications') | null = null;

const getNotifications = async () => {
  if (!Notifications) {
    try {
      Notifications = await import('expo-notifications');

      // Configure how notifications are handled when app is in foreground
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch (error) {
      console.warn('expo-notifications not available:', error);
      return null;
    }
  }
  return Notifications;
};

// Storage keys
const NOTIFICATION_SETTINGS_KEY = '@forma_notification_settings';
const NOTIFICATION_TOKEN_KEY = '@forma_push_token';

export interface NotificationSettings {
  enabled: boolean;
  mealReminders: boolean;
  morningReminder: boolean;    // 8:30 AM
  lunchReminder: boolean;      // 12:30 PM
  dinnerReminder: boolean;     // 6:30 PM
  insightNotifications: boolean;
  weeklyProgress: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  mealReminders: true,
  morningReminder: true,
  lunchReminder: true,
  dinnerReminder: true,
  insightNotifications: true,
  weeklyProgress: true,
};

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const notifs = await getNotifications();
    if (!notifs) {
      console.warn('Notifications not available - native module not linked');
      return false;
    }

    const { status: existingStatus } = await notifs.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await notifs.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // Get push token (for future remote notifications)
    if (Platform.OS !== 'web') {
      try {
        const token = (await notifs.getExpoPushTokenAsync()).data;
        await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token);
        console.log('Push token:', token);
      } catch (tokenError) {
        console.warn('Could not get push token:', tokenError);
      }
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Get notification settings
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// Save notification settings
export const saveNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));

    // Reschedule notifications based on new settings
    await scheduleAllNotifications(settings);
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
};

// Cancel all scheduled notifications
export const cancelAllNotifications = async (): Promise<void> => {
  const notifs = await getNotifications();
  if (!notifs) return;

  await notifs.cancelAllScheduledNotificationsAsync();
  console.log('All notifications cancelled');
};

// Schedule a local notification
export const scheduleNotification = async (
  title: string,
  body: string,
  trigger: any,
  identifier?: string
): Promise<string | null> => {
  try {
    const notifs = await getNotifications();
    if (!notifs) return null;

    const id = await notifs.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: notifs.AndroidNotificationPriority.HIGH,
      },
      trigger,
      identifier,
    });
    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

// Schedule meal reminder notifications
export const scheduleMealReminders = async (settings: NotificationSettings): Promise<void> => {
  if (!settings.mealReminders) return;

  const notifs = await getNotifications();
  if (!notifs) return;

  // Cancel existing meal reminders
  const scheduled = await notifs.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.identifier?.startsWith('meal-reminder-')) {
      await notifs.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  // Morning reminder (8:30 AM)
  if (settings.morningReminder) {
    await scheduleNotification(
      "Good morning! 🌅",
      "Start your day right with a healthy breakfast. Don't forget to log it!",
      {
        type: 'daily',
        hour: 8,
        minute: 30,
      },
      'meal-reminder-morning'
    );
  }

  // Lunch reminder (12:30 PM)
  if (settings.lunchReminder) {
    await scheduleNotification(
      "Lunchtime! 🍽️",
      "Time for a nutritious lunch. Remember to log your meal!",
      {
        type: 'daily',
        hour: 12,
        minute: 30,
      },
      'meal-reminder-lunch'
    );
  }

  // Dinner reminder (6:30 PM)
  if (settings.dinnerReminder) {
    await scheduleNotification(
      "Dinner time! 🥗",
      "Wrap up your day with a balanced dinner. Log it to track your progress!",
      {
        type: 'daily',
        hour: 18,
        minute: 30,
      },
      'meal-reminder-dinner'
    );
  }

  console.log('Meal reminders scheduled');
};

// Schedule insight notifications based on current nutrition data
export const scheduleInsightNotification = async (
  todayMeals: Meal[],
  goals: DailyGoals
): Promise<void> => {
  const settings = await getNotificationSettings();
  if (!settings.insightNotifications) return;

  const tip = getNotificationTip(todayMeals, goals);
  if (tip) {
    // Schedule for 30 seconds from now (for testing)
    await scheduleNotification(
      tip.title,
      tip.body,
      {
        type: 'timeInterval',
        seconds: 30,
        repeats: false,
      },
      'insight-tip'
    );
  }
};

// Schedule weekly progress notification (Sunday evening)
export const scheduleWeeklyProgress = async (settings: NotificationSettings): Promise<void> => {
  if (!settings.weeklyProgress) return;

  const notifs = await getNotifications();
  if (!notifs) return;

  // Cancel existing weekly progress notification
  const scheduled = await notifs.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.identifier === 'weekly-progress') {
      await notifs.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  await scheduleNotification(
    "Weekly Progress Report 📊",
    "Check out your nutrition summary for this week!",
    {
      type: 'weekly',
      weekday: 1, // Sunday
      hour: 19,
      minute: 0,
    },
    'weekly-progress'
  );

  console.log('Weekly progress notification scheduled');
};

// Schedule all notifications based on settings
export const scheduleAllNotifications = async (settings: NotificationSettings): Promise<void> => {
  // First cancel all existing notifications
  await cancelAllNotifications();

  if (!settings.enabled) {
    console.log('Notifications disabled, skipping scheduling');
    return;
  }

  // Request permissions if not already granted
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('No notification permission, skipping scheduling');
    return;
  }

  // Schedule meal reminders
  await scheduleMealReminders(settings);

  // Schedule weekly progress
  await scheduleWeeklyProgress(settings);

  console.log('All notifications scheduled');
};

// Initialize notifications (call on app start)
export const initializeNotifications = async (): Promise<void> => {
  try {
    const settings = await getNotificationSettings();

    if (settings.enabled) {
      await scheduleAllNotifications(settings);
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
};

// Send an immediate notification (for testing)
export const sendImmediateNotification = async (
  title: string,
  body: string
): Promise<void> => {
  const notifs = await getNotifications();
  if (!notifs) return;

  await notifs.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null, // Immediate
  });
};

// Get all scheduled notifications (for debugging)
export const getScheduledNotifications = async () => {
  const notifs = await getNotifications();
  if (!notifs) return [];

  return await notifs.getAllScheduledNotificationsAsync();
};

// Add notification response listener
export const addNotificationResponseListener = (
  callback: (response: any) => void
) => {
  getNotifications().then(notifs => {
    if (notifs) {
      notifs.addNotificationResponseReceivedListener(callback);
    }
  });
};

// Add notification received listener (foreground)
export const addNotificationReceivedListener = (
  callback: (notification: any) => void
) => {
  getNotifications().then(notifs => {
    if (notifs) {
      notifs.addNotificationReceivedListener(callback);
    }
  });
};

