import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { useMealStore } from '../../store/useMealStore';
import { useTheme } from '../../hooks/useTheme';
import { calculateAll } from '../../utils/calorieCalculator';

export default function GoalResultsScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { data, completeOnboarding, calculateGoals } = useOnboardingStore();
  const { setGoals } = useMealStore();

  useEffect(() => {
    // Ensure goals are calculated
    calculateGoals();
  }, []);

  const handleCreateAccount = async () => {
    // Update meal store with calculated goals
    if (data.calorieGoal && data.proteinGoal) {
      setGoals(data.calorieGoal, data.proteinGoal);
    }
    await completeOnboarding();
    navigation.navigate('SignUp' as never);
  };

  const handleSignIn = async () => {
    // Update meal store with calculated goals
    if (data.calorieGoal && data.proteinGoal) {
      setGoals(data.calorieGoal, data.proteinGoal);
    }
    await completeOnboarding();
    navigation.navigate('SignIn' as never);
  };

  const results = data.calorieGoal
    ? {
        calorieGoal: data.calorieGoal,
        proteinGoal: data.proteinGoal || 0,
        carbsGoal: Math.round((data.calorieGoal * 0.4) / 4),
        fatGoal: Math.round((data.calorieGoal * 0.3) / 9),
      }
    : null;

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 20,
      alignItems: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    calorieBox: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 32,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    calorieValue: {
      fontSize: 48,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    calorieLabel: {
      fontSize: 18,
      color: '#FFFFFF',
      opacity: 0.9,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 32,
      marginBottom: 16,
    },
    macroCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      width: '100%',
      marginBottom: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    macroRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    macroRowLast: {
      borderBottomWidth: 0,
    },
    macroLabel: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    macroValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    explanationText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
      lineHeight: 20,
    },
    buttonContainer: {
      width: '100%',
      marginTop: 32,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 12,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      backgroundColor: colors.surface,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  if (!results) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={dynamicStyles.scrollContent}>
          <Text style={dynamicStyles.title}>Calculating...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const goalExplanation =
    data.weightGoal === 'lose'
      ? `To reach your goal of ${data.targetWeight_kg}kg, you need a daily deficit of 500 calories`
      : data.weightGoal === 'gain'
      ? `To reach your goal of ${data.targetWeight_kg}kg, you need a daily surplus of 500 calories`
      : 'Your daily calorie target to maintain your current weight';

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={dynamicStyles.scrollContent}>
        <Text style={dynamicStyles.title}>🎯 Your Daily Goal</Text>

        {/* Calorie Display */}
        <View style={dynamicStyles.calorieBox}>
          <Text style={dynamicStyles.calorieValue}>{results.calorieGoal}</Text>
          <Text style={dynamicStyles.calorieLabel}>calories</Text>
        </View>

        {/* Macro Breakdown */}
        <Text style={dynamicStyles.sectionTitle}>Based on your profile:</Text>
        <View style={dynamicStyles.macroCard}>
          <View style={dynamicStyles.macroRow}>
            <Text style={dynamicStyles.macroLabel}>Protein</Text>
            <Text style={dynamicStyles.macroValue}>{results.proteinGoal}g</Text>
          </View>
          <View style={dynamicStyles.macroRow}>
            <Text style={dynamicStyles.macroLabel}>Carbs</Text>
            <Text style={dynamicStyles.macroValue}>{results.carbsGoal}g</Text>
          </View>
          <View style={[dynamicStyles.macroRow, dynamicStyles.macroRowLast]}>
            <Text style={dynamicStyles.macroLabel}>Fat</Text>
            <Text style={dynamicStyles.macroValue}>{results.fatGoal}g</Text>
          </View>
        </View>

        {/* Explanation */}
        <Text style={dynamicStyles.explanationText}>{goalExplanation}</Text>

        {/* Action Buttons */}
        <View style={dynamicStyles.buttonContainer}>
          <TouchableOpacity
            style={dynamicStyles.primaryButton}
            onPress={handleCreateAccount}
          >
            <Text style={dynamicStyles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.secondaryButton}
            onPress={handleSignIn}
          >
            <Text style={dynamicStyles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});

