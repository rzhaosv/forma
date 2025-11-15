import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import AddFoodScreen from '../screens/AddFoodScreen';
import MealDetailScreen from '../screens/MealDetailScreen';
import CameraScreen from '../screens/CameraScreen';

export type AppStackParamList = {
  Home: undefined;
  Camera: undefined;
  AddFood: undefined;
  MealDetail: { mealId: string };
};

const Stack = createStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="AddFood" component={AddFoodScreen} />
      <Stack.Screen name="MealDetail" component={MealDetailScreen} />
    </Stack.Navigator>
  );
}

