import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CameraScreen from '../screens/CameraScreen';

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Camera" component={CameraScreen} />
      {/* Add more authenticated screens here later (Home, Profile, etc.) */}
    </Stack.Navigator>
  );
}

