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
  text: '#F0F0F5',
  textSub: '#A0A0B0',
  textTertiary: '#6B6B80',
  accent: '#00E676',
  accentBg: 'rgba(0,230,118,0.10)',
  border: 'rgba(255,255,255,0.08)',
};

const TESTIMONIALS = [
  {
    quote: "Down 12 lbs in 10 weeks while working 60-hour weeks. Finally something that fits my life.",
    name: "Mark T.",
    role: "Product Manager, 31",
    initial: "M",
    result: "–12 lbs in 10 weeks",
  },
  {
    quote: "The macro tracking takes 30 seconds per meal. I've never stuck with an app longer than 2 weeks before this.",
    name: "Priya S.",
    role: "Financial Analyst, 28",
    initial: "P",
    result: "Consistent for 6 months",
  },
  {
    quote: "Lost 8% body fat in 12 weeks without changing my workout. Just dialed in my nutrition.",
    name: "Chris W.",
    role: "Software Engineer, 35",
    initial: "C",
    result: "–8% body fat",
  },
];

export default function SocialProof2Screen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <BlueprintProgress progress={0.84} />
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
      >
        <Text style={styles.title}>You're in good company.</Text>
        <Text style={styles.subtitle}>
          Real results from professionals just like you.
        </Text>

        {TESTIMONIALS.map((t, i) => (
          <View key={i} style={styles.testimonialCard}>
            <View style={styles.resultBadge}>
              <Text style={styles.resultText}>{t.result}</Text>
            </View>
            <Text style={styles.quote}>"{t.quote}"</Text>
            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{t.initial}</Text>
              </View>
              <View>
                <Text style={styles.authorName}>{t.name}</Text>
                <Text style={styles.authorRole}>{t.role}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Science credibility */}
        <View style={styles.scienceCard}>
          <View style={styles.scienceHeader}>
            <Ionicons name="ribbon" size={18} color={C.accent} />
            <Text style={styles.scienceTitle}>Built on peer-reviewed metabolic research</Text>
          </View>
          <Text style={styles.scienceText}>
            NutriSnap's calorie and macro calculations use the Mifflin-St Jeor equation — the gold standard used by registered dietitians worldwide.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate('CoachingStyle' as never)}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 24, paddingTop: 12 },
  backBtn: { marginBottom: 8 },
  backText: { color: C.accent, fontSize: 15, fontWeight: '600' },
  scroll: { padding: 24, paddingTop: 8, paddingBottom: 32 },
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
    marginBottom: 24,
  },
  testimonialCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  resultBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.accentBg,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.2)',
  },
  resultText: { fontSize: 13, fontWeight: '700', color: C.accent },
  quote: {
    fontSize: 15,
    color: C.text,
    lineHeight: 23,
    fontStyle: 'italic',
    marginBottom: 14,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.accentBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.2)',
  },
  avatarText: { color: C.accent, fontWeight: '700', fontSize: 13 },
  authorName: { fontSize: 14, fontWeight: '700', color: C.text },
  authorRole: { fontSize: 12, color: C.textSub },
  scienceCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 18,
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
  continueBtn: {
    backgroundColor: C.accent,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueBtnText: { color: '#0A0A0C', fontSize: 17, fontWeight: '700' },
});
