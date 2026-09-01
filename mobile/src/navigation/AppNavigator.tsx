import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import { useAuthStore } from '../store/useAuthStore';
import { useOnboardingStore } from '../store/useOnboardingStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { listenToAuthChanges } from '../services/authService';
import { useTheme } from '../hooks/useTheme';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfUseScreen from '../screens/TermsOfUseScreen';
import PaywallScreen from '../screens/PaywallScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const { isComplete: isOnboardingComplete, isLoading: isOnboardingLoading, initialize: initializeOnboarding } = useOnboardingStore();
  const { isPremium, isLoading: isSubscriptionLoading } = useSubscriptionStore();
  const { colors } = useTheme();
  const [bootTimedOut, setBootTimedOut] = useState(false);

  // Boot watchdog: if auth/onboarding restore hangs (network failure, a store
  // init that never resolves), stop waiting after 8s and show the app instead
  // of an infinite spinner — App Review rejects apps stuck on a loading screen.
  useEffect(() => {
    const timer = setTimeout(() => setBootTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize onboarding store
  useEffect(() => {
    if (user?.uid) {
      initializeOnboarding(user.uid);
    }
  }, [user?.uid, initializeOnboarding]);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = listenToAuthChanges();
    return () => unsubscribe();
  }, []);

  // Show loading screen while checking auth state.
  // For a signed-in user, also wait for the subscription status before
  // committing the initial route: rendering the stack while isPremium is
  // still its default (false) used to lock every subscriber onto the paywall
  // at cold launch. The cached isPremium (hydrated in the subscription store)
  // plus the boot watchdog keep this wait short and bounded.
  if ((isLoading || isOnboardingLoading || (isAuthenticated && isSubscriptionLoading)) && !bootTimedOut) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Show authenticated app or auth screens
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        // Authenticated screens — show Paywall first if not yet subscribed
        <>
          {!isPremium && (
            <Stack.Screen name="Paywall" component={PaywallScreen} />
          )}
          <Stack.Screen name="Main" component={MainNavigator} />
        </>
      ) : (
        // Auth/Onboarding screens
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

