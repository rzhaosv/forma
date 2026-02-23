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
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithGoogle, signInWithApple } from '../services/authService';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Premium dark palette
const C = {
  bg: '#0A0A0C',
  surface: '#1A1A1E',
  text: '#F0F0F5',
  textSub: '#A0A0B0',
  textTertiary: '#6B6B80',
  accent: '#00E676',
  accentBg: 'rgba(0,230,118,0.12)',
  border: 'rgba(255,255,255,0.08)',
};

const TESTIMONIALS = [
  {
    text: "Macro tracking takes 30 seconds per meal. Never stuck with an app longer than 2 weeks before this.",
    author: "Priya S.",
    role: "Financial Analyst, 28",
  },
  {
    text: "Down 12 lbs in 10 weeks while working 60-hour weeks. Finally something that fits my schedule.",
    author: "Mark T.",
    role: "Product Manager, 31",
  },
  {
    text: "The AI scan is insane. I just take a photo and it's done. No more guessing.",
    author: "Jordan K.",
    role: "Software Engineer, 34",
  },
];

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const testimonialOpacity = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.7, duration: 2500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 2500, useNativeDriver: true }),
      ])
    ).start();

    // Testimonial rotation
    const interval = setInterval(() => {
      Animated.timing(testimonialOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
        Animated.timing(testimonialOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
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

      {/* Ambient green glow background */}
      <Animated.View style={[styles.glowContainer, { opacity: glowAnim }]}>
        <LinearGradient
          colors={['rgba(0,230,118,0.08)', 'transparent']}
          style={styles.glow}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideUp }] },
          ]}
        >
          {/* Logo + Headline */}
          <View style={styles.heroSection}>
            <View style={styles.logoRow}>
              <View style={styles.logoMark}>
                <Ionicons name="nutrition" size={22} color={C.accent} />
              </View>
              <Text style={styles.logoText}>NutriSnap</Text>
            </View>

            <Text style={styles.headline}>
              Built for professionals{'\n'}who want results.
            </Text>
            <Text style={styles.subheadline}>
              Track macros in 30 seconds. AI-powered. No complexity.
            </Text>

            {/* Social proof bar */}
            <View style={styles.proofBar}>
              <View style={styles.stars}>
                {[1,2,3,4,5].map(s => (
                  <Ionicons key={s} name="star" size={13} color="#FCD34D" />
                ))}
              </View>
              <Text style={styles.proofText}>
                <Text style={styles.proofNumber}>47,392</Text> professionals trust NutriSnap
              </Text>
            </View>

            {/* Testimonial */}
            <Animated.View style={[styles.testimonialCard, { opacity: testimonialOpacity }]}>
              <Text style={styles.testimonialQuote}>"{testimonial.text}"</Text>
              <Text style={styles.testimonialAuthor}>
                — {testimonial.author}, {testimonial.role}
              </Text>
            </Animated.View>
          </View>

          {/* CTAs */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => navigation.navigate('Onboarding' as never)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryCtaText}>Build My Nutrition Plan</Text>
              <Ionicons name="arrow-forward" size={18} color="#0A0A0C" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryCta}
              onPress={() => navigation.navigate('SignIn' as never)}
            >
              <Text style={styles.secondaryCtaText}>I already have an account</Text>
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
              style={[styles.googleButton, loadingGoogle && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={loadingGoogle}
            >
              {loadingGoogle ? (
                <ActivityIndicator size="small" color={C.text} style={{ marginRight: 10 }} />
              ) : (
                <Text style={styles.googleG}>G</Text>
              )}
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Legal */}
            <Text style={styles.legal}>
              By continuing, you agree to our{' '}
              <Text style={styles.legalLink} onPress={() => navigation.navigate('TermsOfUse' as never)}>
                Terms
              </Text>{' '}and{' '}
              <Text style={styles.legalLink} onPress={() => navigation.navigate('PrivacyPolicy' as never)}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  glowContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
  },
  glow: {
    width: width * 1.5,
    height: 300,
    position: 'absolute',
    top: -50,
    left: -width * 0.25,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 10,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.accentBg,
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.3,
  },
  headline: {
    fontSize: 38,
    fontWeight: '800',
    color: C.text,
    lineHeight: 46,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: 17,
    color: C.textSub,
    lineHeight: 25,
    marginBottom: 24,
  },
  proofBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  proofText: {
    fontSize: 13,
    color: C.textSub,
  },
  proofNumber: {
    color: C.text,
    fontWeight: '700',
  },
  testimonialCard: {
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  testimonialQuote: {
    fontSize: 14,
    color: C.text,
    lineHeight: 21,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  testimonialAuthor: {
    fontSize: 12,
    color: C.textSub,
    fontWeight: '600',
  },
  ctaSection: {
    paddingBottom: 16,
  },
  primaryCta: {
    backgroundColor: C.accent,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryCtaText: {
    color: '#0A0A0C',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  secondaryCta: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 20,
  },
  secondaryCtaText: {
    color: C.textSub,
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerLabel: {
    fontSize: 12,
    color: C.textTertiary,
    fontWeight: '500',
  },
  appleButton: {
    width: '100%',
    height: 50,
    marginBottom: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surface,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
  },
  googleG: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
  },
  googleText: {
    color: C.text,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  legal: {
    fontSize: 11,
    color: C.textTertiary,
    textAlign: 'center',
    lineHeight: 17,
  },
  legalLink: {
    color: C.textSub,
    textDecorationLine: 'underline',
  },
});
