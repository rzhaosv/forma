import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { useUnitSystemStore } from '../../store/useUnitSystemStore';
import Slider from '@react-native-community/slider';
import BlueprintProgress from '../../components/BlueprintProgress';
import { kgToLbs, lbsToKg } from '../../utils/unitSystem';

const C = {
  bg: '#0A0A0C',
  surface: '#1A1A1E',
  text: '#F0F0F5',
  textSub: '#A0A0B0',
  textTertiary: '#6B6B80',
  accent: '#00E676',
  accentBg: 'rgba(0,230,118,0.12)',
  border: 'rgba(255,255,255,0.08)',
};

export default function GoalWeightScreen() {
  const navigation = useNavigation();
  const { data, updateData } = useOnboardingStore();
  const { unitSystem } = useUnitSystemStore();

  const currentKg = data.weight_kg || 75;
  const [targetKg, setTargetKg] = useState(data.targetWeight_kg || currentKg);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const displayTarget = unitSystem === 'imperial' ? kgToLbs(targetKg) : Math.round(targetKg);
  const displayCurrent = unitSystem === 'imperial' ? kgToLbs(currentKg) : Math.round(currentKg);
  const unit = unitSystem === 'imperial' ? 'lbs' : 'kg';

  const diff = displayTarget - displayCurrent;
  const getDiffLabel = () => {
    if (Math.abs(diff) < 1) return 'Maintain current weight';
    const direction = diff > 0 ? 'Gain' : 'Lose';
    const weeks = Math.ceil(Math.abs(targetKg - currentKg) / 0.45);
    return `${direction} ${Math.abs(Math.round(diff))} ${unit} (~${weeks} weeks)`;
  };

  const getDiffColor = () => {
    if (Math.abs(diff) < 1) return C.textSub;
    return diff < 0 ? '#00E676' : '#00B0FF';
  };

  const onSliderChange = (value: number) => {
    const rounded = Math.round(value);
    const kg = unitSystem === 'imperial' ? lbsToKg(rounded) : rounded;
    setTargetKg(kg);

    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.06, tension: 150, friction: 4, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 150, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handleContinue = () => {
    updateData({ targetWeight_kg: targetKg });
    navigation.navigate('AgeScreen' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <BlueprintProgress progress={0.35} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>What's your goal weight?</Text>
        <Text style={styles.subtitle}>
          Let's build a plan that works with your schedule, not against it.
        </Text>

        {/* Current → Target display */}
        <View style={styles.weightComparison}>
          <View style={styles.weightItem}>
            <Text style={styles.weightItemLabel}>Current</Text>
            <Text style={styles.weightItemValue}>{displayCurrent}</Text>
            <Text style={styles.weightItemUnit}>{unit}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.weightItem}>
            <Text style={styles.weightItemLabel}>Goal</Text>
            <Animated.Text style={[styles.goalValue, { transform: [{ scale: scaleAnim }] }]}>
              {displayTarget}
            </Animated.Text>
            <Text style={styles.weightItemUnit}>{unit}</Text>
          </View>
        </View>

        <Text style={[styles.diffLabel, { color: getDiffColor() }]}>
          {getDiffLabel()}
        </Text>

        <Slider
          style={styles.slider}
          minimumValue={unitSystem === 'imperial' ? 66 : 30}
          maximumValue={unitSystem === 'imperial' ? 440 : 200}
          value={displayTarget}
          onValueChange={onSliderChange}
          minimumTrackTintColor={C.accent}
          maximumTrackTintColor={C.border}
          thumbTintColor={C.accent}
          step={1}
        />
        <View style={styles.rangeRow}>
          <Text style={styles.rangeText}>{unitSystem === 'imperial' ? '66 lbs' : '30 kg'}</Text>
          <Text style={styles.rangeText}>{unitSystem === 'imperial' ? '440 lbs' : '200 kg'}</Text>
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 24, paddingTop: 12 },
  backBtn: { marginBottom: 8 },
  backText: { color: C.accent, fontSize: 15, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16,
    color: C.textSub,
    lineHeight: 23,
    marginBottom: 32,
  },
  weightComparison: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 12,
  },
  weightItem: { alignItems: 'center', gap: 4 },
  weightItemLabel: { fontSize: 13, color: C.textSub, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  weightItemValue: { fontSize: 40, fontWeight: '700', color: C.textSub },
  goalValue: { fontSize: 56, fontWeight: '800', color: C.accent, letterSpacing: -1 },
  weightItemUnit: { fontSize: 16, color: C.textSub, fontWeight: '600' },
  arrow: { fontSize: 24, color: C.textTertiary, marginBottom: 16 },
  diffLabel: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 32,
  },
  slider: { width: '100%', height: 40, marginBottom: 8 },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  rangeText: { fontSize: 13, color: C.textTertiary },
  continueBtn: {
    backgroundColor: C.accent,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueBtnText: { color: '#0A0A0C', fontSize: 17, fontWeight: '700' },
});
