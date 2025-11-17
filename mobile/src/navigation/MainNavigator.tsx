import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import FoodResultsScreen from '../screens/FoodResultsScreen';
import ManualEntryScreen from '../screens/ManualEntryScreen';
import FoodSearchScreen from '../screens/FoodSearchScreen';
import SettingsScreen from '../screens/SettingsScreen';

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
      <Stack.Screen name="FoodResults" component={FoodResultsScreen} />
      <Stack.Screen name="ManualEntry" component={ManualEntryScreen} />
      <Stack.Screen name="FoodSearch" component={FoodSearchScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      {/* Add more screens: Profile, Progress, etc. */}
    </Stack.Navigator>
  );
}

