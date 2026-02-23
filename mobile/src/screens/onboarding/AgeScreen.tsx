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
import Slider from '@react-native-community/slider';
import BlueprintProgress from '../../components/BlueprintProgress';

const C = {
  bg: '#0A0A0C',
  surface: '#1A1A1E',
  text: '#F0F0F5',
  textSub: '#A0A0B0',
  textTertiary: '#6B6B80',
  accent: '#00E676',
  border: 'rgba(255,255,255,0.08)',
};

export default function AgeScreen() {
  const navigation = useNavigation();
  const { data, updateData } = useOnboardingStore();

  const [age, setAge] = useState(data.age || 28);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onSliderChange = (value: number) => {
    const rounded = Math.round(value);
    setAge(rounded);

    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.06, tension: 150, friction: 4, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 150, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handleContinue = () => {
    updateData({ age });
    navigation.navigate('SocialProof1' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <BlueprintProgress progress={0.42} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>How old are you?</Text>
        <Text style={styles.subtitle}>
          Age affects your metabolism and calorie needs — this makes your plan accurate.
        </Text>

        <View style={styles.valueSection}>
          <View style={styles.valueRow}>
            <Animated.Text style={[styles.bigValue, { transform: [{ scale: scaleAnim }] }]}>
              {age}
            </Animated.Text>
            <Text style={styles.unit}>years</Text>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={16}
            maximumValue={80}
            value={age}
            onValueChange={onSliderChange}
            minimumTrackTintColor={C.accent}
            maximumTrackTintColor={C.border}
            thumbTintColor={C.accent}
            step={1}
          />
          <View style={styles.rangeRow}>
            <Text style={styles.rangeText}>16</Text>
            <Text style={styles.rangeText}>80</Text>
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
    marginBottom: 40,
  },
  valueSection: { alignItems: 'center', marginBottom: 48 },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 32,
    gap: 10,
  },
  bigValue: {
    fontSize: 88,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -3,
  },
  unit: {
    fontSize: 22,
    fontWeight: '600',
    color: C.textSub,
    marginBottom: 16,
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
