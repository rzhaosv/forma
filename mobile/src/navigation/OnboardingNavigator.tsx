import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PhysicalInfoScreen from '../screens/onboarding/PhysicalInfoScreen';
import DemographicsScreen from '../screens/onboarding/DemographicsScreen';
import ActivityLevelScreen from '../screens/onboarding/ActivityLevelScreen';
import WeightGoalScreen from '../screens/onboarding/WeightGoalScreen';
import GoalResultsScreen from '../screens/onboarding/GoalResultsScreen';

const Stack = createStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="PhysicalInfo" component={PhysicalInfoScreen} />
      <Stack.Screen name="Demographics" component={DemographicsScreen} />
      <Stack.Screen name="ActivityLevel" component={ActivityLevelScreen} />
      <Stack.Screen name="WeightGoal" component={WeightGoalScreen} />
      <Stack.Screen name="GoalResults" component={GoalResultsScreen} />
    </Stack.Navigator>
  );
}

