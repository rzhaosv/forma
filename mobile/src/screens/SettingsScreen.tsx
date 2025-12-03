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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import Constants from 'expo-constants';
import {
  isHealthKitAvailable,
  requestHealthKitPermissions
} from '../services/healthKitService';
import {
  isHealthKitEnabled,
  setHealthKitEnabled,
  isWeightSyncEnabled,
  setWeightSyncEnabled,
  isMealSyncEnabled,
  setMealSyncEnabled,
} from '../utils/healthKitSettings';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import PaywallModal from '../components/PaywallModal';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colors, isDark, toggleMode, mode } = useTheme();
  const { isPremium, subscriptionStatus } = useSubscriptionStore();

  const [healthKitAvailable, setHealthKitAvailable] = useState(false);
  const [healthKitEnabledState, setHealthKitEnabledState] = useState(false);
  const [weightSyncEnabledState, setWeightSyncEnabledState] = useState(true);
  const [mealSyncEnabledState, setMealSyncEnabledState] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const checkHealthKit = async () => {
      if (Platform.OS === 'ios') {
        const available = await isHealthKitAvailable();
        setHealthKitAvailable(available);

        if (available) {
          const enabled = await isHealthKitEnabled();
          const weightSync = await isWeightSyncEnabled();
          const mealSync = await isMealSyncEnabled();

          // If user had HealthKit enabled but is no longer premium, disable it
          if (enabled && !isPremium) {
            await setHealthKitEnabled(false);
            setHealthKitEnabledState(false);
          } else {
            setHealthKitEnabledState(enabled);
          }
          
          setWeightSyncEnabledState(weightSync);
          setMealSyncEnabledState(mealSync);
        }
      }
    };

    checkHealthKit();
  }, [isPremium]);

  const handleHealthKitToggle = async (value: boolean) => {
    // Check if user has premium access for fitness integrations
    if (value && !isPremium) {
      setShowPaywall(true);
      return;
    }
    
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

        {/* Apple Health Section - Premium Feature */}
        {healthKitAvailable && (
          <View style={dynamicStyles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={dynamicStyles.sectionTitle}>Fitness Integrations</Text>
              {!isPremium && (
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

            <View style={[
              dynamicStyles.settingRow,
              !isPremium && { opacity: 0.7 }
            ]}>
              <View style={dynamicStyles.settingContent}>
                <Text style={dynamicStyles.settingLabel}>
                  Apple Health Sync {!isPremium && '🔒'}
                </Text>
                <Text style={dynamicStyles.settingDescription}>
                  {isPremium 
                    ? 'Sync weight and nutrition data with Apple Health'
                    : 'Upgrade to Premium to sync with Apple Health'}
                </Text>
              </View>
              <Switch
                value={healthKitEnabledState}
                onValueChange={handleHealthKitToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={healthKitEnabledState ? '#FFFFFF' : '#FFFFFF'}
                disabled={!isPremium && !healthKitEnabledState}
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

        {/* App Version Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>About</Text>
          
          <View style={[dynamicStyles.settingRow, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>App Version</Text>
              <Text style={dynamicStyles.settingDescription}>
                v{Constants.expoConfig?.version || '1.0.0'} {__DEV__ && '(Development)'}
              </Text>
            </View>
          </View>

          <View style={[dynamicStyles.settingRow, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Build Number</Text>
              <Text style={dynamicStyles.settingDescription}>
                {Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || 'dev'}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Premium Paywall Modal for Fitness Integrations */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        title="Unlock Fitness Integrations"
        message="Sync your nutrition and weight data with Apple Health, Fitbit, and other fitness apps. Upgrade to Premium to unlock this feature."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});

