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
import { calculateAll } from '../../utils/calorieCalculator';
import { kgToLbs } from '../../utils/unitSystem';
import BlueprintProgress from '../../components/BlueprintProgress';
import { Ionicons } from '@expo/vector-icons';

const C = {
  bg: '#0A0A0C',
  surface: '#1A1A1E',
  elevated: '#222228',
  text: '#F0F0F5',
  textSub: '#A0A0B0',
  textTertiary: '#6B6B80',
  accent: '#00E676',
  accentBg: 'rgba(0,230,118,0.10)',
  border: 'rgba(255,255,255,0.08)',
};

const TIMELINE = [
  { week: 2, label: 'Better energy & improved meal habits', icon: 'flash' },
  { week: 4, label: 'Visible body composition changes begin', icon: 'trending-up' },
  { week: 8, label: 'Noticeable aesthetic improvement', icon: 'body' },
  { week: 12, label: 'Target physique progress', icon: 'trophy' },
];

export default function TransformationTimelineScreen() {
  const navigation = useNavigation();
  const { data } = useOnboardingStore();
  const { unitSystem } = useUnitSystemStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [calorieCount, setCalorieCount] = useState(0);

  const results = data.weight_kg && data.height_cm && data.age && data.gender && data.activityLevel && data.weightGoal
    ? calculateAll(data.weight_kg, data.height_cm, data.age, data.gender, data.activityLevel, data.weightGoal, data.targetWeight_kg)
    : {
        calorieGoal: data.estimatedCalorieGoal || 2000,
        proteinGoal: Math.round(((data.estimatedCalorieGoal || 2000) * 0.3) / 4),
        carbsGoal: Math.round(((data.estimatedCalorieGoal || 2000) * 0.4) / 4),
        fatGoal: Math.round(((data.estimatedCalorieGoal || 2000) * 0.3) / 9),
      };

  const targetDisplay = data.targetWeight_kg
    ? (unitSystem === 'imperial' ? `${kgToLbs(data.targetWeight_kg)} lbs` : `${Math.round(data.targetWeight_kg)} kg`)
    : null;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();

    // Count-up calories
    const target = results.calorieGoal;
    const duration = 1200;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCalorieCount(target);
        clearInterval(timer);
      } else {
        setCalorieCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [results.calorieGoal]);

  const handleStartTrial = () => {
    navigation.navigate('Paywall' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.progressHeader}>
        <BlueprintProgress progress={1.0} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.heroSection}>
            <View style={styles.completeBadge}>
              <Ionicons name="checkmark-circle" size={20} color={C.accent} />
              <Text style={styles.completeBadgeText}>Your Blueprint is Ready</Text>
            </View>
            <Text style={styles.title}>Your personalized{'\n'}transformation plan</Text>
          </View>

          {/* Calorie target */}
          <View style={styles.calorieCard}>
            <Text style={styles.calorieLabel}>Daily calorie target</Text>
            <Text style={styles.calorieNumber}>{calorieCount.toLocaleString()}</Text>
            <Text style={styles.calorieUnit}>cal / day</Text>

            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{results.proteinGoal}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{results.carbsGoal}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{results.fatGoal}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>
          </View>

          {/* Timeline */}
          <Text style={styles.timelineTitle}>Your transformation roadmap</Text>
          <View style={styles.timeline}>
            {TIMELINE.map((item, i) => (
              <View key={i} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={styles.weekBadge}>
                    <Text style={styles.weekText}>Wk{item.week}</Text>
                  </View>
                  {i < TIMELINE.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineIconBox}>
                    <Ionicons name={item.icon as any} size={18} color={C.accent} />
                  </View>
                  <Text style={styles.timelineLabel}>{item.label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Target weight if applicable */}
          {targetDisplay && data.weightGoal !== 'maintain' && (
            <View style={styles.targetCard}>
              <Text style={styles.targetLabel}>Your goal weight</Text>
              <Text style={styles.targetValue}>{targetDisplay}</Text>
              <Text style={styles.targetNote}>
                Based on your profile, this is safely achievable in {Math.ceil(Math.abs((data.targetWeight_kg || 70) - (data.weight_kg || 75)) / 0.45)} weeks.
              </Text>
            </View>
          )}

          {/* Loss aversion CTA */}
          <View style={styles.saveCta}>
            <Ionicons name="lock-closed" size={16} color={C.accent} />
            <Text style={styles.saveCtaText}>
              Your custom plan is saved — start your free trial to keep it
            </Text>
          </View>

          <TouchableOpacity style={styles.trialBtn} onPress={handleStartTrial} activeOpacity={0.85}>
            <Text style={styles.trialBtnText}>Start My Free Trial</Text>
            <Ionicons name="arrow-forward" size={18} color="#0A0A0C" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          <Text style={styles.trialNote}>Try free for 7 days, then $59.99/year</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  progressHeader: { paddingHorizontal: 24, paddingTop: 12 },
  scroll: { padding: 24, paddingTop: 8, paddingBottom: 40 },
  heroSection: { marginBottom: 24 },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    backgroundColor: C.accentBg,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.2)',
  },
  completeBadgeText: { fontSize: 13, fontWeight: '700', color: C.accent },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  calorieCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.15)',
  },
  calorieLabel: { fontSize: 13, color: C.textSub, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  calorieNumber: { fontSize: 72, fontWeight: '800', color: C.accent, letterSpacing: -3 },
  calorieUnit: { fontSize: 16, color: C.textSub, fontWeight: '600', marginBottom: 20 },
  macroRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  macroItem: { flex: 1, alignItems: 'center' },
  macroValue: { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 2 },
  macroLabel: { fontSize: 12, color: C.textSub, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  macroDivider: { width: 1, height: 40, backgroundColor: C.border },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textSub,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  timeline: { marginBottom: 24 },
  timelineItem: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  timelineLeft: { alignItems: 'center', width: 40 },
  weekBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.accentBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.2)',
  },
  weekText: { fontSize: 11, fontWeight: '800', color: C.accent },
  timelineLine: { width: 2, flex: 1, backgroundColor: 'rgba(0,230,118,0.15)', marginVertical: 4 },
  timelineContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 8,
  },
  timelineIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.accentBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLabel: { flex: 1, fontSize: 14, color: C.text, fontWeight: '600', lineHeight: 20 },
  targetCard: {
    backgroundColor: C.elevated,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  targetLabel: { fontSize: 13, color: C.textSub, fontWeight: '600', marginBottom: 4 },
  targetValue: { fontSize: 40, fontWeight: '800', color: C.accent, marginBottom: 8 },
  targetNote: { fontSize: 13, color: C.textSub, textAlign: 'center', lineHeight: 19 },
  saveCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  saveCtaText: { fontSize: 14, color: C.textSub, fontStyle: 'italic', textAlign: 'center', flex: 1 },
  trialBtn: {
    backgroundColor: C.accent,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  trialBtnText: { color: '#0A0A0C', fontSize: 18, fontWeight: '800' },
  trialNote: { fontSize: 13, color: C.textTertiary, textAlign: 'center' },
});
