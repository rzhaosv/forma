import React, { useEffect, useRef } from 'react';
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
};

export default function SocialProof1Screen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const countAnim = useRef(new Animated.Value(0)).current;
  const [displayCount, setDisplayCount] = React.useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
    ]).start();

    // Count up to 47,392
    const target = 47392;
    const duration = 1200;
    const steps = 50;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayCount(target);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <BlueprintProgress progress={0.49} />
      </View>

      <Animated.View
        style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideUp }] }]}
      >
        {/* Count */}
        <View style={styles.countSection}>
          <Text style={styles.countNumber}>{displayCount.toLocaleString()}</Text>
          <Text style={styles.countLabel}>professionals trust NutriSnap</Text>
          <View style={styles.stars}>
            {[1,2,3,4,5].map(s => (
              <Ionicons key={s} name="star" size={20} color="#FCD34D" />
            ))}
            <Text style={styles.ratingText}>4.8 · 23,000+ ratings</Text>
          </View>
        </View>

        {/* Feature pills */}
        <View style={styles.pillsRow}>
          {['30-sec logging', 'AI food scan', 'Smart macros'].map((pill) => (
            <View key={pill} style={styles.pill}>
              <Ionicons name="checkmark-circle" size={14} color={C.accent} />
              <Text style={styles.pillText}>{pill}</Text>
            </View>
          ))}
        </View>

        {/* Testimonial */}
        <View style={styles.testimonialCard}>
          <Text style={styles.quoteChar}>"</Text>
          <Text style={styles.testimonialText}>
            Not having to deal with the hurdles of logging or awkwardly fiddling on my phone for 10 minutes while out with friends.
          </Text>
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.avatarInitial}>J</Text>
            </View>
            <View>
              <Text style={styles.authorName}>James R.</Text>
              <Text style={styles.authorRole}>Marketing Director, 33</Text>
            </View>
          </View>
        </View>

        {/* Science card */}
        <View style={styles.scienceCard}>
          <Ionicons name="bulb" size={20} color={C.accent} style={{ marginBottom: 8 }} />
          <Text style={styles.scienceTitle}>Did you know?</Text>
          <Text style={styles.scienceText}>
            Studies show that tracking meals increases weight loss success by <Text style={styles.scienceBold}>2×</Text>. That's why we built NutriSnap's 30-second logging feature.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate('ActivityLevel' as never)}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Continue Building My Plan</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 24, paddingTop: 12 },
  backBtn: { marginBottom: 8 },
  backText: { color: C.accent, fontSize: 15, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  countSection: { alignItems: 'center', marginBottom: 24 },
  countNumber: {
    fontSize: 60,
    fontWeight: '800',
    color: C.accent,
    letterSpacing: -2,
  },
  countLabel: {
    fontSize: 17,
    color: C.textSub,
    marginBottom: 12,
    fontWeight: '500',
  },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, color: C.textSub, marginLeft: 4 },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.accentBg,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.2)',
  },
  pillText: { fontSize: 13, color: C.accent, fontWeight: '600' },
  testimonialCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  quoteChar: {
    fontSize: 40,
    color: C.accent,
    fontWeight: '800',
    lineHeight: 40,
    marginBottom: 4,
  },
  testimonialText: {
    fontSize: 15,
    color: C.text,
    lineHeight: 23,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.accentBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.3)',
  },
  avatarInitial: { color: C.accent, fontWeight: '700', fontSize: 15 },
  authorName: { fontSize: 14, fontWeight: '700', color: C.text },
  authorRole: { fontSize: 12, color: C.textSub },
  scienceCard: {
    backgroundColor: C.accentBg,
    borderRadius: 14,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.2)',
  },
  scienceTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 6 },
  scienceText: { fontSize: 14, color: C.textSub, lineHeight: 21 },
  scienceBold: { color: C.accent, fontWeight: '700' },
  continueBtn: {
    backgroundColor: C.accent,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueBtnText: { color: '#0A0A0C', fontSize: 17, fontWeight: '700' },
});
