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
import { Ionicons } from '@expo/vector-icons';

export default function ProfileCompleteScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { data, completeProfile } = useOnboardingStore();
  const { setGoals } = useMealStore();

  // Celebration state
  const [showConfetti, setShowConfetti] = useState(false);
  const [displayCalories, setDisplayCalories] = useState(0);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Calculate proper goals based on user data
    const calculatedResults = data.weight_kg && data.height_cm && data.age && data.gender && data.activityLevel && data.weightGoal
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
    
    const calorieTarget = calculatedResults?.calorieGoal || data.calorieGoal || 2200;

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
  }, [data.calorieGoal, data.weight_kg, data.height_cm, data.age, data.gender, data.activityLevel, data.weightGoal, scaleAnim, fadeAnim, slideUp]);

  // Calculate proper goals based on user data
  const calculatedResults = data.weight_kg && data.height_cm && data.age && data.gender && data.activityLevel && data.weightGoal
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

  const calorieTarget = calculatedResults?.calorieGoal || data.calorieGoal || 2200;
  const results = calculatedResults || {
    calorieGoal: calorieTarget,
    proteinGoal: data.proteinGoal || Math.round((calorieTarget * 0.3) / 4),
    carbsGoal: Math.round((calorieTarget * 0.4) / 4),
    fatGoal: Math.round((calorieTarget * 0.3) / 9),
  };

  const handleContinue = async () => {
    // Update meal store with calculated goals
    setGoals(results.calorieGoal, results.proteinGoal);

    await completeProfile();
    
    // Navigate back to parent navigator (MainNavigator) then to Home
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Home' as never);
    }
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
  });

  const goalExplanation =
    data.weightGoal === 'lose'
      ? 'Based on your profile, this personalized plan helps you lose weight at a healthy, sustainable pace of about 1 lb per week.'
      : data.weightGoal === 'gain'
      ? 'Based on your profile, this personalized plan helps you build muscle with an optimal calorie surplus for gains.'
      : 'Based on your profile, this personalized plan helps you maintain your current weight while tracking your nutrition.';

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Confetti Celebration */}
      <ConfettiCelebration active={showConfetti} />

      <ScrollView style={styles.scrollView} contentContainerStyle={dynamicStyles.scrollContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Ionicons name="checkmark-circle" size={36} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={dynamicStyles.title}>Profile Complete!</Text>
        </View>
        <Text style={dynamicStyles.subtitle}>
          Here's your personalized plan based on your exact stats:
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
          "Your journey to better health starts now!"
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
            <Text style={dynamicStyles.explanationTitle}>🎯 Personalized For You</Text>
            <Text style={dynamicStyles.explanationText}>
              {goalExplanation}
              {'\n\n'}
              These goals are calculated using your exact weight, height, age, gender, and activity level for the most accurate results!
            </Text>
          </View>

          {/* Action Button */}
          <View style={dynamicStyles.buttonContainer}>
            <TouchableOpacity
              style={dynamicStyles.primaryButton}
              onPress={handleContinue}
            >
              <Text style={dynamicStyles.primaryButtonText}>Start Tracking →</Text>
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
