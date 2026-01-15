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
} from '../utils/healthKitSettings';
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

          setGoogleFitEnabledState(enabled);
          setGoogleFitWeightSyncState(weightSync);
          setGoogleFitMealSyncState(mealSync);
          setGoogleFitExerciseSyncState(exerciseSync);
        }
      }
    };

    checkFitnessIntegrations();
  }, []);

  const handleHealthKitToggle = async (value: boolean) => {
    if (value) {
      try {
        await requestHealthKitPermissions();
        await setHealthKitEnabled(true);
        setHealthKitEnabledState(true);
        Alert.alert(
          'Apple Health Enabled',
          'Your weight and nutrition data will now sync with Apple Health.'
        );
      } catch (error: any) {
        console.error('❌ Failed to enable HealthKit:', error);

        let errorMessage = 'Failed to enable Apple Health.';
        if (error.message?.includes('not available')) {
          errorMessage = 'Apple Health is not available on this device.';
        } else if (error.message?.includes('authorization')) {
          errorMessage = 'HealthKit permission was denied.';
        }

        Alert.alert('Apple Health Error', errorMessage);
      }
    } else {
      await setHealthKitEnabled(false);
      setHealthKitEnabledState(false);
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

  const handleGoogleFitToggle = async (value: boolean) => {
    if (value) {
      try {
        await requestGoogleFitPermissions();
        await setGoogleFitEnabled(true);
        setGoogleFitEnabledState(true);
        Alert.alert(
          'Google Fit Enabled',
          'Your weight and nutrition data will now sync with Google Fit.'
        );
      } catch (error: any) {
        console.error('❌ Failed to enable Google Fit:', error);
        Alert.alert('Google Fit Error', 'Failed to enable Google Fit.');
      }
    } else {
      await setGoogleFitEnabled(false);
      await disconnectGoogleFit();
      setGoogleFitEnabledState(false);
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

  const handleGenerateDemoData = async () => {
    setGeneratingDemo(true);
    try {
      await generateDemoData();
      Alert.alert('Demo Data Generated', 'Sample data has been added.');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate demo data.');
    } finally {
      setGeneratingDemo(false);
    }
  };

  const handleClearDemoData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete everything. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearDemoData();
            Alert.alert('Data Cleared', 'All data removed.');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
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
        {/* Data Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Data</Text>

          <TouchableOpacity
            style={dynamicStyles.settingRow}
            onPress={() => navigation.navigate('ExportData' as never)}
          >
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Export Data</Text>
              <Text style={dynamicStyles.settingDescription}>
                Download your meals, progress, and recipes
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
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
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Fitness Integrations */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Fitness Integrations</Text>

          {Platform.OS === 'ios' && healthKitAvailable && (
            <>
              <View style={dynamicStyles.settingRow}>
                <View style={dynamicStyles.settingContent}>
                  <Text style={dynamicStyles.settingLabel}>Apple Health Sync</Text>
                  <Text style={dynamicStyles.settingDescription}>Sync your health data</Text>
                </View>
                <Switch
                  value={healthKitEnabledState}
                  onValueChange={handleHealthKitToggle}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {healthKitEnabledState && (
                <View style={{ paddingLeft: 16 }}>
                  <View style={dynamicStyles.settingRow}>
                    <Text style={dynamicStyles.settingLabel}>Weight Sync</Text>
                    <Switch value={weightSyncEnabledState} onValueChange={handleWeightSyncToggle} thumbColor="#FFFFFF" trackColor={{ false: colors.border, true: colors.primary }} />
                  </View>
                  <View style={dynamicStyles.settingRow}>
                    <Text style={dynamicStyles.settingLabel}>Meal Sync</Text>
                    <Switch value={mealSyncEnabledState} onValueChange={handleMealSyncToggle} thumbColor="#FFFFFF" trackColor={{ false: colors.border, true: colors.primary }} />
                  </View>
                  <View style={dynamicStyles.settingRow}>
                    <Text style={dynamicStyles.settingLabel}>Exercise Sync</Text>
                    <Switch value={exerciseSyncEnabledState} onValueChange={handleExerciseSyncToggle} thumbColor="#FFFFFF" trackColor={{ false: colors.border, true: colors.primary }} />
                  </View>
                </View>
              )}
            </>
          )}

          {Platform.OS === 'android' && googleFitAvailable && (
            <>
              <View style={dynamicStyles.settingRow}>
                <View style={dynamicStyles.settingContent}>
                  <Text style={dynamicStyles.settingLabel}>Google Fit Sync</Text>
                  <Text style={dynamicStyles.settingDescription}>Sync your fitness data</Text>
                </View>
                <Switch
                  value={googleFitEnabledState}
                  onValueChange={handleGoogleFitToggle}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {googleFitEnabledState && (
                <View style={{ paddingLeft: 16 }}>
                  <View style={dynamicStyles.settingRow}>
                    <Text style={dynamicStyles.settingLabel}>Weight Sync</Text>
                    <Switch value={googleFitWeightSyncState} onValueChange={handleGoogleFitWeightSyncToggle} thumbColor="#FFFFFF" trackColor={{ false: colors.border, true: colors.primary }} />
                  </View>
                  <View style={dynamicStyles.settingRow}>
                    <Text style={dynamicStyles.settingLabel}>Meal Sync</Text>
                    <Switch value={googleFitMealSyncState} onValueChange={handleGoogleFitMealSyncToggle} thumbColor="#FFFFFF" trackColor={{ false: colors.border, true: colors.primary }} />
                  </View>
                  <View style={dynamicStyles.settingRow}>
                    <Text style={dynamicStyles.settingLabel}>Exercise Sync</Text>
                    <Switch value={googleFitExerciseSyncState} onValueChange={handleGoogleFitExerciseSyncToggle} thumbColor="#FFFFFF" trackColor={{ false: colors.border, true: colors.primary }} />
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Appearance Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Appearance</Text>

          <View style={dynamicStyles.settingRow}>
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Dark Mode</Text>
              <Text style={dynamicStyles.settingDescription}>Switch themes</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleMode}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Notifications</Text>

          <View style={dynamicStyles.settingRow}>
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Enable Notifications</Text>
            </View>
            <Switch
              value={notificationSettings.enabled}
              onValueChange={(value) => handleNotificationToggle('enabled', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Support */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Support</Text>

          <TouchableOpacity
            style={dynamicStyles.settingRow}
            onPress={() => Linking.openURL('mailto:tryformaapp@gmail.com')}
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
            <Ionicons name="log-out-outline" size={20} color={colors.textTertiary} />
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

        {/* Developer Tools (__DEV__) */}
        {__DEV__ && (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Developer Tools</Text>
            <TouchableOpacity style={dynamicStyles.settingRow} onPress={handleGenerateDemoData}>
              <Text style={dynamicStyles.settingLabel}>Generate Demo Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.settingRow} onPress={handleClearDemoData}>
              <Text style={[dynamicStyles.settingLabel, { color: colors.error }]}>Clear All Data</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
