import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  accentBg: 'rgba(0,230,118,0.10)',
  border: 'rgba(255,255,255,0.08)',
  accentBorder: 'rgba(0,230,118,0.18)',
};

const PLAN_ITEMS = [
  {
    icon: 'flame-outline' as const,
    title: 'Your daily calorie target',
    desc: 'Calculated from your body weight, height, age, and activity level using Mifflin-St Jeor.',
  },
  {
    icon: 'stats-chart-outline' as const,
    title: 'Macro breakdown by gram',
    desc: 'Protein, carbs, and fat targets tailored to your goal — not a one-size-fits-all split.',
  },
  {
    icon: 'calendar-outline' as const,
    title: 'Weekly progress check-in',
    desc: 'Your targets adapt as your body changes. Consistent logging compounds over time.',
  },
];

export default function SocialProof2Screen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 45, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textSub} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <BlueprintProgress progress={0.84} />
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
      >
        <Animated.View style={{ transform: [{ translateY: slideUp }] }}>
          <Text style={styles.title}>Your plan is already{'\n'}taking shape.</Text>
          <Text style={styles.subtitle}>
            Here's what your personalised plan includes — calculated from your answers.
          </Text>

          {PLAN_ITEMS.map((item) => (
            <View key={item.icon} style={styles.itemCard}>
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={20} color={C.accent} />
              </View>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}

          <View style={styles.scienceCard}>
            <View style={styles.scienceHeader}>
              <Ionicons name="ribbon-outline" size={18} color={C.accent} />
              <Text style={styles.scienceTitle}>Built on peer-reviewed metabolic research</Text>
            </View>
            <Text style={styles.scienceText}>
              Macra's calorie and macro calculations use the{' '}
              <Text style={styles.scienceBold}>Mifflin-St Jeor equation</Text> — the gold standard
              used by registered dietitians worldwide.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => navigation.navigate('CoachingStyle' as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#0A0A0C" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    marginBottom: 4,
    gap: 8,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { color: C.textSub, fontSize: 15, fontWeight: '500' },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: C.textSub,
    lineHeight: 23,
    marginBottom: 28,
  },
  itemCard: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.accentBg,
    borderWidth: 1,
    borderColor: C.accentBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 4 },
  itemDesc: { fontSize: 14, color: C.textSub, lineHeight: 20 },
  scienceCard: {
    backgroundColor: C.elevated,
    borderRadius: 14,
    padding: 18,
    marginTop: 8,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: C.border,
  },
  scienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  scienceTitle: { fontSize: 14, fontWeight: '700', color: C.text, flex: 1 },
  scienceText: { fontSize: 14, color: C.textSub, lineHeight: 21 },
  scienceBold: { color: C.text, fontWeight: '600' },
  continueBtn: {
    backgroundColor: C.accent,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  continueBtnText: { color: '#0A0A0C', fontSize: 17, fontWeight: '700' },
});
