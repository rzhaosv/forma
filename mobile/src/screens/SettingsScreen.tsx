import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import {
  isHealthKitAvailable,
  requestHealthKitPermissions
} from '../services/healthKitService';
import {
  isGoogleFitAvailable,
  requestGoogleFitPermissions,
  disconnectGoogleFit,
} from '../services/googleFitService';
import {
  isHealthKitEnabled,
  setHealthKitEnabled,
  isWeightSyncEnabled,
  setWeightSyncEnabled,
  isMealSyncEnabled,
  setMealSyncEnabled,
  isExerciseSyncEnabled,
  setExerciseSyncEnabled,
  isGoogleFitEnabled,
  setGoogleFitEnabled,
  isGoogleFitWeightSyncEnabled,
  setGoogleFitWeightSyncEnabled,
  isGoogleFitMealSyncEnabled,
  setGoogleFitMealSyncEnabled,
  isGoogleFitExerciseSyncEnabled,
  setGoogleFitExerciseSyncEnabled,
  getFitnessPlatformName,
} from '../utils/healthKitSettings';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import PaywallModal from '../components/PaywallModal';
import { generateDemoData, clearDemoData } from '../utils/demoData';
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermissions,
  NotificationSettings,
} from '../services/notificationService';
import { deleteAccount, signOut } from '../services/authService';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colors, isDark, toggleMode, mode } = useTheme();
  const { isPremium, subscriptionStatus } = useSubscriptionStore();

  // iOS - HealthKit
  const [healthKitAvailable, setHealthKitAvailable] = useState(false);
  const [healthKitEnabledState, setHealthKitEnabledState] = useState(false);
  const [weightSyncEnabledState, setWeightSyncEnabledState] = useState(true);
  const [mealSyncEnabledState, setMealSyncEnabledState] = useState(true);
  const [exerciseSyncEnabledState, setExerciseSyncEnabledState] = useState(true);

  // Android - Google Fit
  const [googleFitAvailable, setGoogleFitAvailable] = useState(false);
  const [googleFitEnabledState, setGoogleFitEnabledState] = useState(false);
  const [googleFitWeightSyncState, setGoogleFitWeightSyncState] = useState(true);
  const [googleFitMealSyncState, setGoogleFitMealSyncState] = useState(true);
  const [googleFitExerciseSyncState, setGoogleFitExerciseSyncState] = useState(true);

  const [showPaywall, setShowPaywall] = useState(false);
  const [generatingDemo, setGeneratingDemo] = useState(false);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: true,
    mealReminders: true,
    morningReminder: true,
    lunchReminder: true,
    dinnerReminder: true,
    insightNotifications: true,
    weeklyProgress: true,
  });

  // Load notification settings on mount
  useEffect(() => {
    const loadNotificationSettings = async () => {
      const settings = await getNotificationSettings();
      setNotificationSettings(settings);
    };
    loadNotificationSettings();
  }, []);

  const handleNotificationToggle = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };

    // If enabling notifications, request permissions
    if (key === 'enabled' && value) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to receive reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    // If disabling meal reminders, disable all individual reminders
    if (key === 'mealReminders' && !value) {
      newSettings.morningReminder = false;
      newSettings.lunchReminder = false;
      newSettings.dinnerReminder = false;
    }

    // If enabling individual reminder, enable meal reminders
    if ((key === 'morningReminder' || key === 'lunchReminder' || key === 'dinnerReminder') && value) {
      newSettings.mealReminders = true;
    }

    setNotificationSettings(newSettings);
    await saveNotificationSettings(newSettings);
  };

  useEffect(() => {
    const checkFitnessIntegrations = async () => {
      // iOS - HealthKit
      if (Platform.OS === 'ios') {
        const available = await isHealthKitAvailable();
        setHealthKitAvailable(available);

        if (available) {
          const enabled = await isHealthKitEnabled();
          const weightSync = await isWeightSyncEnabled();
          const mealSync = await isMealSyncEnabled();
          const exerciseSync = await isExerciseSyncEnabled();

          // If user had HealthKit enabled, keep it enabled regardless of premium status
          // Fixing Guideline 4.10 - HealthKit cannot be behind a paywall
          setHealthKitEnabledState(enabled);

          setWeightSyncEnabledState(weightSync);
          setMealSyncEnabledState(mealSync);
          setExerciseSyncEnabledState(exerciseSync);
        }
      }

      // Android - Google Fit
      if (Platform.OS === 'android') {
        const available = await isGoogleFitAvailable();
        setGoogleFitAvailable(available);

        if (available) {
          const enabled = await isGoogleFitEnabled();
          const weightSync = await isGoogleFitWeightSyncEnabled();
          const mealSync = await isGoogleFitMealSyncEnabled();
          const exerciseSync = await isGoogleFitExerciseSyncEnabled();

          // If user had Google Fit enabled but is no longer premium, disable it
          if (enabled && !isPremium) {
            await setGoogleFitEnabled(false);
            await disconnectGoogleFit();
            setGoogleFitEnabledState(false);
          } else {
            setGoogleFitEnabledState(enabled);
          }

          setGoogleFitWeightSyncState(weightSync);
          setGoogleFitMealSyncState(mealSync);
          setGoogleFitExerciseSyncState(exerciseSync);
        }
      }
    };

    checkFitnessIntegrations();
  }, [isPremium]);

  const handleHealthKitToggle = async (value: boolean) => {
    // Guideline 4.10 Fix: HealthKit is no longer gated behind premium
    // if (value && !isPremium) {
    //   setShowPaywall(true);
    //   return;
    // }

    if (value) {
      try {
        console.log('🏥 Requesting HealthKit permissions...');
        await requestHealthKitPermissions();
        console.log('✅ HealthKit permissions granted');
        await setHealthKitEnabled(true);
        setHealthKitEnabledState(true);
        Alert.alert(
          'HealthKit Enabled',
          'Your weight and nutrition data will now sync with Apple Health.'
        );
      } catch (error: any) {
        console.error('❌ Failed to enable HealthKit:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));

        // More helpful error message
        let errorMessage = 'Failed to enable HealthKit.';

        if (error.message?.includes('not available')) {
          errorMessage = 'HealthKit is not available on this device. This feature requires a physical iPhone with iOS 8.0 or later.';
        } else if (error.message?.includes('authorization') || error.message?.includes('permission')) {
          errorMessage = 'HealthKit permission was denied. Please go to Settings > Health > Forma and enable access.';
        } else if (error.message?.includes('entitlement')) {
          errorMessage = 'HealthKit is not configured correctly. This may be a development build issue.';
        } else {
          errorMessage = `Failed to enable HealthKit: ${error.message || 'Unknown error'}. Please check your permissions in Settings > Health > Forma.`;
        }

        Alert.alert('HealthKit Error', errorMessage, [
          { text: 'OK' },
          {
            text: 'Open Settings',
            onPress: () => {
              // Open Health app settings
              const { Linking } = require('react-native');
              Linking.openURL('x-apple-health://');
            }
          },
        ]);
      }
    } else {
      await setHealthKitEnabled(false);
      setHealthKitEnabledState(false);
      Alert.alert(
        'HealthKit Disabled',
        'Your data will no longer sync with Apple Health.'
      );
    }
  };

  const handleWeightSyncToggle = async (value: boolean) => {
    await setWeightSyncEnabled(value);
    setWeightSyncEnabledState(value);
  };

  const handleMealSyncToggle = async (value: boolean) => {
    await setMealSyncEnabled(value);
    setMealSyncEnabledState(value);
  };

  const handleExerciseSyncToggle = async (value: boolean) => {
    await setExerciseSyncEnabled(value);
    setExerciseSyncEnabledState(value);
  };

  // Google Fit handlers (Android)
  const handleGoogleFitToggle = async (value: boolean) => {
    // Check if user has premium access for fitness integrations
    if (value && !isPremium) {
      setShowPaywall(true);
      return;
    }

    if (value) {
      try {
        console.log('🏃 Requesting Google Fit permissions...');
        await requestGoogleFitPermissions();
        console.log('✅ Google Fit permissions granted');
        await setGoogleFitEnabled(true);
        setGoogleFitEnabledState(true);
        Alert.alert(
          'Google Fit Enabled',
          'Your weight and nutrition data will now sync with Google Fit.'
        );
      } catch (error: any) {
        console.error('❌ Failed to enable Google Fit:', error);

        let errorMessage = 'Failed to enable Google Fit.';
        if (error.message) {
          errorMessage = `Failed to enable Google Fit: ${error.message}`;
        }

        Alert.alert('Google Fit Error', errorMessage);
      }
    } else {
      await setGoogleFitEnabled(false);
      await disconnectGoogleFit();
      setGoogleFitEnabledState(false);
      Alert.alert(
        'Google Fit Disabled',
        'Your data will no longer sync with Google Fit.'
      );
    }
  };

  const handleGoogleFitWeightSyncToggle = async (value: boolean) => {
    await setGoogleFitWeightSyncEnabled(value);
    setGoogleFitWeightSyncState(value);
  };

  const handleGoogleFitMealSyncToggle = async (value: boolean) => {
    await setGoogleFitMealSyncEnabled(value);
    setGoogleFitMealSyncState(value);
  };

  const handleGoogleFitExerciseSyncToggle = async (value: boolean) => {
    await setGoogleFitExerciseSyncEnabled(value);
    setGoogleFitExerciseSyncState(value);
  };

  // Demo data handlers (development only)
  const handleGenerateDemoData = async () => {
    setGeneratingDemo(true);
    try {
      await generateDemoData();
      Alert.alert('Demo Data Generated', 'Sample meals, workouts, and progress data have been added.');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate demo data.');
    } finally {
      setGeneratingDemo(false);
    }
  };

  const handleClearDemoData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your meals, workouts, progress, and recipes. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearDemoData();
            Alert.alert('Data Cleared', 'All data has been removed.');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              // Navigation to login will handle automatically via auth state listener in App.tsx
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error(error);
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 16,
    },
    backText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    section: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      flex: 1,
    },
    settingDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    settingContent: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          style={dynamicStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={dynamicStyles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Subscription Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Subscription</Text>

          <TouchableOpacity
            style={dynamicStyles.settingRow}
            onPress={() => navigation.navigate('Subscription' as never)}
          >
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Manage Subscription</Text>
              <Text style={dynamicStyles.settingDescription}>
                View and manage your premium subscription
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: colors.textSecondary }}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Data Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Data</Text>

          <TouchableOpacity
            style={dynamicStyles.settingRow}
            onPress={() => navigation.navigate('ExportData' as never)}
          >
            <View style={dynamicStyles.settingContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={dynamicStyles.settingLabel}>Export Data</Text>
                {!isPremium && (
                  <View style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 8,
                    marginLeft: 8,
                  }}>
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>PREMIUM</Text>
                  </View>
                )}
              </View>
              <Text style={dynamicStyles.settingDescription}>
                Download your meals, progress, and recipes
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: colors.textSecondary }}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Goals Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Goals</Text>

          <TouchableOpacity
            style={dynamicStyles.settingRow}
            onPress={() => navigation.navigate('Goals' as never)}
          >
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Daily Goals</Text>
              <Text style={dynamicStyles.settingDescription}>
                Set your calorie and protein targets
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: colors.textSecondary }}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Apple Health Section (iOS only) */}
        {Platform.OS === 'ios' && (
          <View style={dynamicStyles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={dynamicStyles.sectionTitle}>Fitness Integrations</Text>
            </View>

            {!healthKitAvailable ? (
              <View style={[dynamicStyles.settingRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={[dynamicStyles.settingLabel, { color: colors.textSecondary }]}>
                    Apple Health (Unavailable)
                  </Text>
                  <Ionicons name="information-circle-outline" size={18} color={colors.textTertiary} style={{ marginLeft: 6 }} />
                </View>
                <Text style={dynamicStyles.settingDescription}>
                  HealthKit could not be detected. This feature requires a physical iPhone and a native build. If you are using Expo Go, please switch to your Development Build.
                </Text>
                <TouchableOpacity
                  style={{ marginTop: 12, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.surfaceSecondary }}
                  onPress={async () => {
                    const available = await isHealthKitAvailable();
                    setHealthKitAvailable(available);
                    if (available) {
                      Alert.alert('Success', 'HealthKit is now available!');
                    } else {
                      Alert.alert('Still Unavailable', 'Ensure you are running on a physical device with a native build.');
                    }
                  }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>Check Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={dynamicStyles.settingRow}>
                  <View style={dynamicStyles.settingContent}>
                    <Text style={dynamicStyles.settingLabel}>
                      Apple Health Sync
                    </Text>
                    <Text style={dynamicStyles.settingDescription}>
                      Sync weight and nutrition data with Apple Health
                    </Text>
                  </View>
                  <Switch
                    value={healthKitEnabledState}
                    onValueChange={handleHealthKitToggle}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={healthKitEnabledState ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>

                {healthKitEnabledState && (
                  <>
                    <View style={dynamicStyles.settingRow}>
                      <View style={dynamicStyles.settingContent}>
                        <Text style={dynamicStyles.settingLabel}>Weight Sync</Text>
                        <Text style={dynamicStyles.settingDescription}>
                          Automatically sync weight entries to Apple Health
                        </Text>
                      </View>
                      <Switch
                        value={weightSyncEnabledState}
                        onValueChange={handleWeightSyncToggle}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={weightSyncEnabledState ? '#FFFFFF' : '#FFFFFF'}
                      />
                    </View>

                    <View style={dynamicStyles.settingRow}>
                      <View style={dynamicStyles.settingContent}>
                        <Text style={dynamicStyles.settingLabel}>Meal Sync</Text>
                        <Text style={dynamicStyles.settingDescription}>
                          Automatically sync calories and macros to Apple Health
                        </Text>
                      </View>
                      <Switch
                        value={mealSyncEnabledState}
                        onValueChange={handleMealSyncToggle}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={mealSyncEnabledState ? '#FFFFFF' : '#FFFFFF'}
                      />
                    </View>

                    <View style={dynamicStyles.settingRow}>
                      <View style={dynamicStyles.settingContent}>
                        <Text style={dynamicStyles.settingLabel}>Exercise Sync</Text>
                        <Text style={dynamicStyles.settingDescription}>
                          Automatically sync workout calories burned to Apple Health
                        </Text>
                      </View>
                      <Switch
                        value={exerciseSyncEnabledState}
                        onValueChange={handleExerciseSyncToggle}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={exerciseSyncEnabledState ? '#FFFFFF' : '#FFFFFF'}
                      />
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        )}

        {/* Google Fit Section (Android only) */}
        {Platform.OS === 'android' && (
          <View style={dynamicStyles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={dynamicStyles.sectionTitle}>Fitness Integrations</Text>
              {!isPremium && googleFitAvailable && (
                <View style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 10,
                  marginLeft: 8,
                }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>PREMIUM</Text>
                </View>
              )}
            </View>

            {!googleFitAvailable ? (
              <View style={[dynamicStyles.settingRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={[dynamicStyles.settingLabel, { color: colors.textSecondary }]}>
                    Google Fit (Unavailable)
                  </Text>
                  <Ionicons name="information-circle-outline" size={18} color={colors.textTertiary} style={{ marginLeft: 6 }} />
                </View>
                <Text style={dynamicStyles.settingDescription}>
                  Google Fit could not be detected. This feature requires a physical Android device and a native build.
                </Text>
              </View>
            ) : (
              <>
                <View style={[
                  dynamicStyles.settingRow,
                  !isPremium && { opacity: 0.7 }
                ]}>
                  <View style={dynamicStyles.settingContent}>
                    <Text style={dynamicStyles.settingLabel}>
                      Google Fit Sync {!isPremium && '🔒'}
                    </Text>
                    <Text style={dynamicStyles.settingDescription}>
                      {isPremium
                        ? 'Sync weight and nutrition data with Google Fit'
                        : 'Upgrade to Premium to sync with Google Fit'}
                    </Text>
                  </View>
                  <Switch
                    value={googleFitEnabledState}
                    onValueChange={handleGoogleFitToggle}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={googleFitEnabledState ? '#FFFFFF' : '#FFFFFF'}
                    disabled={!isPremium && !googleFitEnabledState}
                  />
                </View>

                {googleFitEnabledState && (
                  <>
                    <View style={dynamicStyles.settingRow}>
                      <View style={dynamicStyles.settingContent}>
                        <Text style={dynamicStyles.settingLabel}>Weight Sync</Text>
                        <Text style={dynamicStyles.settingDescription}>
                          Automatically sync weight entries to Google Fit
                        </Text>
                      </View>
                      <Switch
                        value={googleFitWeightSyncState}
                        onValueChange={handleGoogleFitWeightSyncToggle}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={googleFitWeightSyncState ? '#FFFFFF' : '#FFFFFF'}
                      />
                    </View>

                    <View style={dynamicStyles.settingRow}>
                      <View style={dynamicStyles.settingContent}>
                        <Text style={dynamicStyles.settingLabel}>Meal Sync</Text>
                        <Text style={dynamicStyles.settingDescription}>
                          Automatically sync calories and macros to Google Fit
                        </Text>
                      </View>
                      <Switch
                        value={googleFitMealSyncState}
                        onValueChange={handleGoogleFitMealSyncToggle}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={googleFitMealSyncState ? '#FFFFFF' : '#FFFFFF'}
                      />
                    </View>

                    <View style={dynamicStyles.settingRow}>
                      <View style={dynamicStyles.settingContent}>
                        <Text style={dynamicStyles.settingLabel}>Exercise Sync</Text>
                        <Text style={dynamicStyles.settingDescription}>
                          Automatically sync workout calories burned to Google Fit
                        </Text>
                      </View>
                      <Switch
                        value={googleFitExerciseSyncState}
                        onValueChange={handleGoogleFitExerciseSyncToggle}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={googleFitExerciseSyncState ? '#FFFFFF' : '#FFFFFF'}
                      />
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        )}

        {/* Appearance Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Appearance</Text>

          <View style={dynamicStyles.settingRow}>
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Dark Mode</Text>
              <Text style={dynamicStyles.settingDescription}>
                Switch to dark theme for better viewing in low light
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleMode}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Theme Mode Info */}
        <View style={dynamicStyles.section}>
          <View style={[dynamicStyles.settingRow, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Current Theme</Text>
              <Text style={dynamicStyles.settingDescription}>
                {mode === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </Text>
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Notifications & Reminders</Text>

          <View style={dynamicStyles.settingRow}>
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Enable Notifications</Text>
              <Text style={dynamicStyles.settingDescription}>
                Receive reminders and insights
              </Text>
            </View>
            <Switch
              value={notificationSettings.enabled}
              onValueChange={(value) => handleNotificationToggle('enabled', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {notificationSettings.enabled && (
            <>
              <View style={dynamicStyles.settingRow}>
                <View style={dynamicStyles.settingContent}>
                  <Text style={dynamicStyles.settingLabel}>AI Insights</Text>
                  <Text style={dynamicStyles.settingDescription}>
                    Personalized nutrition tips and suggestions
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.insightNotifications}
                  onValueChange={(value) => handleNotificationToggle('insightNotifications', value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={dynamicStyles.settingRow}>
                <View style={dynamicStyles.settingContent}>
                  <Text style={dynamicStyles.settingLabel}>Meal Reminders</Text>
                  <Text style={dynamicStyles.settingDescription}>
                    Get reminded to log your meals
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.mealReminders}
                  onValueChange={(value) => handleNotificationToggle('mealReminders', value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {notificationSettings.mealReminders && (
                <View style={{ paddingLeft: 16 }}>
                  <View style={dynamicStyles.settingRow}>
                    <View style={dynamicStyles.settingContent}>
                      <Text style={[dynamicStyles.settingLabel, { fontSize: 14 }]}>🌅 Morning (8:30 AM)</Text>
                    </View>
                    <Switch
                      value={notificationSettings.morningReminder}
                      onValueChange={(value) => handleNotificationToggle('morningReminder', value)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  <View style={dynamicStyles.settingRow}>
                    <View style={dynamicStyles.settingContent}>
                      <Text style={[dynamicStyles.settingLabel, { fontSize: 14 }]}>☀️ Lunch (12:30 PM)</Text>
                    </View>
                    <Switch
                      value={notificationSettings.lunchReminder}
                      onValueChange={(value) => handleNotificationToggle('lunchReminder', value)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  <View style={dynamicStyles.settingRow}>
                    <View style={dynamicStyles.settingContent}>
                      <Text style={[dynamicStyles.settingLabel, { fontSize: 14 }]}>🌙 Dinner (6:30 PM)</Text>
                    </View>
                    <Switch
                      value={notificationSettings.dinnerReminder}
                      onValueChange={(value) => handleNotificationToggle('dinnerReminder', value)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>
              )}

              <View style={dynamicStyles.settingRow}>
                <View style={dynamicStyles.settingContent}>
                  <Text style={dynamicStyles.settingLabel}>Weekly Progress</Text>
                  <Text style={dynamicStyles.settingDescription}>
                    Sunday summary of your nutrition week
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.weeklyProgress}
                  onValueChange={(value) => handleNotificationToggle('weeklyProgress', value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </>
          )}
        </View>

        {/* Legal & Support */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Legal & Support</Text>

          <TouchableOpacity
            style={dynamicStyles.settingRow}
            onPress={() => navigation.navigate('PrivacyPolicy' as never)}
          >
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.settingRow}
            onPress={() => navigation.navigate('TermsOfUse' as never)}
          >
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Terms of Use</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.settingRow}
            onPress={() => Linking.openURL('mailto:support@example.com')}
          >
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Contact Support</Text>
            </View>
            <Ionicons name="mail-outline" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={dynamicStyles.settingRow}
            onPress={handleSignOut}
          >
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Sign Out</Text>
            </View>
            <Text style={{ fontSize: 16, color: colors.textSecondary }}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.settingRow}
            onPress={handleDeleteAccount}
          >
            <View style={dynamicStyles.settingContent}>
              <Text style={[dynamicStyles.settingLabel, { color: colors.error }]}>Delete Account</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />

        {/* Developer Tools (Dev builds only) */}
        {__DEV__ && (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Developer Tools</Text>

            <TouchableOpacity
              style={dynamicStyles.settingRow}
              onPress={handleGenerateDemoData}
              disabled={generatingDemo}
            >
              <View style={dynamicStyles.settingContent}>
                <Text style={dynamicStyles.settingLabel}>
                  {generatingDemo ? '⏳ Generating...' : '🎬 Generate Demo Data'}
                </Text>
                <Text style={dynamicStyles.settingDescription}>
                  Create sample meals, workouts, and progress for demo videos
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={dynamicStyles.settingRow}
              onPress={handleClearDemoData}
            >
              <View style={dynamicStyles.settingContent}>
                <Text style={[dynamicStyles.settingLabel, { color: '#EF4444' }]}>
                  🗑️ Clear All Data
                </Text>
                <Text style={dynamicStyles.settingDescription}>
                  Remove all meals, workouts, progress, and recipes
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Premium Paywall Modal for Fitness Integrations */}
      <PaywallModal
        isVisible={showPaywall}
        onClose={() => setShowPaywall(false)}
        title="Premium Features"
        message="Switch to premium to unlock all features and sync across devices."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});

