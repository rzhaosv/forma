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
import { useOnboardingStore, ActivityLevel } from '../../store/useOnboardingStore';
import { useTheme } from '../../hooks/useTheme';
import OnboardingProgress from '../../components/OnboardingProgress';
import { Ionicons } from '@expo/vector-icons';

const ACTIVITY_LEVELS: {
  value: ActivityLevel;
  label: string;
  description: string;
  icon: string;
  multiplier: string;
  color: string;
}[] = [
  {
    value: 'sedentary',
    label: 'Couch Potato',
    description: 'Little to no exercise, mostly sitting',
    icon: 'bed',
    multiplier: '× 1.2',
    color: '#94A3B8',
  },
  {
    value: 'light',
    label: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    icon: 'walk',
    multiplier: '× 1.375',
    color: '#3B82F6',
  },
  {
    value: 'moderate',
    label: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    icon: 'bicycle',
    multiplier: '× 1.55',
    color: '#10B981',
  },
  {
    value: 'active',
    label: 'Very Active',
    description: 'Hard exercise 6-7 days/week',
    icon: 'barbell',
    multiplier: '× 1.725',
    color: '#F59E0B',
  },
  {
    value: 'very_active',
    label: 'Super Active',
    description: 'Very hard exercise or physical job daily',
    icon: 'flame',
    multiplier: '× 1.9',
    color: '#EF4444',
  },
];

export default function ActivityLevelScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { data, updateData, setStep } = useOnboardingStore();

  const [selectedLevel, setSelectedLevel] = useState<ActivityLevel | undefined>(data.activityLevel);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardScales = useRef(
    ACTIVITY_LEVELS.reduce((acc, level) => {
      acc[level.value] = new Animated.Value(1);
      return acc;
    }, {} as Record<ActivityLevel, Animated.Value>)
  ).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSelect = (level: ActivityLevel) => {
    setSelectedLevel(level);

    // Bounce animation
    Animated.sequence([
      Animated.spring(cardScales[level], {
        toValue: 0.95,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(cardScales[level], {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = () => {
    if (!selectedLevel) return;

    updateData({ activityLevel: selectedLevel });
    setStep(4);
    navigation.navigate('WeightGoal' as never);
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
    activityCard: {
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
    activityCardSelected: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    activityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    activityEmoji: {
      fontSize: 40,
      marginRight: 16,
    },
    activityTitleContainer: {
      flex: 1,
    },
    activityLabel: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 4,
    },
    activityMultiplier: {
      fontSize: 14,
      fontWeight: '700',
      opacity: 0.6,
    },
    activityDescription: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    continueButton: {
      backgroundColor: colors.primary,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 8,
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
    encouragement: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      fontStyle: 'italic',
    },
    tip: {
      backgroundColor: colors.primary + '15',
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    tipText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
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
          currentStep={3}
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
          <Text style={dynamicStyles.title}>How active are you? 🏃‍♂️</Text>
          <Text style={dynamicStyles.subtitle}>
            This helps us calculate how many calories you burn each day. Be honest - no judgment!
          </Text>

          <View style={dynamicStyles.tip}>
            <Text style={dynamicStyles.tipText}>
              💡 Tip: Choose based on your typical week. You can always change this later as your habits evolve!
            </Text>
          </View>

          {ACTIVITY_LEVELS.map((level) => {
            const isSelected = selectedLevel === level.value;
            return (
              <Animated.View
                key={level.value}
                style={{ transform: [{ scale: cardScales[level.value] }] }}
              >
                <TouchableOpacity
                  style={[
                    dynamicStyles.activityCard,
                    isSelected && dynamicStyles.activityCardSelected,
                    isSelected && {
                      borderColor: level.color,
                      backgroundColor: level.color + '10',
                    },
                  ]}
                  onPress={() => handleSelect(level.value)}
                  activeOpacity={0.7}
                >
                  <View style={dynamicStyles.activityHeader}>
                    <Ionicons
                      name={level.icon as any}
                      size={36}
                      color={isSelected ? level.color : colors.textSecondary}
                    />
                    <View style={dynamicStyles.activityTitleContainer}>
                      <Text
                        style={[
                          dynamicStyles.activityLabel,
                          isSelected && { color: level.color },
                        ]}
                      >
                        {level.label}
                      </Text>
                      <Text
                        style={[
                          dynamicStyles.activityMultiplier,
                          isSelected && { color: level.color },
                        ]}
                      >
                        {level.multiplier} BMR
                      </Text>
                    </View>
                  </View>
                  <Text style={dynamicStyles.activityDescription}>
                    {level.description}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          <Text style={dynamicStyles.encouragement}>
            "Movement is a medicine for creating change in a person's physical, emotional, and mental states." 💫
          </Text>

          <TouchableOpacity
            style={[
              dynamicStyles.continueButton,
              !selectedLevel && dynamicStyles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedLevel}
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
