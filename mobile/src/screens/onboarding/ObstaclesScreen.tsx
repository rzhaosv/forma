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
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Ionicons } from '@expo/vector-icons';
import BlueprintProgress from '../../components/BlueprintProgress';

const C = {
  bg: '#0A0A0C',
  surface: '#1A1A1E',
  text: '#F0F0F5',
  textSub: '#A0A0B0',
  accent: '#00E676',
  border: 'rgba(255,255,255,0.08)',
};

const OPTIONS = [
  {
    id: 'time',
    icon: 'time',
    label: "Not enough time",
    sublabel: "Too busy to log every meal",
    color: '#00B0FF',
  },
  {
    id: 'knowledge',
    icon: 'school',
    label: "Didn't know what to eat",
    sublabel: "Confused by macros and portions",
    color: '#AA00FF',
  },
  {
    id: 'consistency',
    icon: 'refresh',
    label: "Couldn't stay consistent",
    sublabel: "Started strong, then fell off",
    color: '#FF6D00',
  },
  {
    id: 'motivation',
    icon: 'heart',
    label: "Lost motivation",
    sublabel: "Stopped seeing progress and gave up",
    color: '#EF4444',
  },
];

export default function ObstaclesScreen() {
  const navigation = useNavigation();
  const { updateData } = useOnboardingStore();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    updateData({ obstacles: selected.length > 0 ? selected : ['none'] });
    navigation.navigate('SocialProof2' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <BlueprintProgress progress={0.77} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What's held you back in the past?</Text>
        <Text style={styles.subtitle}>
          Be honest — this helps us build something that actually sticks. Select all that apply.
        </Text>

        <View style={styles.cards}>
          {OPTIONS.map((opt) => {
            const isSelected = selected.includes(opt.id);
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.card,
                  isSelected && { borderColor: opt.color, backgroundColor: opt.color + '12' },
                ]}
                onPress={() => toggle(opt.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.iconBox, { backgroundColor: opt.color + '18' }]}>
                  <Ionicons name={opt.icon as any} size={22} color={isSelected ? opt.color : C.textSub} />
                </View>
                <View style={styles.cardText}>
                  <Text style={[styles.cardLabel, isSelected && { color: opt.color }]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.cardSub}>{opt.sublabel}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color={opt.color} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => {
            updateData({ obstacles: [] });
            navigation.navigate('SocialProof2' as never);
          }}
        >
          <Text style={styles.skipText}>Skip this step</Text>
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
  cards: { gap: 12, marginBottom: 28 },
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 3 },
  cardSub: { fontSize: 13, color: C.textSub },
  continueBtn: {
    backgroundColor: C.accent,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueBtnText: { color: '#0A0A0C', fontSize: 17, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontSize: 14, color: C.textSub, fontWeight: '500' },
});
