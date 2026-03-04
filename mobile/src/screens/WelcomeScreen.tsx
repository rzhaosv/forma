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
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithGoogle, signInWithApple } from '../services/authService';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Rect, Polygon, Ellipse, LinearGradient as SvgLinearGradient, RadialGradient, Stop, Defs } from 'react-native-svg';

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

const FEATURES = [
  { icon: 'camera-outline' as const, text: 'Log meals by photo — takes 3 seconds' },
  { icon: 'bar-chart-outline' as const, text: 'Macros, not just calories' },
  { icon: 'trending-up-outline' as const, text: 'Insights that adapt to your week' },
];

// Inline M mark — matches assets/logo.svg geometry exactly
function MMark({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 400 400">
      <Defs>
        <SvgLinearGradient id="wbg" x1="200" y1="0" x2="200" y2="400" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#1E1E26" />
          <Stop offset="1" stopColor="#07070B" />
        </SvgLinearGradient>
        <SvgLinearGradient id="wgreen" x1="90" y1="78" x2="200" y2="230" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#18FF84" />
          <Stop offset="1" stopColor="#00B84A" />
        </SvgLinearGradient>
        <SvgLinearGradient id="wbar" x1="0" y1="78" x2="0" y2="322" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#C8C8DA" />
        </SvgLinearGradient>
        <RadialGradient id="wsheen" cx="28%" cy="18%" r="55%">
          <Stop stopColor="#FFFFFF" stopOpacity="0.09" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="400" height="400" rx="90" fill="url(#wbg)" />
      <Rect width="400" height="400" rx="90" fill="url(#wsheen)" />
      <Ellipse cx="200" cy="180" rx="120" ry="105" fill="#00E676" opacity="0.06" />
      <Polygon points="62,78 117,78 200,230 145,230" fill="url(#wgreen)" />
      <Polygon points="283,78 338,78 255,230 200,230" fill="url(#wgreen)" />
      <Rect x="62" y="78" width="55" height="244" rx="11" fill="url(#wbar)" />
      <Rect x="283" y="78" width="55" height="244" rx="11" fill="url(#wbar)" />
    </Svg>
  );
}

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
        <Text style={preview.dateSubLabel}>Mar 4</Text>
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Subtle top glow — static, no animation */}
      <LinearGradient
        colors={['rgba(0,230,118,0.05)', 'transparent']}
        style={styles.glow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideUp }] }}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            {/* Logo */}
            <View style={styles.logoRow}>
              <MMark size={36} />
              <Text style={styles.logoText}>Macra</Text>
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

            {/* Feature bullets — specific, honest, no fake numbers */}
            <View style={styles.features}>
              {FEATURES.map(f => (
                <View key={f.icon} style={styles.featureRow}>
                  <View style={styles.featureIconWrap}>
                    <Ionicons name={f.icon} size={16} color={C.accent} />
                  </View>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>

            {/* Primary CTA */}
            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => navigation.navigate('Onboarding' as never)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryCtaText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={18} color="#0A0A0C" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>or sign in with</Text>
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

          </ScrollView>
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
  dateSubLabel: { fontSize: 12, fontWeight: '600', color: C.textTertiary },
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
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  safeArea: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 10,
  },
  logoText: { fontSize: 20, fontWeight: '700', color: C.text, letterSpacing: -0.3 },

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

  features: {
    gap: 10,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: C.accentDim,
    borderWidth: 1,
    borderColor: C.accentBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: { fontSize: 14, color: C.textSub, flex: 1 },

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
