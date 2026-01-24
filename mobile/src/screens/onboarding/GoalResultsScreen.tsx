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
import { useUnitSystemStore } from '../../store/useUnitSystemStore';
import { useMealStore } from '../../store/useMealStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { calculateAll } from '../../utils/calorieCalculator';
import ConfettiCelebration from '../../components/ConfettiCelebration';
import { Ionicons } from '@expo/vector-icons';
import { formatWeight } from '../../utils/unitSystem';
import { trackTutorialComplete } from '../../utils/analytics';

export default function GoalResultsScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { data, completeOnboarding, calculateGoals, completeProfile } = useOnboardingStore();
  const { unitSystem } = useUnitSystemStore();
  const { setGoals } = useMealStore();
  const { isAuthenticated } = useAuthStore();

  // Celebration state
  const [showConfetti, setShowConfetti] = useState(false);
  const [displayCalories, setDisplayCalories] = useState(0);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Calculate proper target based on user data if authenticated
    const calculatedResults = isAuthenticated && data.weight_kg && data.height_cm && data.age && data.gender && data.activityLevel && data.weightGoal
      ? calculateAll(
          data.weight_kg,
          data.height_cm,
          data.age,
          data.gender,
          data.activityLevel,
          data.weightGoal,
          data.targetWeight_kg
        )
      : null;
    
    const calorieTarget = calculatedResults?.calorieGoal || data.estimatedCalorieGoal || 2200;

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
      const duration = 1500;
      const steps = 60;
      const increment = calorieTarget / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= calorieTarget) {
          setDisplayCalories(calorieTarget);
          clearInterval(timer);
        } else {
          setDisplayCalories(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, 300);
  }, [data.estimatedCalorieGoal, data.weight_kg, data.height_cm, data.age, data.gender, data.activityLevel, data.weightGoal, isAuthenticated, scaleAnim, fadeAnim, slideUp]);

  const handleContinue = async () => {
    // Update meal store with calculated goals
    setGoals(results.calorieGoal, results.proteinGoal);

    if (isAuthenticated) {
      // Profile completion flow - go back to Home
      await completeProfile();
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate('Home' as never);
      }
    } else {
      // Initial onboarding - complete and go to signup
      await completeOnboarding();
      // Track tutorial completion for new users
      await trackTutorialComplete();
      navigation.navigate('SignUp' as never);
    }
  };

  const handleCreateAccount = async () => {
    // Update meal store with goals
    setGoals(results.calorieGoal, results.proteinGoal);

    await completeOnboarding();
    // Track tutorial completion for new users
    await trackTutorialComplete();
    navigation.navigate('SignUp' as never);
  };

  const handleSignIn = async () => {
    // Update meal store with goals
    setGoals(results.calorieGoal, results.proteinGoal);

    await completeOnboarding();
    // Track tutorial completion for new users
    await trackTutorialComplete();
    navigation.navigate('SignIn' as never);
  };

  // Calculate proper goals based on user data
  const calculatedResults = isAuthenticated && data.weight_kg && data.height_cm && data.age && data.gender && data.activityLevel && data.weightGoal
    ? calculateAll(
        data.weight_kg,
        data.height_cm,
        data.age,
        data.gender,
        data.activityLevel,
        data.weightGoal,
        data.targetWeight_kg
      )
    : null;

  const calorieTarget = calculatedResults?.calorieGoal || data.estimatedCalorieGoal || 2200;
  const results = calculatedResults || {
    calorieGoal: calorieTarget,
    proteinGoal: Math.round((calorieTarget * 0.3) / 4),
    carbsGoal: Math.round((calorieTarget * 0.4) / 4),
    fatGoal: Math.round((calorieTarget * 0.3) / 9),
  };

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

  const goalExplanation =
    data.weightGoal === 'lose'
      ? 'This starting estimate helps you lose weight at a healthy, sustainable pace of about 1 lb per week.'
      : data.weightGoal === 'gain'
      ? 'This starting estimate helps you build muscle with a moderate calorie surplus for optimal gains.'
      : 'This starting estimate helps you maintain your current weight while tracking your nutrition.';

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Confetti Celebration */}
      <ConfettiCelebration active={showConfetti} />

      <ScrollView style={styles.scrollView} contentContainerStyle={dynamicStyles.scrollContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Ionicons name="checkmark-circle" size={36} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={dynamicStyles.title}>You're All Set! 🎉</Text>
        </View>
        <Text style={dynamicStyles.subtitle}>
          Here's your starting plan to get you started:
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
                <Ionicons name="nutrition" size={24} color={colors.text} style={{ marginRight: 12 }} />
                <Text style={dynamicStyles.macroLabel}>Protein</Text>
              </View>
              <Text style={dynamicStyles.macroValue}>{results.proteinGoal}g</Text>
            </View>
            <View style={dynamicStyles.macroRow}>
              <View style={dynamicStyles.macroLabelContainer}>
                <Ionicons name="pizza" size={24} color={colors.text} style={{ marginRight: 12 }} />
                <Text style={dynamicStyles.macroLabel}>Carbs</Text>
              </View>
              <Text style={dynamicStyles.macroValue}>{results.carbsGoal}g</Text>
            </View>
            <View style={[dynamicStyles.macroRow, dynamicStyles.macroRowLast]}>
              <View style={dynamicStyles.macroLabelContainer}>
                <Ionicons name="water" size={24} color={colors.text} style={{ marginRight: 12 }} />
                <Text style={dynamicStyles.macroLabel}>Fat</Text>
              </View>
              <Text style={dynamicStyles.macroValue}>{results.fatGoal}g</Text>
            </View>
          </View>

          {/* Explanation */}
          <View style={dynamicStyles.explanationCard}>
            <Text style={dynamicStyles.explanationTitle}>
              {isAuthenticated ? '🎯 Your Personalized Plan' : '📊 This is your starting estimate'}
            </Text>
            <Text style={dynamicStyles.explanationText}>
              {goalExplanation}
              {!isAuthenticated && (
                '\n\nCreate your account to fine-tune your plan with your exact stats for even better results!'
              )}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={dynamicStyles.buttonContainer}>
          {isAuthenticated ? (
            // Profile completion flow - just save and go to Home
            <TouchableOpacity
              style={dynamicStyles.primaryButton}
              onPress={handleContinue}
            >
              <Text style={dynamicStyles.primaryButtonText}>Save Profile & Start Tracking →</Text>
            </TouchableOpacity>
          ) : (
            // Initial onboarding - create account or sign in
            <>
              <TouchableOpacity
                style={dynamicStyles.primaryButton}
                onPress={handleCreateAccount}
              >
                <Text style={dynamicStyles.primaryButtonText}>Create Account & Save Plan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={dynamicStyles.secondaryButton}
                onPress={handleSignIn}
              >
                <Text style={dynamicStyles.secondaryButtonText}>Already have an account? Sign In</Text>
              </TouchableOpacity>
            </>
          )}
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

