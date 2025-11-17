import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store/useThemeStore';

export default function App() {
  const initializeTheme = useThemeStore((state) => state.initialize);

  useEffect(() => {
    // Initialize theme on app start
    initializeTheme();
  }, [initializeTheme]);

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
