import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithGoogle, signInWithApple } from '../services/authService';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const C = {
  bg: '#0A0A0C',
  surface: '#141418',
  elevated: '#1C1C22',
  text: '#F0F0F5',
  textSub: '#A0A0B0',
  textTertiary: '#6B6B80',
  accent: '#00E676',
  accentDim: 'rgba(0,230,118,0.10)',
  accentBorder: 'rgba(0,230,118,0.22)',
  border: 'rgba(255,255,255,0.07)',
  gold: '#F59E0B',
};

const TESTIMONIALS = [
  {
    text: "I log meals in under 30 seconds now. Nothing else I've tried comes close.",
    author: "Priya S.",
    role: "VP Finance · lost 14 lbs in 3 months",
  },
  {
    text: "Works around 60-hour weeks. I take a photo and move on.",
    author: "Marcus T.",
    role: "Product Lead · hit 180g protein daily",
  },
  {
    text: "The only health app I've used for more than 2 weeks.",
    author: "Jordan K.",
    role: "Senior Engineer · body recomp in 8 weeks",
  },
];

// Static preview of what the app looks like — communicates value instantly
function AppPreview() {
  const ringProgress = 0.68;
  const circumference = 2 * Math.PI * 44;

  return (
    <View style={preview.card}>
      {/* Top row: greeting + date */}
      <View style={preview.topRow}>
        <View>
          <Text style={preview.greeting}>Good morning</Text>
          <Text style={preview.dateLabel}>Today · 1,847 cal logged</Text>
        </View>
        <View style={preview.streakBadge}>
          <Text style={preview.streakText}>🔥 12</Text>
        </View>
      </View>

      {/* Calorie ring */}
      <View style={preview.ringRow}>
        <View style={preview.ringWrap}>
          <Svg width={100} height={100} style={{ position: 'absolute' }}>
            <Circle cx={50} cy={50} r={44} stroke="rgba(255,255,255,0.06)" strokeWidth={8} fill="none" />
            <Circle
              cx={50} cy={50} r={44}
              stroke={C.accent} strokeWidth={8} fill="none"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference * (1 - ringProgress)}`}
              strokeLinecap="round"
              rotation="-90" origin="50,50"
            />
          </Svg>
          <View style={preview.ringCenter}>
            <Text style={preview.ringNum}>68%</Text>
            <Text style={preview.ringLabel}>of goal</Text>
          </View>
        </View>

        {/* Macro bars */}
        <View style={preview.macros}>
          {[
            { label: 'Protein', val: '147g', pct: 0.82, color: C.accent },
            { label: 'Carbs',   val: '198g', pct: 0.61, color: '#40C4FF' },
            { label: 'Fat',     val: '52g',  pct: 0.54, color: C.gold },
          ].map(m => (
            <View key={m.label} style={preview.macroRow}>
              <Text style={preview.macroLabel}>{m.label}</Text>
              <View style={preview.macroTrack}>
                <View style={[preview.macroFill, { width: `${m.pct * 100}%`, backgroundColor: m.color }]} />
              </View>
              <Text style={preview.macroVal}>{m.val}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick add row */}
      <View style={preview.quickRow}>
        {[
          { icon: 'camera', label: 'Photo' },
          { icon: 'barcode', label: 'Scan' },
          { icon: 'mic', label: 'Voice' },
          { icon: 'create', label: 'Manual' },
        ].map(b => (
          <View key={b.label} style={preview.quickBtn}>
            <Ionicons name={b.icon as any} size={16} color={C.accent} />
            <Text style={preview.quickLabel}>{b.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(32)).current;
  const testimonialOpacity = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 45, friction: 9, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.85, duration: 2800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 2800, useNativeDriver: true }),
      ])
    ).start();

    const interval = setInterval(() => {
      Animated.timing(testimonialOpacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
        setCurrentTestimonial(p => (p + 1) % TESTIMONIALS.length);
        Animated.timing(testimonialOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code !== 12501 && error.message !== 'Sign in canceled') {
        console.error('Google sign-in error:', error.message);
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoadingApple(true);
    try {
      await signInWithApple();
    } catch (error: any) {
      if (error.message !== 'Sign in canceled') {
        console.error('Apple sign-in error:', error.message);
      }
    } finally {
      setLoadingApple(false);
    }
  };

  const testimonial = TESTIMONIALS[currentTestimonial];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Ambient green bloom */}
      <Animated.View style={[styles.glowWrap, { opacity: glowAnim }]}>
        <LinearGradient
          colors={['rgba(0,230,118,0.07)', 'transparent']}
          style={styles.glow}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideUp }] }]}>

          {/* Logo wordmark */}
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Ionicons name="nutrition" size={18} color={C.accent} />
            </View>
            <Text style={styles.logoText}>Macra</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>PRO</Text>
            </View>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>
            Your body,{'\n'}
            <Text style={styles.headlineAccent}>optimized.</Text>
          </Text>
          <Text style={styles.subheadline}>
            AI macro tracking built for people who don't have time to think about it.
          </Text>

          {/* App Preview Widget */}
          <AppPreview />

          {/* Social proof */}
          <View style={styles.proofRow}>
            <View style={styles.stars}>
              {[1,2,3,4,5].map(s => <Ionicons key={s} name="star" size={12} color={C.gold} />)}
            </View>
            <Text style={styles.proofText}>
              <Text style={styles.proofBold}>47,392</Text> professionals · <Text style={styles.proofBold}>4.8★</Text>
            </Text>
          </View>

          {/* Rotating testimonial */}
          <Animated.View style={[styles.testimonialCard, { opacity: testimonialOpacity }]}>
            <Text style={styles.testimonialQuote}>"{testimonial.text}"</Text>
            <Text style={styles.testimonialAuthor}>
              — {testimonial.author}, <Text style={{ color: C.accent }}>{testimonial.role}</Text>
            </Text>
          </Animated.View>

          {/* Primary CTA */}
          <TouchableOpacity
            style={styles.primaryCta}
            onPress={() => navigation.navigate('Onboarding' as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryCtaText}>Build My Nutrition Plan</Text>
            <Ionicons name="arrow-forward" size={18} color="#0A0A0C" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social auth */}
          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
              cornerRadius={12}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}

          <TouchableOpacity
            style={[styles.googleButton, loadingGoogle && { opacity: 0.5 }]}
            onPress={handleGoogleSignIn}
            disabled={loadingGoogle}
          >
            {loadingGoogle
              ? <ActivityIndicator size="small" color={C.text} style={{ marginRight: 10 }} />
              : <Text style={styles.googleG}>G</Text>
            }
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Sign-in link */}
          <TouchableOpacity style={styles.signInLink} onPress={() => navigation.navigate('SignIn' as never)}>
            <Text style={styles.signInLinkText}>I already have an account →</Text>
          </TouchableOpacity>

          {/* Legal */}
          <Text style={styles.legal}>
            By continuing you agree to our{' '}
            <Text style={styles.legalLink} onPress={() => navigation.navigate('TermsOfUse' as never)}>Terms</Text>
            {' '}and{' '}
            <Text style={styles.legalLink} onPress={() => navigation.navigate('PrivacyPolicy' as never)}>Privacy Policy</Text>
          </Text>

        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ─── App preview mini-styles ─────────────────────────────────────────────────
const preview = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
    gap: 14,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 13, fontWeight: '700', color: C.text },
  dateLabel: { fontSize: 11, color: C.textTertiary, marginTop: 2 },
  streakBadge: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  streakText: { fontSize: 12, fontWeight: '700', color: C.gold },
  ringRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ringWrap: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
  ringCenter: { alignItems: 'center' },
  ringNum: { fontSize: 20, fontWeight: '800', color: C.text },
  ringLabel: { fontSize: 10, color: C.textTertiary },
  macros: { flex: 1, gap: 8 },
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  macroLabel: { fontSize: 10, color: C.textTertiary, width: 38 },
  macroTrack: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroFill: { height: '100%', borderRadius: 3 },
  macroVal: { fontSize: 10, color: C.textSub, width: 30, textAlign: 'right' },
  quickRow: { flexDirection: 'row', gap: 8 },
  quickBtn: {
    flex: 1,
    backgroundColor: C.elevated,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  quickLabel: { fontSize: 10, color: C.textSub, fontWeight: '600' },
});

// ─── Main styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  glowWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center' },
  glow: {
    width: width * 1.6,
    height: 260,
    position: 'absolute',
    top: -60,
    left: -width * 0.3,
  },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.accentDim,
    borderWidth: 1,
    borderColor: C.accentBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: { fontSize: 18, fontWeight: '700', color: C.text, letterSpacing: -0.2 },
  badge: {
    backgroundColor: C.accentDim,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: C.accentBorder,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: C.accent, letterSpacing: 0.5 },

  headline: {
    fontSize: 40,
    fontWeight: '800',
    color: C.text,
    lineHeight: 48,
    marginBottom: 10,
    letterSpacing: -1,
  },
  headlineAccent: { color: C.accent },
  subheadline: {
    fontSize: 16,
    color: C.textSub,
    lineHeight: 24,
    marginBottom: 20,
  },

  proofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  stars: { flexDirection: 'row', gap: 2 },
  proofText: { fontSize: 12, color: C.textSub },
  proofBold: { color: C.text, fontWeight: '700' },

  testimonialCard: {
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 20,
  },
  testimonialQuote: {
    fontSize: 13,
    color: C.text,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  testimonialAuthor: { fontSize: 11, color: C.textSub, fontWeight: '600' },

  primaryCta: {
    backgroundColor: C.accent,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  primaryCtaText: { color: '#0A0A0C', fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerLabel: { fontSize: 12, color: C.textTertiary, fontWeight: '500' },

  appleButton: { width: '100%', height: 50, marginBottom: 10 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surface,
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
  },
  googleG: { fontSize: 17, fontWeight: '800', color: '#4285F4' },
  googleText: { color: C.text, fontSize: 15, fontWeight: '600' },

  signInLink: { alignItems: 'center', paddingVertical: 10, marginBottom: 8 },
  signInLinkText: { fontSize: 14, color: C.textSub, fontWeight: '500' },

  legal: { fontSize: 11, color: C.textTertiary, textAlign: 'center', lineHeight: 17 },
  legalLink: { color: C.textSub, textDecorationLine: 'underline' },
});
