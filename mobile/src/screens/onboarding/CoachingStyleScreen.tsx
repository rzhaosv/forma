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
import { useOnboardingStore, CoachingStyle } from '../../store/useOnboardingStore';
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

const OPTIONS: {
  value: CoachingStyle;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
}[] = [
  {
    value: 'guided',
    icon: 'compass',
    title: 'Guided',
    subtitle: "Tell me exactly what to eat and when",
    color: '#00E676',
  },
  {
    value: 'collaborative',
    icon: 'people',
    title: 'Collaborative',
    subtitle: "Show me options and let me decide",
    color: '#00B0FF',
  },
  {
    value: 'independent',
    icon: 'analytics',
    title: 'Independent',
    subtitle: "Give me the data, I'll take it from there",
    color: '#FF6D00',
  },
];

export default function CoachingStyleScreen() {
  const navigation = useNavigation();
  const { updateData } = useOnboardingStore();
  const [selected, setSelected] = useState<CoachingStyle | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    updateData({ coachingStyle: selected });
    navigation.navigate('LaborIllusion' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <BlueprintProgress progress={0.91} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>How do you want to be coached?</Text>
        <Text style={styles.subtitle}>
          NutriSnap adapts to your style — not the other way around.
        </Text>

        <View style={styles.cards}>
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.card,
                  isSelected && { borderColor: opt.color, backgroundColor: opt.color + '12' },
                ]}
                onPress={() => setSelected(opt.value)}
                activeOpacity={0.75}
              >
                <View style={[styles.iconBox, { backgroundColor: opt.color + '18' }]}>
                  <Ionicons name={opt.icon as any} size={26} color={isSelected ? opt.color : C.textSub} />
                </View>
                <View style={styles.cardText}>
                  <Text style={[styles.cardTitle, isSelected && { color: opt.color }]}>
                    {opt.title}
                  </Text>
                  <Text style={styles.cardSubtitle}>{opt.subtitle}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.check, { backgroundColor: opt.color }]}>
                    <Ionicons name="checkmark" size={15} color="#0A0A0C" />
                  </View>
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
          <Text style={styles.continueBtnText}>Build My Plan</Text>
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
  cards: { gap: 14, marginBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    gap: 16,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: C.textSub, lineHeight: 20 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtn: {
    backgroundColor: C.accent,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { color: '#0A0A0C', fontSize: 17, fontWeight: '700' },
});
