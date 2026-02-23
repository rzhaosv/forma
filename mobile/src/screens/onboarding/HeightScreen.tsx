import React, { useState, useRef, useEffect } from 'react';
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
import { cmToInches, inchesToCm } from '../../utils/unitSystem';

const C = {
  bg: '#0A0A0C',
  surface: '#1A1A1E',
  text: '#F0F0F5',
  textSub: '#A0A0B0',
  textTertiary: '#6B6B80',
  accent: '#00E676',
  border: 'rgba(255,255,255,0.08)',
};

export default function HeightScreen() {
  const navigation = useNavigation();
  const { data, updateData } = useOnboardingStore();
  const { unitSystem, setUnitSystem } = useUnitSystemStore();

  const [height_cm, setHeightCm] = useState(data.height_cm || 175);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const displayHeight = unitSystem === 'imperial' ? cmToInches(height_cm) : height_cm;

  const getHeightLabel = () => {
    if (unitSystem === 'imperial') {
      const feet = Math.floor(displayHeight / 12);
      const inches = Math.round(displayHeight % 12);
      return `${feet}' ${inches}"`;
    }
    return `${Math.round(height_cm)} cm`;
  };

  const onSliderChange = (value: number) => {
    const rounded = Math.round(value);
    const newCm = unitSystem === 'imperial' ? inchesToCm(rounded) : rounded;
    setHeightCm(newCm);

    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.06, tension: 150, friction: 4, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 150, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handleContinue = () => {
    updateData({ height_cm, unitSystem });
    navigation.navigate('CurrentWeight' as never);
  };

  const toggleUnit = () => {
    const next = unitSystem === 'metric' ? 'imperial' : 'metric';
    setUnitSystem(next);
    updateData({ unitSystem: next });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <BlueprintProgress progress={0.21} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>How tall are you?</Text>
        <Text style={styles.subtitle}>
          Your height helps us calculate your precise calorie needs.
        </Text>

        {/* Unit toggle */}
        <View style={styles.unitToggle}>
          <TouchableOpacity
            style={[styles.unitBtn, unitSystem === 'metric' && styles.unitBtnActive]}
            onPress={() => unitSystem !== 'metric' && toggleUnit()}
          >
            <Text style={[styles.unitBtnText, unitSystem === 'metric' && styles.unitBtnTextActive]}>
              cm
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitBtn, unitSystem === 'imperial' && styles.unitBtnActive]}
            onPress={() => unitSystem !== 'imperial' && toggleUnit()}
          >
            <Text style={[styles.unitBtnText, unitSystem === 'imperial' && styles.unitBtnTextActive]}>
              ft / in
            </Text>
          </TouchableOpacity>
        </View>

        {/* Value display */}
        <View style={styles.valueSection}>
          <Animated.Text style={[styles.bigValue, { transform: [{ scale: scaleAnim }] }]}>
            {getHeightLabel()}
          </Animated.Text>

          <Slider
            style={styles.slider}
            minimumValue={unitSystem === 'imperial' ? 48 : 120}
            maximumValue={unitSystem === 'imperial' ? 96 : 220}
            value={displayHeight}
            onValueChange={onSliderChange}
            minimumTrackTintColor={C.accent}
            maximumTrackTintColor={C.border}
            thumbTintColor={C.accent}
            step={1}
          />
          <View style={styles.rangeRow}>
            <Text style={styles.rangeText}>{unitSystem === 'imperial' ? "4' 0\"" : '120 cm'}</Text>
            <Text style={styles.rangeText}>{unitSystem === 'imperial' ? "8' 0\"" : '220 cm'}</Text>
          </View>
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
    marginBottom: 28,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: C.border,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  unitBtnActive: {
    backgroundColor: C.accent,
  },
  unitBtnText: { fontSize: 15, fontWeight: '600', color: C.textSub },
  unitBtnTextActive: { color: '#0A0A0C' },
  valueSection: { alignItems: 'center', marginBottom: 40 },
  bigValue: {
    fontSize: 64,
    fontWeight: '800',
    color: C.text,
    marginBottom: 32,
    letterSpacing: -1,
  },
  slider: { width: '100%', height: 40 },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  rangeText: { fontSize: 13, color: C.textTertiary },
  continueBtn: {
    backgroundColor: C.accent,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  },
  continueBtnText: { color: '#0A0A0C', fontSize: 17, fontWeight: '700' },
});
