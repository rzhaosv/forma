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
import { useOnboardingStore, TimeAvailable } from '../../store/useOnboardingStore';
import { Ionicons } from '@expo/vector-icons';
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

const OPTIONS: { value: TimeAvailable; label: string; sublabel: string; icon: string }[] = [
  { value: '15', label: '15 minutes', sublabel: 'Quick logging, high portability', icon: 'flash' },
  { value: '30', label: '30 minutes', sublabel: 'Full tracking with meal planning', icon: 'time' },
  { value: '45', label: '45 minutes', sublabel: 'Detailed insights and coaching', icon: 'analytics' },
  { value: '60+', label: '60+ minutes', sublabel: 'Deep dive — everything NutriSnap offers', icon: 'trending-up' },
];

export default function TimeAvailableScreen() {
  const navigation = useNavigation();
  const { updateData } = useOnboardingStore();
  const [selected, setSelected] = useState<TimeAvailable | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    updateData({ timeAvailable: selected });
    navigation.navigate('DietaryPrefs' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <BlueprintProgress progress={0.63} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>How much time can you realistically dedicate daily?</Text>
        <Text style={styles.subtitle}>
          Let's build a plan that works with your schedule, not against it.
        </Text>

        <View style={styles.cards}>
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.card,
                  isSelected && { borderColor: C.accent, backgroundColor: 'rgba(0,230,118,0.10)' },
                ]}
                onPress={() => setSelected(opt.value)}
                activeOpacity={0.75}
              >
                <View style={[styles.iconBox, isSelected && { backgroundColor: 'rgba(0,230,118,0.18)' }]}>
                  <Ionicons name={opt.icon as any} size={24} color={isSelected ? C.accent : C.textSub} />
                </View>
                <View style={styles.cardText}>
                  <Text style={[styles.cardLabel, isSelected && { color: C.accent }]}>{opt.label}</Text>
                  <Text style={styles.cardSub}>{opt.sublabel}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={C.accent} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 24, paddingTop: 12 },
  backBtn: { marginBottom: 8 },
  backText: { color: C.accent, fontSize: 15, fontWeight: '600' },
  scroll: { padding: 24, paddingTop: 8 },
  title: {
    fontSize: 26,
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
  cards: { gap: 12, marginBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: C.border,
    gap: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 3 },
  cardSub: { fontSize: 13, color: C.textSub },
  continueBtn: {
    backgroundColor: C.accent,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { color: '#0A0A0C', fontSize: 17, fontWeight: '700' },
});
