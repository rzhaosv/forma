import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BlueprintProgress from '../../components/BlueprintProgress';

const C = {
  bg: '#0A0A0C',
  surface: '#1A1A1E',
  text: '#F0F0F5',
  textSub: '#A0A0B0',
  textTertiary: '#6B6B80',
  accent: '#00E676',
  accentBg: 'rgba(0,230,118,0.10)',
  border: 'rgba(255,255,255,0.08)',
};

const STEPS = [
  'Analyzing your metabolism...',
  'Calculating optimal macros...',
  'Mapping your transformation timeline...',
  'Building your custom plan...',
  'Finalizing your Nutrition Blueprint...',
];

export default function LaborIllusionScreen() {
  const navigation = useNavigation();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0.92);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Spin animation for the loading ring
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Step through items
    let step = 0;
    const stepInterval = setInterval(() => {
      if (step < STEPS.length) {
        setCompletedSteps(prev => [...prev, step]);
        step++;
        setCurrentStep(step);
        setProgress(0.92 + (step / STEPS.length) * 0.08);

        if (step >= STEPS.length) {
          clearInterval(stepInterval);
          // Navigate after a brief pause
          setTimeout(() => {
            navigation.navigate('TransformationTimeline' as never);
          }, 600);
        }
      }
    }, 700);

    return () => clearInterval(stepInterval);
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <BlueprintProgress progress={progress} />
      </View>

      <View style={styles.content}>
        {/* Animated logo */}
        <View style={styles.loaderSection}>
          <Animated.View style={styles.glowRing}>
            <Animated.View
              style={[
                styles.spinRing,
                { transform: [{ rotate: spin }] },
              ]}
            />
          </Animated.View>
          <Animated.Text style={[styles.processingLabel, { opacity: glowAnim }]}>
            Personalizing your plan
          </Animated.Text>
        </View>

        {/* Steps list */}
        <View style={styles.stepsList}>
          {STEPS.map((step, i) => {
            const isDone = completedSteps.includes(i);
            const isCurrent = currentStep === i;
            return (
              <View key={i} style={styles.stepRow}>
                <View style={[
                  styles.stepDot,
                  isDone && { backgroundColor: C.accent },
                  isCurrent && { borderColor: C.accent },
                ]}>
                  {isDone && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </View>
                <Text style={[
                  styles.stepText,
                  isDone && { color: C.text },
                  isCurrent && { color: C.accent },
                ]}>
                  {step}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.bottomNote}>
          The more you share, the more accurate your plan.{'\n'}That's why we ask.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 24, paddingTop: 12 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  loaderSection: { alignItems: 'center', gap: 16 },
  glowRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(0,230,118,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: C.accent,
  },
  processingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: C.accent,
    letterSpacing: 0.5,
  },
  stepsList: { width: '100%', gap: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: { color: '#0A0A0C', fontSize: 12, fontWeight: '800' },
  stepText: {
    fontSize: 16,
    color: C.textTertiary,
    flex: 1,
    fontWeight: '500',
  },
  bottomNote: {
    fontSize: 13,
    color: C.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
