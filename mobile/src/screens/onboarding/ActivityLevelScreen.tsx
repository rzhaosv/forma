import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore, ActivityLevel } from '../../store/useOnboardingStore';
import BlueprintProgress from '../../components/BlueprintProgress';
import { Ionicons } from '@expo/vector-icons';

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

const ACTIVITY_LEVELS: {
  value: ActivityLevel;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  {
    value: 'sedentary',
    label: 'Desk-bound',
    description: 'Mostly sitting, little movement outside work',
    icon: 'laptop-outline',
    color: '#A0A0B0',
  },
  {
    value: 'light',
    label: 'Light mover',
    description: 'Walking 1–3× per week, casual movement',
    icon: 'walk-outline',
    color: '#40C4FF',
  },
  {
    value: 'moderate',
    label: 'Consistently active',
    description: 'Exercise 3–5× per week, gym or cardio',
    icon: 'bicycle-outline',
    color: '#00E676',
  },
  {
    value: 'active',
    label: 'High performer',
    description: 'Intense training 6–7× per week',
    icon: 'barbell-outline',
    color: '#F59E0B',
  },
  {
    value: 'very_active',
    label: 'Athlete mode',
    description: 'Multiple sessions daily or physical job',
    icon: 'flame-outline',
    color: '#EF4444',
  },
];

export default function ActivityLevelScreen() {
  const navigation = useNavigation();
  const { data, updateData } = useOnboardingStore();
  const [selectedLevel, setSelectedLevel] = useState<ActivityLevel | undefined>(data.activityLevel);

  const handleContinue = () => {
    if (!selectedLevel) return;
    updateData({ activityLevel: selectedLevel });

    const routes = navigation.getState?.()?.routes || [];
    const isProfileCompletion = routes.some(r => r.name === 'ProfileCompletion');

    if (isProfileCompletion) {
      navigation.navigate('ProfileComplete' as never);
    } else {
      navigation.navigate('TimeAvailable' as never);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={C.textSub} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <BlueprintProgress progress={0.56} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>How active are you?</Text>
        <Text style={styles.subtitle}>
          Be honest — we'll calibrate your calorie burn accordingly.
        </Text>

        <View style={styles.cards}>
          {ACTIVITY_LEVELS.map((level) => {
            const isSelected = selectedLevel === level.value;
            return (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.card,
                  isSelected && { borderColor: level.color, backgroundColor: level.color + '12' },
                ]}
                onPress={() => setSelectedLevel(level.value)}
                activeOpacity={0.75}
              >
                <View style={[styles.iconBox, { backgroundColor: level.color + '18' }]}>
                  <Ionicons
                    name={level.icon}
                    size={24}
                    color={isSelected ? level.color : C.textSub}
                  />
                </View>
                <View style={styles.cardText}>
                  <Text style={[styles.cardTitle, isSelected && { color: level.color }]}>
                    {level.label}
                  </Text>
                  <Text style={styles.cardSubtitle}>{level.description}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkBox, { backgroundColor: level.color }]}>
                    <Ionicons name="checkmark" size={14} color="#0A0A0C" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, !selectedLevel && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selectedLevel}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  back: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 4 },
  backText: { fontSize: 15, color: C.textSub, fontWeight: '500' },
  scroll: { padding: 24, paddingTop: 8 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: C.textSub,
    lineHeight: 23,
    marginBottom: 28,
  },
  cards: { gap: 10, marginBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    gap: 14,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 3,
  },
  cardSubtitle: { fontSize: 13, color: C.textSub, lineHeight: 18 },
  checkBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtn: {
    backgroundColor: C.accent,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueBtnDisabled: { opacity: 0.35 },
  continueBtnText: { color: '#0A0A0C', fontSize: 17, fontWeight: '700' },
});
