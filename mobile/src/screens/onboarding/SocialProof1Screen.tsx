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

const CAPABILITIES = [
  {
    icon: 'camera-outline' as const,
    title: 'Photo logging',
    desc: 'Point your camera at any meal. AI identifies every ingredient and calculates macros in seconds.',
  },
  {
    icon: 'mic-outline' as const,
    title: 'Voice logging',
    desc: 'Say what you ate. "Two eggs, whole wheat toast, black coffee" — logged and calculated.',
  },
  {
    icon: 'barcode-outline' as const,
    title: 'Barcode scan',
    desc: 'Scan any packaged food. Macros pulled directly from the nutrition label.',
  },
];

export default function SocialProof1Screen() {
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
        <BlueprintProgress progress={0.49} />
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
      >
        <Animated.View style={{ transform: [{ translateY: slideUp }] }}>
          <Text style={styles.title}>Built for people with{'\n'}no time to think about it.</Text>
          <Text style={styles.subtitle}>
            Three ways to log a meal. All under 10 seconds.
          </Text>

          {CAPABILITIES.map((cap) => (
            <View key={cap.icon} style={styles.capCard}>
              <View style={styles.capIconWrap}>
                <Ionicons name={cap.icon} size={22} color={C.accent} />
              </View>
              <View style={styles.capText}>
                <Text style={styles.capTitle}>{cap.title}</Text>
                <Text style={styles.capDesc}>{cap.desc}</Text>
              </View>
            </View>
          ))}

          <View style={styles.scienceCard}>
            <View style={styles.scienceHeader}>
              <Ionicons name="flash-outline" size={18} color={C.accent} />
              <Text style={styles.scienceTitle}>No manual searching required</Text>
            </View>
            <Text style={styles.scienceText}>
              Our AI food database covers over{' '}
              <Text style={styles.scienceBold}>1 million foods</Text> — including restaurant
              meals, home cooking, and packaged products from 50+ countries.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => navigation.navigate('ActivityLevel' as never)}
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
  capCard: {
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
  capIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.accentBg,
    borderWidth: 1,
    borderColor: C.accentBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capText: { flex: 1 },
  capTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 4 },
  capDesc: { fontSize: 14, color: C.textSub, lineHeight: 20 },
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
  scienceTitle: { fontSize: 14, fontWeight: '700', color: C.text },
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
