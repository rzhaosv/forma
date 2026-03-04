import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useProgressStore } from '../store/useProgressStore';
import { useUnitSystemStore } from '../store/useUnitSystemStore';
import { useMealStore } from '../store/useMealStore';
import { getLocalDateString } from '../utils/dateUtils';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { isHealthKitEnabled } from '../utils/healthKitSettings';
import { Platform } from 'react-native';
import { kgToLbs, lbsToKg, formatWeight } from '../utils/unitSystem';
import { triggerSmartReviewPrompt } from '../services/reviewService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const {
    weightEntries,
    streak,
    addWeightEntry,
    getWeightEntries,
    getWeeklySummaries,
    calculateStreak,
    initialize: initializeProgress,
  } = useProgressStore();
  const { meals, calorieGoal } = useMealStore();
  const { unitSystem } = useUnitSystemStore();

  const [weightInput, setWeightInput] = useState('');
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'calories' | 'weight'>('calories');
  const [healthKitEnabled, setHealthKitEnabled] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      isHealthKitEnabled().then(setHealthKitEnabled);
    }
  }, []);

  // Streak and progress data are already initialized in authService when user logs in
  // No need to initialize here without a userId

  // Recalculate streak when meals change
  useEffect(() => {
    const streakResult = calculateStreak();
    useProgressStore.setState({ streak: streakResult.streak });
  }, [meals.length, calculateStreak]);

  // Trigger smart review when viewing a successful weekly summary
  useEffect(() => {
    const checkWeeklySummaryReview = async () => {
      try {
        if (!currentWeek) return;
        
        // Only trigger if user had a successful week (5+ days logged)
        if (currentWeek.daysLogged < 5) return;
        
        // Check if we've already shown review prompt for this week
        const weekKey = `@nutrisnap_weekly_review_${currentWeek.weekStart}`;
        const alreadyShown = await AsyncStorage.getItem(weekKey);
        if (alreadyShown) return;
        
        // Mark as shown for this week
        await AsyncStorage.setItem(weekKey, 'true');
        
        // Small delay to let screen settle
        setTimeout(() => {
          console.log('[ReviewService] Triggering review for successful weekly summary');
          triggerSmartReviewPrompt('weekly_summary').catch((e) => 
            console.warn('[ProgressScreen] Review prompt error:', e)
          );
        }, 2000);
      } catch (error) {
        console.warn('[ProgressScreen] Error in weekly summary review check:', error);
      }
    };
    
    checkWeeklySummaryReview();
  }, [currentWeek]);

  // Get last 7 days of calorie data for line chart
  const getWeeklyCalorieData = () => {
    const labels: string[] = [];
    const data: number[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = getLocalDateString(date);

      const dayMeals = meals.filter(meal => getLocalDateString(new Date(meal.timestamp)) === dateStr);
      const calories = dayMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);

      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      labels.push(dayName);
      data.push(calories);
    }

    return { labels, datasets: [{ data }] };
  };

  // Get weight chart data (last 30 days)
  const getWeightChartData = () => {
    const entries = getWeightEntries(30);
    if (entries.length === 0) return null;

    const labels: string[] = [];
    const data: number[] = [];

    entries.forEach(entry => {
      if (entry && typeof entry.weight_kg === 'number') {
        const date = new Date(entry.date);
        labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
        const displayWeight = unitSystem === 'imperial' ? kgToLbs(entry.weight_kg) : Math.round(entry.weight_kg * 10) / 10;
        data.push(displayWeight);
      }
    });

    return { labels, datasets: [{ data }] };
  };


  const handleAddWeight = async () => {
    const inputWeight = parseFloat(weightInput);
    const minWeight = unitSystem === 'imperial' ? 66 : 30;
    const maxWeight = unitSystem === 'imperial' ? 660 : 300;
    const unitLabel = unitSystem === 'imperial' ? 'lbs' : 'kg';

    if (isNaN(inputWeight) || inputWeight < minWeight || inputWeight > maxWeight) {
      Alert.alert('Invalid Weight', `Please enter a weight between ${minWeight}-${maxWeight} ${unitLabel}`);
      return;
    }

    // Convert to kg for storage
    const weightInKg = unitSystem === 'imperial' ? lbsToKg(inputWeight) : inputWeight;

    await addWeightEntry(weightInKg);
    setWeightInput('');
    setShowWeightForm(false);
    Alert.alert('Weight Logged!', `Your weight of ${inputWeight} ${unitLabel} has been recorded.`);
  };

  const calorieChartData = getWeeklyCalorieData();
  const weightChartData = getWeightChartData();
  const weeklySummaries = getWeeklySummaries(4);
  const currentWeek = weeklySummaries[0];

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => colors.textSecondary + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary,
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
    },
    fillShadowGradientOpacity: 1,
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
      backgroundColor: colors.background,
    },
    backButton: {
      marginRight: 16,
      paddingVertical: 4,
    },
    backText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.3,
    },
    scrollContent: {
      padding: 20,
      paddingTop: 16,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
    },
    statValue: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.primary,
      marginBottom: 4,
      letterSpacing: -1,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textTertiary,
      textAlign: 'center',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 3,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: '#0A0A0C',
    },
    chartCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
    },
    chartTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      letterSpacing: 0.2,
    },
    chartContainer: {
      height: 250,
    },
    weightForm: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
    },
    weightFormTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 14,
    },
    weightInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 14,
    },
    weightInput: {
      flex: 1,
      fontSize: 20,
      fontWeight: '700',
      color: colors.inputText,
      paddingVertical: 14,
    },
    weightUnit: {
      fontSize: 15,
      color: colors.textSecondary,
      marginLeft: 8,
      fontWeight: '600',
    },
    weightFormButtons: {
      flexDirection: 'row',
      gap: 10,
    },
    weightFormButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    weightFormButtonCancel: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.surfaceSecondary,
    },
    weightFormButtonSave: {
      backgroundColor: colors.primary,
    },
    weightFormButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    weightFormButtonTextSave: {
      color: '#0A0A0C',
    },
    addWeightButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: 'center',
      marginBottom: 20,
    },
    addWeightButtonText: {
      color: '#0A0A0C',
      fontSize: 16,
      fontWeight: '700',
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : colors.divider,
    },
    summaryRowLast: {
      borderBottomWidth: 0,
    },
    summaryLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
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
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>Progress</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={dynamicStyles.scrollContent}>
        {/* Stats Row */}
        <View style={dynamicStyles.statsRow}>
          <View style={dynamicStyles.statCard}>
            <Text style={dynamicStyles.statValue}>{streak}</Text>
            <Text style={dynamicStyles.statLabel}>Day Streak</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <Text style={dynamicStyles.statValue}>
              {currentWeek?.avgDailyCalories || 0}
            </Text>
            <Text style={dynamicStyles.statLabel}>Avg Daily Calories</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <Text style={dynamicStyles.statValue}>
              {(() => {
                const lastEntry = weightEntries[weightEntries.length - 1];
                if (lastEntry && typeof lastEntry.weight_kg === 'number') {
                  const displayWeight = unitSystem === 'imperial' ? kgToLbs(lastEntry.weight_kg) : Math.round(lastEntry.weight_kg * 10) / 10;
                  return displayWeight;
                }
                return '--';
              })()}
            </Text>
            <Text style={dynamicStyles.statLabel}>Current Weight ({unitSystem === 'imperial' ? 'lbs' : 'kg'})</Text>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={dynamicStyles.tabContainer}>
          <TouchableOpacity
            style={[dynamicStyles.tab, selectedTab === 'calories' && dynamicStyles.tabActive]}
            onPress={() => setSelectedTab('calories')}
          >
            <Text style={[dynamicStyles.tabText, selectedTab === 'calories' && dynamicStyles.tabTextActive]}>
              Calories
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.tab, selectedTab === 'weight' && dynamicStyles.tabActive]}
            onPress={() => setSelectedTab('weight')}
          >
            <Text style={[dynamicStyles.tabText, selectedTab === 'weight' && dynamicStyles.tabTextActive]}>
              Weight
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calories Chart */}
        {selectedTab === 'calories' && (
          <View style={dynamicStyles.chartCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={dynamicStyles.chartTitle}>Weekly Calories</Text>
              {healthKitEnabled && (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <Ionicons name="heart" size={14} color="#FF2D55" style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary }}>APPLE HEALTH</Text>
                </View>
              )}
            </View>
            <View style={dynamicStyles.chartContainer}>
              <BarChart
                data={calorieChartData}
                width={screenWidth - 72}
                height={220}
                chartConfig={chartConfig}
                fromZero
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                withInnerLines={false}
                showValuesOnTopOfBars={false}
                withHorizontalLabels={true}
                withVerticalLabels={true}
                yAxisLabel=""
                yAxisSuffix=""
              />
              {calorieGoal > 0 && (
                <View style={{ marginTop: 8, paddingHorizontal: 16 }}>
                  <Text style={[dynamicStyles.statLabel, { fontSize: 12 }]}>
                    Goal: {calorieGoal} kcal
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Weight Chart */}
        {selectedTab === 'weight' && (
          <>
            {!showWeightForm ? (
              <TouchableOpacity
                style={dynamicStyles.addWeightButton}
                onPress={() => setShowWeightForm(true)}
              >
                <Text style={dynamicStyles.addWeightButtonText}>+ Log Weight</Text>
              </TouchableOpacity>
            ) : (
              <View style={dynamicStyles.weightForm}>
                <Text style={dynamicStyles.weightFormTitle}>Log Your Weight</Text>
                <View style={dynamicStyles.weightInputContainer}>
                  <TextInput
                    style={dynamicStyles.weightInput}
                    value={weightInput}
                    onChangeText={setWeightInput}
                    keyboardType="numeric"
                    placeholder={unitSystem === 'imperial' ? '154' : '70'}
                    placeholderTextColor={colors.placeholder}
                  />
                  <Text style={dynamicStyles.weightUnit}>{unitSystem === 'imperial' ? 'lbs' : 'kg'}</Text>
                </View>
                <View style={dynamicStyles.weightFormButtons}>
                  <TouchableOpacity
                    style={[dynamicStyles.weightFormButton, dynamicStyles.weightFormButtonCancel]}
                    onPress={() => {
                      setShowWeightForm(false);
                      setWeightInput('');
                    }}
                  >
                    <Text style={dynamicStyles.weightFormButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[dynamicStyles.weightFormButton, dynamicStyles.weightFormButtonSave]}
                    onPress={handleAddWeight}
                  >
                    <Text style={[dynamicStyles.weightFormButtonText, dynamicStyles.weightFormButtonTextSave]}>
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {weightChartData ? (
              <View style={dynamicStyles.chartCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={dynamicStyles.chartTitle}>Weight Trend (Last 30 Days)</Text>
                  {healthKitEnabled && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                      <Ionicons name="heart" size={14} color="#FF2D55" style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary }}>APPLE HEALTH</Text>
                    </View>
                  )}
                </View>
                <View style={dynamicStyles.chartContainer}>
                  <LineChart
                    data={weightChartData}
                    width={screenWidth - 72}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                    }}
                    withInnerLines={false}
                    withOuterLines={true}
                    withVerticalLines={false}
                    withHorizontalLines={true}
                    withDots={true}
                    withShadow={false}
                  />
                </View>
              </View>
            ) : (
              <View style={dynamicStyles.chartCard}>
                <Text style={[dynamicStyles.chartTitle, { textAlign: 'center', marginTop: 40 }]}>
                  No weight data yet
                </Text>
                <Text style={[dynamicStyles.statLabel, { textAlign: 'center', marginTop: 8 }]}>
                  Log your weight to see trends
                </Text>
              </View>
            )}
          </>
        )}


        {/* Weekly Summary */}
        {currentWeek && (
          <View style={dynamicStyles.summaryCard}>
            <Text style={dynamicStyles.chartTitle}>This Week's Summary</Text>
            <View style={dynamicStyles.summaryRow}>
              <Text style={dynamicStyles.summaryLabel}>Total Calories</Text>
              <Text style={dynamicStyles.summaryValue}>{currentWeek.totalCalories} kcal</Text>
            </View>
            <View style={dynamicStyles.summaryRow}>
              <Text style={dynamicStyles.summaryLabel}>Average Daily</Text>
              <Text style={dynamicStyles.summaryValue}>{currentWeek.avgDailyCalories} kcal</Text>
            </View>
            <View style={[dynamicStyles.summaryRow, dynamicStyles.summaryRowLast, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.divider }]}>
              <Text style={dynamicStyles.summaryLabel}>Days Logged</Text>
              <Text style={dynamicStyles.summaryValue}>{currentWeek.daysLogged} / 7</Text>
            </View>
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
