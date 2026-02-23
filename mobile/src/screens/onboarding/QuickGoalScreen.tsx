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
import { useOnboardingStore, PrimaryGoal } from '../../store/useOnboardingStore';
import { Ionicons } from '@expo/vector-icons';
import BlueprintProgress from '../../components/BlueprintProgress';

const C = {
  bg: '#0A0A0C',
  surface: '#1A1A1E',
  elevated: '#222228',
  text: '#F0F0F5',
  textSub: '#A0A0B0',
  textTertiary: '#6B6B80',
  accent: '#00E676',
  accentBg: 'rgba(0,230,118,0.12)',
  border: 'rgba(255,255,255,0.08)',
};

const GOALS: {
  value: PrimaryGoal;
  weightGoal: 'lose' | 'maintain' | 'gain';
  icon: string;
  title: string;
  subtitle: string;
  color: string;
}[] = [
  {
    value: 'lean_physique',
    weightGoal: 'lose',
    icon: 'body',
    title: 'Lean Physique',
    subtitle: 'Burn fat, reveal definition',
    color: '#00E676',
  },
  {
    value: 'muscle_gain',
    weightGoal: 'gain',
    icon: 'barbell',
    title: 'Muscle Gain',
    subtitle: 'Build size and strength',
    color: '#00B0FF',
  },
  {
    value: 'fat_loss',
    weightGoal: 'lose',
    icon: 'trending-down',
    title: 'Fat Loss',
    subtitle: 'Lose weight, feel lighter',
    color: '#FF6D00',
  },
  {
    value: 'recomposition',
    weightGoal: 'maintain',
    icon: 'sync',
    title: 'Body Recomposition',
    subtitle: 'Lose fat and gain muscle simultaneously',
    color: '#AA00FF',
  },
];

export default function QuickGoalScreen() {
  const navigation = useNavigation();
  const { updateData } = useOnboardingStore();
  const [selected, setSelected] = useState<PrimaryGoal | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    const goal = GOALS.find(g => g.value === selected)!;
    updateData({ primaryGoal: selected, weightGoal: goal.weightGoal });
    navigation.navigate('Height' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <BlueprintProgress progress={0.14} />

        <Text style={styles.title}>What's your primary goal?</Text>
        <Text style={styles.subtitle}>
          We'll build your nutrition plan around it.
        </Text>

        <View style={styles.cards}>
          {GOALS.map((goal) => {
            const isSelected = selected === goal.value;
            return (
              <TouchableOpacity
                key={goal.value}
                style={[
                  styles.card,
                  isSelected && { borderColor: goal.color, backgroundColor: goal.color + '12' },
                ]}
                onPress={() => setSelected(goal.value)}
                activeOpacity={0.75}
              >
                <View style={[styles.iconBox, { backgroundColor: goal.color + '18' }]}>
                  <Ionicons name={goal.icon as any} size={26} color={isSelected ? goal.color : C.textSub} />
                </View>
                <View style={styles.cardText}>
                  <Text style={[styles.cardTitle, isSelected && { color: goal.color }]}>
                    {goal.title}
                  </Text>
                  <Text style={styles.cardSubtitle}>{goal.subtitle}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkBox, { backgroundColor: goal.color }]}>
                    <Ionicons name="checkmark" size={16} color="#0A0A0C" />
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
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 24, paddingTop: 16 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    marginTop: 20,
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
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 14,
    color: C.textSub,
  },
  checkBox: {
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
  continueBtnText: {
    color: '#0A0A0C',
    fontSize: 17,
    fontWeight: '700',
  },
});
