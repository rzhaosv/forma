import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store/useThemeStore';
import { useProgressStore } from './src/store/useProgressStore';
import { useMealStore } from './src/store/useMealStore';

export default function App() {
  const initializeTheme = useThemeStore((state) => state.initialize);
  const initializeProgress = useProgressStore((state) => state.initialize);
  const initializeMealStore = useMealStore((state) => state.initialize);

  useEffect(() => {
    // Initialize theme, progress, and meal store on app start
    initializeTheme();
    initializeProgress();
    initializeMealStore();
  }, [initializeTheme, initializeProgress, initializeMealStore]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
