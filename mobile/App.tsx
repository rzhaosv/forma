// Initialize Firebase FIRST before any other imports that might use it
import './src/config/firebase';
import React, { useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store/useThemeStore';
import { useUnitSystemStore } from './src/store/useUnitSystemStore';
import Constants from 'expo-constants';
import { initializeNotifications } from './src/services/notificationService';
import { initializeAnalytics, trackScreenView } from './src/utils/analytics';

// Error Boundary to catch and display JavaScript errors gracefully
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔴 App Error Boundary caught error:', error);
    console.error('🔴 Error Info:', errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.emoji}>😔</Text>
          <Text style={errorStyles.title}>Something went wrong</Text>
          <Text style={errorStyles.message}>
            We apologize for the inconvenience. Please try restarting the app.
          </Text>
          <TouchableOpacity style={errorStyles.button} onPress={this.handleRestart}>
            <Text style={errorStyles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          {__DEV__ && this.state.error && (
            <Text style={errorStyles.debug}>{this.state.error.toString()}</Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  debug: {
    marginTop: 20,
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

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
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <NavigationContainer
          ref={navigationRef}
          onReady={async () => {
            // Track the initial screen when app starts
            const initialRouteName = navigationRef.current?.getCurrentRoute()?.name;
            routeNameRef.current = initialRouteName;
            if (initialRouteName) {
              console.log(`📊 Tracking initial screen: ${initialRouteName}`);
              await trackScreenView(initialRouteName, initialRouteName);
            }
          }}
          onStateChange={async () => {
            const previousRouteName = routeNameRef.current;
            const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

            if (previousRouteName !== currentRouteName && currentRouteName) {
              // Track screen view in Firebase Analytics
              console.log(`📊 Tracking screen change: ${previousRouteName} → ${currentRouteName}`);
              await trackScreenView(currentRouteName, currentRouteName);
            }

            // Save the current route name for next change
            routeNameRef.current = currentRouteName;
          }}
        >
          <AppNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
