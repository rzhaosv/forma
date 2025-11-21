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

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colors, isDark, toggleMode, mode } = useTheme();

  const [healthKitAvailable, setHealthKitAvailable] = useState(false);
  const [healthKitEnabledState, setHealthKitEnabledState] = useState(false);
  const [weightSyncEnabledState, setWeightSyncEnabledState] = useState(true);
  const [mealSyncEnabledState, setMealSyncEnabledState] = useState(true);

  useEffect(() => {
    const checkHealthKit = async () => {
      if (Platform.OS === 'ios') {
        const available = await isHealthKitAvailable();
        setHealthKitAvailable(available);

        if (available) {
          const enabled = await isHealthKitEnabled();
          const weightSync = await isWeightSyncEnabled();
          const mealSync = await isMealSyncEnabled();

          setHealthKitEnabledState(enabled);
          setWeightSyncEnabledState(weightSync);
          setMealSyncEnabledState(mealSync);
        }
      }
    };

    checkHealthKit();
  }, []);

  const handleHealthKitToggle = async (value: boolean) => {
    if (value) {
      try {
        await requestHealthKitPermissions();
        await setHealthKitEnabled(true);
        setHealthKitEnabledState(true);
        Alert.alert(
          'HealthKit Enabled',
          'Your weight and nutrition data will now sync with Apple Health.'
        );
      } catch (error) {
        console.error('Failed to enable HealthKit:', error);
        Alert.alert(
          'HealthKit Error',
          'Failed to enable HealthKit. Please check your permissions in Settings.'
        );
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

        {/* Apple Health Section */}
        {healthKitAvailable && (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Apple Health</Text>

            <View style={dynamicStyles.settingRow}>
              <View style={dynamicStyles.settingContent}>
                <Text style={dynamicStyles.settingLabel}>Apple Health Sync</Text>
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

