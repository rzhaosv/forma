import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import { useAuthStore } from '../store/useAuthStore';
import { useOnboardingStore } from '../store/useOnboardingStore';
import { listenToAuthChanges } from '../services/authService';
import { useTheme } from '../hooks/useTheme';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfUseScreen from '../screens/TermsOfUseScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const { isComplete: isOnboardingComplete, isLoading: isOnboardingLoading, initialize: initializeOnboarding } = useOnboardingStore();
  const { colors } = useTheme();

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

  // Show loading screen while checking auth state
  if (isLoading || isOnboardingLoading) {
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
        // Authenticated screens
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        // Auth/Onboarding screens
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
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

