import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Animated,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithGoogle, signInWithApple } from '../services/authService';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const TESTIMONIALS = [
  { text: "Finally understand my macros!", author: "Sarah J." },
  { text: "Lost 15 lbs in 2 months!", author: "Mike D." },
  { text: "The voice logging is a game-changer.", author: "Emily R." },
];

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const testimonialOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      // Logo pop-in with rotation
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Content fade and slide up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideUp, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous pulse animation for CTA button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Testimonial rotation
    testimonialOpacity.setValue(1);
    const testimonialInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(testimonialOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(testimonialOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);

    return () => clearInterval(testimonialInterval);
  }, [logoScale, logoRotate, fadeAnim, slideUp, pulseAnim, testimonialOpacity]);

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
      // Navigation handled automatically by AppNavigator
    } catch (error: any) {
      if (error.code !== 12501 && error.message !== 'Sign in canceled') { // 12501 is generic cancellation
        Alert.alert('Google Sign-In Failed', error.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoadingApple(true);
    try {
      await signInWithApple();
      // Navigation handled automatically by auth listener
    } catch (error: any) {
      if (error.message !== 'Sign in canceled') {
        Alert.alert('Apple Sign-In Failed', error.message || 'Failed to sign in with Apple');
      }
    } finally {
      setLoadingApple(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E40AF', '#0891B2', '#14B8A6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        {/* Logo/Icon Area */}
        <View style={styles.logoContainer}>
          <Animated.View
            style={[
              styles.logoCircle,
              {
                transform: [
                  { scale: logoScale },
                  { rotate: spin },
                ],
              },
            ]}
          >
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideUp }] }}>
            <Text style={styles.appName}>Welcome to NutriSnap</Text>
            <Text style={styles.tagline}>
              Your AI-powered nutrition coach
            </Text>
            <Text style={styles.subtitle}>
              Trusted by thousands to reach their health goals
            </Text>

            {/* Testimonial */}
            <Animated.View style={[styles.testimonialContainer, { opacity: testimonialOpacity }]}>
              <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons key={star} name="star" size={16} color="#FCD34D" />
                ))}
              </View>
              <Text style={styles.testimonialText}>
                "{TESTIMONIALS[currentTestimonial].text}"
              </Text>
              <Text style={styles.testimonialAuthor}>
                — {TESTIMONIALS[currentTestimonial].author}
              </Text>
            </Animated.View>
          </Animated.View>

          {/* Feature highlights */}
          <Animated.View style={[styles.featuresContainer, { opacity: fadeAnim }]}>
            <View style={styles.featureItem}>
              <Ionicons name="camera" size={32} color="rgba(255, 255, 255, 0.95)" />
              <Text style={styles.featureText}>Snap & Track</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="sparkles" size={32} color="rgba(255, 255, 255, 0.95)" />
              <Text style={styles.featureText}>AI Insights</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trending-up" size={32} color="rgba(255, 255, 255, 0.95)" />
              <Text style={styles.featureText}>Hit Goals</Text>
            </View>
          </Animated.View>
        </View>

        {/* Auth Buttons */}
        <Animated.View
          style={[
            styles.authContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideUp }] },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Onboarding' as never)}
            >
              <Text style={styles.primaryButtonText}>Start Your Journey →</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('SignIn' as never)}
          >
            <Text style={styles.secondaryButtonText}>Already have an account?</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

        {/* Social Auth Buttons */}
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
          style={[styles.socialButton, loadingGoogle && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={loadingGoogle}
        >
          {loadingGoogle ? (
            <ActivityIndicator size="small" color="#374151" style={{ marginRight: 12 }} />
          ) : (
            <Text style={styles.googleIcon}>G</Text>
          )}
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('TermsOfUse' as never)}
              >
                Terms
              </Text> and{' '}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('PrivacyPolicy' as never)}
              >
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
  },
  safeArea: {
    flex: 1,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  logoCircle: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontWeight: '400',
  },
  testimonialContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 24,
    gap: 4,
  },
  testimonialText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
    marginTop: 4,
  },
  testimonialAuthor: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    fontWeight: '600',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  authContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#0891B2',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 0,
  },
  socialIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
    marginRight: 12,
  },
  appleButton: {
    width: '100%',
    height: 52,
    marginBottom: 12,
  },
  socialButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    paddingTop: 16,
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 16,
  },
  link: {
    color: '#FFFFFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
