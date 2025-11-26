import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store/useThemeStore';
import Constants from 'expo-constants';

export default function App() {
  const initializeTheme = useThemeStore((state) => state.initialize);

  useEffect(() => {
    // Log app version on startup
    const appVersion = Constants.expoConfig?.version || 'unknown';
    const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || 'dev';
    
    console.log('\n' + '='.repeat(50));
    console.log('🚀 FORMA APP STARTED');
    console.log('='.repeat(50));
    console.log(`📦 Version:     ${appVersion}`);
    console.log(`🔢 Build:       ${buildNumber}`);
    console.log(`📱 Platform:    ${Constants.platform?.ios ? 'iOS' : Constants.platform?.android ? 'Android' : 'Unknown'}`);
    console.log(`🔧 Environment: ${__DEV__ ? 'Development' : 'Production'}`);
    console.log(`⏰ Started at:  ${new Date().toLocaleString()}`);
    console.log('='.repeat(50) + '\n');
    
    // Initialize theme store (doesn't require userId)
    // All other stores are initialized in authService when user logs in
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
