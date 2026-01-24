import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store/useThemeStore';
import { useUnitSystemStore } from './src/store/useUnitSystemStore';
import Constants from 'expo-constants';
import { initializeNotifications } from './src/services/notificationService';
import { initializeAnalytics, trackScreenView } from './src/utils/analytics';

export default function App() {
  const initializeTheme = useThemeStore((state) => state.initialize);
  const initializeUnitSystem = useUnitSystemStore((state) => state.initialize);
  const routeNameRef = React.useRef<string>();
  const navigationRef = React.useRef<any>();

  useEffect(() => {
    // Log app version on startup
    const appVersion = Constants.expoConfig?.version || 'unknown';
    const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || 'dev';

    console.log('\n' + '='.repeat(50));
    console.log('🚀 NUTRISNAP APP STARTED');
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

    // Initialize unit system store
    initializeUnitSystem();

    // Initialize notifications
    initializeNotifications().catch(console.error);

    // Initialize Firebase Analytics
    initializeAnalytics().catch(console.error);
  }, [initializeTheme, initializeUnitSystem]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
        }}
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

          if (previousRouteName !== currentRouteName && currentRouteName) {
            // Track screen view in Firebase Analytics
            await trackScreenView(currentRouteName, currentRouteName);
          }

          // Save the current route name for next change
          routeNameRef.current = currentRouteName;
        }}
      >
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
