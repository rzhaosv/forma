import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import MainNavigator from './MainNavigator';
import { useAuthStore } from '../store/useAuthStore';
import { listenToAuthChanges } from '../services/authService';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = listenToAuthChanges();
    return () => unsubscribe();
  }, []);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
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
        // Auth screens
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
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

