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
  textTertiary: '#6B6B80',
  accent: '#00E676',
  border: 'rgba(255,255,255,0.08)',
};

const OPTIONS = [
  { id: 'none', label: 'No restrictions', icon: 'checkmark-circle', color: '#00E676' },
  { id: 'vegetarian', label: 'Vegetarian', icon: 'leaf', color: '#4CAF50' },
  { id: 'vegan', label: 'Vegan', icon: 'flower', color: '#8BC34A' },
  { id: 'gluten_free', label: 'Gluten-Free', icon: 'cut', color: '#FF9800' },
  { id: 'keto', label: 'Keto / Low-Carb', icon: 'flame', color: '#FF5722' },
  { id: 'paleo', label: 'Paleo', icon: 'nutrition', color: '#795548' },
];

export default function DietaryPrefsScreen() {
  const navigation = useNavigation();
  const { updateData } = useOnboardingStore();
  const [selected, setSelected] = useState<string[]>(['none']);

  const toggle = (id: string) => {
    if (id === 'none') {
      setSelected(['none']);
      return;
    }
    setSelected((prev) => {
      const without = prev.filter(s => s !== 'none');
      return without.includes(id)
        ? without.filter(s => s !== id) || ['none']
        : [...without, id];
    });
  };

  const handleContinue = () => {
    updateData({ dietaryPrefs: selected });
    navigation.navigate('Obstacles' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <BlueprintProgress progress={0.70} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Any dietary preferences?</Text>
        <Text style={styles.subtitle}>
          Your lifestyle data helps us customize your plan. Select all that apply.
        </Text>

        <View style={styles.grid}>
          {OPTIONS.map((opt) => {
            const isSelected = selected.includes(opt.id);
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.chip,
                  isSelected && { borderColor: opt.color, backgroundColor: opt.color + '15' },
                ]}
                onPress={() => toggle(opt.id)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={18}
                  color={isSelected ? opt.color : C.textSub}
                />
                <Text style={[styles.chipText, isSelected && { color: opt.color }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 36,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    minWidth: '45%',
  },
  chipText: { fontSize: 15, fontWeight: '600', color: C.text },
  continueBtn: {
    backgroundColor: C.accent,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueBtnText: { color: '#0A0A0C', fontSize: 17, fontWeight: '700' },
});
