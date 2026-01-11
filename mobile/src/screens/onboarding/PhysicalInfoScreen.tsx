import React, { useState, useRef, useEffect } from 'react';
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
import { useTheme } from '../../hooks/useTheme';
import Slider from '@react-native-community/slider';
import OnboardingProgress from '../../components/OnboardingProgress';

export default function PhysicalInfoScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { data, updateData, setStep } = useOnboardingStore();

  const [weight, setWeight] = useState(data.weight_kg || 70);
  const [height, setHeight] = useState(data.height_cm || 175);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleWeightChange = (value: number) => {
    setWeight(Math.round(value));
    animateValue();
  };

  const handleHeightChange = (value: number) => {
    setHeight(Math.round(value));
    animateValue();
  };

  const animateValue = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const calculateBMI = () => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = () => {
    const bmi = parseFloat(calculateBMI());
    if (bmi < 18.5) return { text: 'Underweight', emoji: '📉', color: '#3B82F6' };
    if (bmi < 25) return { text: 'Healthy', emoji: '✨', color: '#10B981' };
    if (bmi < 30) return { text: 'Overweight', emoji: '📈', color: '#F59E0B' };
    return { text: 'Obese', emoji: '⚠️', color: '#EF4444' };
  };

  const handleContinue = () => {
    updateData({
      weight_kg: weight,
      height_cm: height,
    });

    setStep(2);
    navigation.navigate('Demographics' as never);
  };

  const bmiCategory = getBMICategory();

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
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      marginBottom: 24,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    sliderSection: {
      marginBottom: 32,
    },
    sliderLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 16,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    valueDisplay: {
      alignItems: 'center',
      marginBottom: 20,
    },
    valueNumber: {
      fontSize: 56,
      fontWeight: '800',
      color: colors.text,
    },
    valueUnit: {
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
    bmiCard: {
      backgroundColor: bmiCategory.color + '15',
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 2,
      borderColor: bmiCategory.color + '40',
    },
    bmiTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    bmiValue: {
      fontSize: 48,
      fontWeight: '800',
      color: bmiCategory.color,
      marginBottom: 8,
    },
    bmiCategory: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    bmiEmoji: {
      fontSize: 24,
    },
    bmiCategoryText: {
      fontSize: 18,
      fontWeight: '700',
      color: bmiCategory.color,
    },
    bmiNote: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 12,
      lineHeight: 18,
    },
    continueButton: {
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
    continueButtonText: {
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
          currentStep={1}
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
          <Text style={dynamicStyles.title}>Let's get your stats! 💪</Text>
          <Text style={dynamicStyles.subtitle}>
            Slide to set your current measurements. Don't worry, you can always change these later.
          </Text>

          {/* Weight Slider */}
          <View style={dynamicStyles.card}>
            <Text style={dynamicStyles.sliderLabel}>Your Weight</Text>
            <Animated.View style={[dynamicStyles.valueDisplay, { transform: [{ scale: scaleAnim }] }]}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={dynamicStyles.valueNumber}>{weight}</Text>
                <Text style={dynamicStyles.valueUnit}>kg</Text>
              </View>
            </Animated.View>
            <Slider
              style={dynamicStyles.slider}
              minimumValue={30}
              maximumValue={200}
              value={weight}
              onValueChange={handleWeightChange}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.divider}
              thumbTintColor={colors.primary}
              step={1}
            />
            <View style={dynamicStyles.sliderRange}>
              <Text style={dynamicStyles.rangeText}>30 kg</Text>
              <Text style={dynamicStyles.rangeText}>200 kg</Text>
            </View>
          </View>

          {/* Height Slider */}
          <View style={dynamicStyles.card}>
            <Text style={dynamicStyles.sliderLabel}>Your Height</Text>
            <Animated.View style={[dynamicStyles.valueDisplay, { transform: [{ scale: scaleAnim }] }]}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={dynamicStyles.valueNumber}>{height}</Text>
                <Text style={dynamicStyles.valueUnit}>cm</Text>
              </View>
            </Animated.View>
            <Slider
              style={dynamicStyles.slider}
              minimumValue={100}
              maximumValue={250}
              value={height}
              onValueChange={handleHeightChange}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.divider}
              thumbTintColor={colors.primary}
              step={1}
            />
            <View style={dynamicStyles.sliderRange}>
              <Text style={dynamicStyles.rangeText}>100 cm</Text>
              <Text style={dynamicStyles.rangeText}>250 cm</Text>
            </View>
          </View>

          {/* BMI Preview */}
          <View style={dynamicStyles.bmiCard}>
            <Text style={dynamicStyles.bmiTitle}>Your BMI Preview</Text>
            <Text style={dynamicStyles.bmiValue}>{calculateBMI()}</Text>
            <View style={dynamicStyles.bmiCategory}>
              <Text style={dynamicStyles.bmiEmoji}>{bmiCategory.emoji}</Text>
              <Text style={dynamicStyles.bmiCategoryText}>{bmiCategory.text}</Text>
            </View>
            <Text style={dynamicStyles.bmiNote}>
              This is just a starting point! We'll create a personalized plan for your goals.
            </Text>
          </View>

          <Text style={dynamicStyles.encouragement}>
            "Every journey begins with a single step. You're doing great!" 🌟
          </Text>

          <TouchableOpacity
            style={dynamicStyles.continueButton}
            onPress={handleContinue}
          >
            <Text style={dynamicStyles.continueButtonText}>Continue →</Text>
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
