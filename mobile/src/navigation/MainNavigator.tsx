import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import FoodResultsScreen from '../screens/FoodResultsScreen';
import ManualEntryScreen from '../screens/ManualEntryScreen';
import FoodSearchScreen from '../screens/FoodSearchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProgressScreen from '../screens/ProgressScreen';
import GoalsScreen from '../screens/GoalsScreen';
import RecipeBuilderScreen from '../screens/RecipeBuilderScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import MealHistoryScreen from '../screens/MealHistoryScreen';
import ExportDataScreen from '../screens/ExportDataScreen';
import ExerciseScreen from '../screens/ExerciseScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfUseScreen from '../screens/TermsOfUseScreen';
import VoiceLogScreen from '../screens/VoiceLogScreen';
import ProfileCompletionNavigator from '../navigation/ProfileCompletionNavigator';
import AchievementsScreen from '../screens/AchievementsScreen';

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
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="RecipeBuilder" component={RecipeBuilderScreen} />
      <Stack.Screen name="RecipeList" component={RecipeListScreen} />
      <Stack.Screen name="MealHistory" component={MealHistoryScreen} />
      <Stack.Screen name="ExportData" component={ExportDataScreen} />
      <Stack.Screen name="Exercise" component={ExerciseScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
      <Stack.Screen name="VoiceLog" component={VoiceLogScreen} />
      <Stack.Screen name="ProfileCompletion" component={ProfileCompletionNavigator} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
    </Stack.Navigator>
  );
}
