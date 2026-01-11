// Onboarding Progress Component
// Displays animated progress through onboarding steps

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
}

export default function OnboardingProgress({ currentStep, totalSteps, stepTitles }: OnboardingProgressProps) {
  const { colors } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef<Animated.Value[]>(
    Array.from({ length: totalSteps }, () => new Animated.Value(1))
  ).current;

  useEffect(() => {
    // Animate progress bar
    Animated.spring(progressAnim, {
      toValue: currentStep,
      tension: 50,
      friction: 7,
      useNativeDriver: false,
    }).start();

    // Pulse the current step
    if (scaleAnims[currentStep - 1]) {
      Animated.sequence([
        Animated.spring(scaleAnims[currentStep - 1], {
          toValue: 1.2,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnims[currentStep - 1], {
          toValue: 1,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentStep, progressAnim, scaleAnims]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, totalSteps],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: colors.divider }]}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>

      {/* Step Indicators */}
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <Animated.View
              key={index}
              style={[
                styles.stepIndicator,
                {
                  backgroundColor: isCompleted || isCurrent ? colors.primary : colors.divider,
                  transform: [{ scale: scaleAnims[index] }],
                },
              ]}
            >
              {isCompleted && <Text style={styles.checkmark}>✓</Text>}
              {isCurrent && !isCompleted && (
                <Text style={[styles.stepNumber, { color: '#fff' }]}>{stepNumber}</Text>
              )}
              {!isCompleted && !isCurrent && (
                <Text style={[styles.stepNumber, { color: colors.textSecondary }]}>{stepNumber}</Text>
              )}
            </Animated.View>
          );
        })}
      </View>

      {/* Current Step Title */}
      {stepTitles && stepTitles[currentStep - 1] && (
        <Text style={[styles.stepTitle, { color: colors.textSecondary }]}>
          Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});
