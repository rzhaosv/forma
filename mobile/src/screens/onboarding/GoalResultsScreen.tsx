import React, { useEffect, useRef, useState } from 'react';
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
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { useMealStore } from '../../store/useMealStore';
import { useTheme } from '../../hooks/useTheme';
import { calculateAll } from '../../utils/calorieCalculator';
import ConfettiCelebration from '../../components/ConfettiCelebration';

export default function GoalResultsScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { data, completeOnboarding, calculateGoals } = useOnboardingStore();
  const { setGoals } = useMealStore();

  // Celebration state
  const [showConfetti, setShowConfetti] = useState(false);
  const [displayCalories, setDisplayCalories] = useState(0);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Ensure goals are calculated
    calculateGoals();

    // Start celebration sequence
    setTimeout(() => {
      setShowConfetti(true);

      // Pop-in animation for calorie circle
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Fade in content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideUp, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Count-up animation for calories
      if (data.calorieGoal) {
        const duration = 1500;
        const steps = 60;
        const increment = data.calorieGoal / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= data.calorieGoal) {
            setDisplayCalories(data.calorieGoal);
            clearInterval(timer);
          } else {
            setDisplayCalories(Math.floor(current));
          }
        }, duration / steps);

        return () => clearInterval(timer);
      }
    }, 300);
  }, [calculateGoals, data.calorieGoal, scaleAnim, fadeAnim, slideUp]);

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
      fontSize: 36,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 17,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
      paddingHorizontal: 20,
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
      fontWeight: '600',
    },
    celebrationMessage: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: 40,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
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
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    macroRowLast: {
      borderBottomWidth: 0,
    },
    macroLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    macroEmoji: {
      fontSize: 24,
      marginRight: 12,
    },
    macroLabel: {
      fontSize: 17,
      color: colors.text,
      fontWeight: '600',
    },
    macroValue: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.primary,
    },
    explanationCard: {
      backgroundColor: colors.primary + '15',
      borderRadius: 16,
      padding: 20,
      marginTop: 24,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: colors.primary + '30',
    },
    explanationTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    explanationText: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
    },
    citationText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: 32,
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

      {/* Confetti Celebration */}
      <ConfettiCelebration active={showConfetti} />

      <ScrollView style={styles.scrollView} contentContainerStyle={dynamicStyles.scrollContent}>
        <Text style={dynamicStyles.title}>🎉 You're All Set!</Text>
        <Text style={dynamicStyles.subtitle}>
          Here's your personalized daily goal based on your profile:
        </Text>

        {/* Calorie Display */}
        <Animated.View
          style={[
            dynamicStyles.calorieBox,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={dynamicStyles.calorieValue}>{displayCalories}</Text>
          <Text style={dynamicStyles.calorieLabel}>calories per day</Text>
        </Animated.View>

        <Text style={dynamicStyles.celebrationMessage}>
          "You're about to start an amazing journey! 🚀"
        </Text>

        {/* Macro Breakdown */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideUp }] }}>
          <Text style={dynamicStyles.sectionTitle}>Your Macro Targets:</Text>
          <View style={dynamicStyles.macroCard}>
            <View style={dynamicStyles.macroRow}>
              <View style={dynamicStyles.macroLabelContainer}>
                <Text style={dynamicStyles.macroEmoji}>🥩</Text>
                <Text style={dynamicStyles.macroLabel}>Protein</Text>
              </View>
              <Text style={dynamicStyles.macroValue}>{results.proteinGoal}g</Text>
            </View>
            <View style={dynamicStyles.macroRow}>
              <View style={dynamicStyles.macroLabelContainer}>
                <Text style={dynamicStyles.macroEmoji}>🍞</Text>
                <Text style={dynamicStyles.macroLabel}>Carbs</Text>
              </View>
              <Text style={dynamicStyles.macroValue}>{results.carbsGoal}g</Text>
            </View>
            <View style={[dynamicStyles.macroRow, dynamicStyles.macroRowLast]}>
              <View style={dynamicStyles.macroLabelContainer}>
                <Text style={dynamicStyles.macroEmoji}>🥑</Text>
                <Text style={dynamicStyles.macroLabel}>Fat</Text>
              </View>
              <Text style={dynamicStyles.macroValue}>{results.fatGoal}g</Text>
            </View>
          </View>

          {/* Explanation */}
          <View style={dynamicStyles.explanationCard}>
            <Text style={dynamicStyles.explanationTitle}>What This Means:</Text>
            <Text style={dynamicStyles.explanationText}>{goalExplanation}</Text>
          </View>

          {/* Citation Note */}
          <Text style={dynamicStyles.citationText}>
            ✨ Calculated using the Mifflin-St Jeor Equation and USDA guidelines.
          </Text>

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

