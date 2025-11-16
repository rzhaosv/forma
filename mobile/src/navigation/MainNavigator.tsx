import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
      {/* Add more screens: Profile, Progress, Settings, etc. */}
    </Stack.Navigator>
  );
}

