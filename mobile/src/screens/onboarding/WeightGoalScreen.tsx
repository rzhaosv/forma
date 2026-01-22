import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore, WeightGoal } from '../../store/useOnboardingStore';
import { useUnitSystemStore } from '../../store/useUnitSystemStore';
import { useTheme } from '../../hooks/useTheme';
import Slider from '@react-native-community/slider';
import OnboardingProgress from '../../components/OnboardingProgress';
import { Ionicons } from '@expo/vector-icons';
import { kgToLbs, lbsToKg, formatWeight } from '../../utils/unitSystem';

const WEIGHT_GOALS: {
  value: WeightGoal;
  label: string;
  icon: string;
  description: string;
  motivationalLine: string;
  color: string;
}[] = [
  {
    value: 'lose',
    label: 'Lose Weight',
    icon: 'trending-down',
    description: 'Shed those extra pounds and feel amazing',
    motivationalLine: "You're about to transform! Let's create a sustainable deficit.",
    color: '#10B981',
  },
  {
    value: 'maintain',
    label: 'Maintain Weight',
    icon: 'git-compare',
    description: 'Stay at your current weight while building healthy habits',
    motivationalLine: 'Perfect! Maintenance is all about consistency and balance.',
    color: '#3B82F6',
  },
  {
    value: 'gain',
    label: 'Build Muscle',
    icon: 'barbell',
    description: 'Gain muscle mass and get stronger',
    motivationalLine: "Let's bulk up! Time to fuel those gains with a calorie surplus.",
    color: '#F59E0B',
  },
];

export default function WeightGoalScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { data, updateData } = useOnboardingStore();
  const { unitSystem } = useUnitSystemStore();

  const [selectedGoal, setSelectedGoal] = useState<WeightGoal | undefined>(data.weightGoal);
  const [targetWeight, setTargetWeight] = useState(
    data.targetWeight_kg || data.weight_kg || 70
  );

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const goalScales = useRef({
    lose: new Animated.Value(1),
    maintain: new Animated.Value(1),
    gain: new Animated.Value(1),
  }).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleGoalSelect = (goal: WeightGoal) => {
    setSelectedGoal(goal);

    // Bounce animation
    Animated.sequence([
      Animated.spring(goalScales[goal], {
        toValue: 1.05,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(goalScales[goal], {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Set target weight based on goal
    if (goal === 'maintain' && data.weight_kg) {
      setTargetWeight(data.weight_kg);
    }
  };

  const handleCalculate = () => {
    if (!selectedGoal) return;

    updateData({
      weightGoal: selectedGoal,
      targetWeight_kg: targetWeight,
    });

    // Calculate goals
    const store = useOnboardingStore.getState();
    store.calculateGoals();

    navigation.navigate('GoalResults' as never);
  };

  const currentWeight = data.weight_kg || 70;
  const weightDifference = targetWeight - currentWeight;
  const selectedGoalData = WEIGHT_GOALS.find((g) => g.value === selectedGoal);

  const displayCurrentWeight = unitSystem === 'imperial' ? kgToLbs(currentWeight) : Math.round(currentWeight);
  const displayTargetWeight = unitSystem === 'imperial' ? kgToLbs(targetWeight) : Math.round(targetWeight);
  const weightUnit = unitSystem === 'imperial' ? 'lbs' : 'kg';

  const getWeightChangeMessage = () => {
    if (!selectedGoal) return '';
    if (selectedGoal === 'maintain') return 'Maintain current weight';
    const diff = Math.abs(weightDifference);
    if (diff === 0) return 'Maintain current weight';
    const direction = weightDifference > 0 ? 'Gain' : 'Lose';
    const weeks = Math.ceil(diff / 0.5);
    const displayDiff = unitSystem === 'imperial' ? Math.round(diff * 2.20462) : diff.toFixed(1);
    const weeklyRate = unitSystem === 'imperial' ? '1lb/week' : '0.5kg/week';
    return `${direction} ${displayDiff} ${weightUnit} (~${weeks} weeks at ${weeklyRate})`;
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    backText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
      marginLeft: 4,
    },
    scrollContent: {
      padding: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 17,
      color: colors.textSecondary,
      marginBottom: 32,
      lineHeight: 24,
    },
    goalCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      borderWidth: 3,
      borderColor: colors.border,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    goalCardSelected: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    goalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    goalEmoji: {
      fontSize: 36,
      marginRight: 16,
    },
    goalTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      flex: 1,
    },
    goalDescription: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 12,
      lineHeight: 22,
    },
    motivationalLine: {
      fontSize: 14,
      fontStyle: 'italic',
      fontWeight: '600',
      lineHeight: 20,
    },
    targetWeightCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      marginTop: 8,
      marginBottom: 24,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    sectionLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 20,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    weightDisplay: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'baseline',
      marginBottom: 20,
    },
    currentWeightLabel: {
      fontSize: 16,
      color: colors.textSecondary,
      marginRight: 12,
    },
    currentWeightValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    arrow: {
      fontSize: 20,
      marginHorizontal: 16,
      color: colors.textSecondary,
    },
    targetWeightValue: {
      fontSize: 48,
      fontWeight: '800',
      color: selectedGoalData?.color || colors.primary,
    },
    weightUnit: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textSecondary,
      marginLeft: 8,
    },
    slider: {
      width: '100%',
      height: 40,
    },
    sliderRange: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    rangeText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    changeMessage: {
      fontSize: 16,
      fontWeight: '600',
      color: selectedGoalData?.color || colors.primary,
      textAlign: 'center',
      marginTop: 16,
    },
    calculateButton: {
      backgroundColor: colors.primary,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    calculateButtonDisabled: {
      opacity: 0.5,
    },
    calculateButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
    encouragement: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      fontStyle: 'italic',
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

        <OnboardingProgress
          currentStep={4}
          totalSteps={4}
          stepTitles={['Physical Info', 'About You', 'Activity', 'Goals']}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={dynamicStyles.title}>What's your goal? 🎯</Text>
          <Text style={dynamicStyles.subtitle}>
            Choose your main objective. We'll create a personalized plan to help you get there!
          </Text>

          {/* Goal Selection */}
          {WEIGHT_GOALS.map((goal) => {
            const isSelected = selectedGoal === goal.value;
            return (
              <Animated.View
                key={goal.value}
                style={{ transform: [{ scale: goalScales[goal.value] }] }}
              >
                <TouchableOpacity
                  style={[
                    dynamicStyles.goalCard,
                    isSelected && dynamicStyles.goalCardSelected,
                    isSelected && {
                      borderColor: goal.color,
                      backgroundColor: goal.color + '10',
                    },
                  ]}
                  onPress={() => handleGoalSelect(goal.value)}
                  activeOpacity={0.7}
                >
                  <View style={dynamicStyles.goalHeader}>
                    <Ionicons
                      name={goal.icon as any}
                      size={36}
                      color={isSelected ? goal.color : colors.textSecondary}
                      style={{ marginRight: 16 }}
                    />
                    <Text
                      style={[
                        dynamicStyles.goalTitle,
                        isSelected && { color: goal.color },
                      ]}
                    >
                      {goal.label}
                    </Text>
                  </View>
                  <Text style={dynamicStyles.goalDescription}>
                    {goal.description}
                  </Text>
                  {isSelected && (
                    <Text style={[dynamicStyles.motivationalLine, { color: goal.color }]}>
                      {goal.motivationalLine}
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          {/* Target Weight Slider */}
          {selectedGoal && selectedGoal !== 'maintain' && (
            <View style={dynamicStyles.targetWeightCard}>
              <Text style={dynamicStyles.sectionLabel}>Target Weight</Text>
              <View style={dynamicStyles.weightDisplay}>
                <Text style={dynamicStyles.currentWeightLabel}>Current:</Text>
                <Text style={dynamicStyles.currentWeightValue}>{displayCurrentWeight} {weightUnit}</Text>
                <Text style={dynamicStyles.arrow}>→</Text>
                <Text style={dynamicStyles.targetWeightValue}>{displayTargetWeight}</Text>
                <Text style={dynamicStyles.weightUnit}>{weightUnit}</Text>
              </View>
              <Slider
                style={dynamicStyles.slider}
                minimumValue={unitSystem === 'imperial' ? 66 : 30}
                maximumValue={unitSystem === 'imperial' ? 440 : 200}
                value={displayTargetWeight}
                onValueChange={(value) => {
                  const roundedValue = Math.round(value);
                  if (unitSystem === 'imperial') {
                    setTargetWeight(lbsToKg(roundedValue));
                  } else {
                    setTargetWeight(roundedValue);
                  }
                }}
                minimumTrackTintColor={selectedGoalData?.color || colors.primary}
                maximumTrackTintColor={colors.divider}
                thumbTintColor={selectedGoalData?.color || colors.primary}
                step={1}
              />
              <View style={dynamicStyles.sliderRange}>
                <Text style={dynamicStyles.rangeText}>
                  {unitSystem === 'imperial' ? '66 lbs' : '30 kg'}
                </Text>
                <Text style={dynamicStyles.rangeText}>
                  {unitSystem === 'imperial' ? '440 lbs' : '200 kg'}
                </Text>
              </View>
              <Text style={dynamicStyles.changeMessage}>{getWeightChangeMessage()}</Text>
            </View>
          )}

          <Text style={dynamicStyles.encouragement}>
            "The secret of getting ahead is getting started. You're almost there!" 🚀
          </Text>

          <TouchableOpacity
            style={[
              dynamicStyles.calculateButton,
              !selectedGoal && dynamicStyles.calculateButtonDisabled,
            ]}
            onPress={handleCalculate}
            disabled={!selectedGoal}
          >
            <Text style={dynamicStyles.calculateButtonText}>
              Calculate My Goals →
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
