import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore, WeightGoal } from '../../store/useOnboardingStore';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

const GOALS = [
  {
    value: 'lose' as WeightGoal,
    icon: 'trending-down',
    title: 'Lose Weight',
    subtitle: 'Shed pounds & feel amazing',
    color: '#EF4444',
  },
  {
    value: 'maintain' as WeightGoal,
    icon: 'scale',
    title: 'Maintain Weight',
    subtitle: 'Stay balanced & healthy',
    color: '#10B981',
  },
  {
    value: 'gain' as WeightGoal,
    icon: 'trending-up',
    title: 'Gain Muscle',
    subtitle: 'Build strength & size',
    color: '#3B82F6',
  },
];

export default function QuickGoalScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { updateData, calculateEstimatedGoal } = useOnboardingStore();
  const [selectedGoal, setSelectedGoal] = useState<WeightGoal | null>(null);

  const handleContinue = () => {
    if (!selectedGoal) return;

    updateData({ weightGoal: selectedGoal });
    calculateEstimatedGoal();
    navigation.navigate('GoalResults' as never);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
      paddingTop: 40,
    },
    header: {
      marginBottom: 40,
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
      lineHeight: 24,
    },
    goalsContainer: {
      gap: 16,
    },
    goalCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 3,
      borderColor: 'transparent',
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    goalCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    goalCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    goalIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    goalTextContainer: {
      flex: 1,
    },
    goalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    goalSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    checkIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    continueButton: {
      backgroundColor: colors.primary,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 32,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    continueButtonDisabled: {
      opacity: 0.5,
    },
    continueButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={dynamicStyles.content}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>What's Your Main Goal?</Text>
          <Text style={dynamicStyles.subtitle}>
            We'll create a personalized starting plan for you.
          </Text>
        </View>

        <View style={dynamicStyles.goalsContainer}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.value}
              style={[
                dynamicStyles.goalCard,
                selectedGoal === goal.value && dynamicStyles.goalCardSelected,
              ]}
              onPress={() => setSelectedGoal(goal.value)}
              activeOpacity={0.7}
            >
              <View style={dynamicStyles.goalCardContent}>
                <View
                  style={[
                    dynamicStyles.goalIconContainer,
                    { backgroundColor: goal.color + '20' },
                  ]}
                >
                  <Ionicons name={goal.icon as any} size={32} color={goal.color} />
                </View>

                <View style={dynamicStyles.goalTextContainer}>
                  <Text style={dynamicStyles.goalTitle}>{goal.title}</Text>
                  <Text style={dynamicStyles.goalSubtitle}>{goal.subtitle}</Text>
                </View>

                {selectedGoal === goal.value && (
                  <View style={dynamicStyles.checkIcon}>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            dynamicStyles.continueButton,
            !selectedGoal && dynamicStyles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedGoal}
        >
          <Text style={dynamicStyles.continueButtonText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
