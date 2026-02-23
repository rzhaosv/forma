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
  border: 'rgba(255,255,255,0.08)',
};

export default function CurrentWeightScreen() {
  const navigation = useNavigation();
  const { data, updateData } = useOnboardingStore();
  const { unitSystem } = useUnitSystemStore();

  const [weight_kg, setWeightKg] = useState(data.weight_kg || 75);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const displayWeight = unitSystem === 'imperial' ? kgToLbs(weight_kg) : Math.round(weight_kg);
  const unit = unitSystem === 'imperial' ? 'lbs' : 'kg';

  const onSliderChange = (value: number) => {
    const rounded = Math.round(value);
    const kg = unitSystem === 'imperial' ? lbsToKg(rounded) : rounded;
    setWeightKg(kg);

    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.06, tension: 150, friction: 4, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 150, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handleContinue = () => {
    updateData({ weight_kg });
    navigation.navigate('GoalWeight' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <BlueprintProgress progress={0.28} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>What's your current weight?</Text>
        <Text style={styles.subtitle}>
          Thank you for sharing — that takes real commitment.
        </Text>

        <View style={styles.valueSection}>
          <View style={styles.valueRow}>
            <Animated.Text style={[styles.bigValue, { transform: [{ scale: scaleAnim }] }]}>
              {displayWeight}
            </Animated.Text>
            <Text style={styles.unit}>{unit}</Text>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={unitSystem === 'imperial' ? 66 : 30}
            maximumValue={unitSystem === 'imperial' ? 440 : 200}
            value={displayWeight}
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
        </View>

        <View style={styles.encouragementCard}>
          <Text style={styles.encouragementText}>
            Here's the good news: your goals are 100% achievable. We've seen it thousands of times.
          </Text>
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
    marginBottom: 40,
  },
  valueSection: { alignItems: 'center', marginBottom: 32 },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 32,
    gap: 8,
  },
  bigValue: {
    fontSize: 72,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -2,
  },
  unit: {
    fontSize: 22,
    fontWeight: '600',
    color: C.textSub,
    marginBottom: 12,
  },
  slider: { width: '100%', height: 40 },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  rangeText: { fontSize: 13, color: C.textTertiary },
  encouragementCard: {
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 32,
  },
  encouragementText: {
    fontSize: 15,
    color: C.textSub,
    lineHeight: 23,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  continueBtn: {
    backgroundColor: C.accent,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueBtnText: { color: '#0A0A0C', fontSize: 17, fontWeight: '700' },
});
