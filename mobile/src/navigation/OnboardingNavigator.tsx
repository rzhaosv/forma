import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ValueDemoScreen from '../screens/onboarding/ValueDemoScreen';
import QuickGoalScreen from '../screens/onboarding/QuickGoalScreen';
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
      <Stack.Screen name="ValueDemo" component={ValueDemoScreen} />
      <Stack.Screen name="QuickGoal" component={QuickGoalScreen} />
      <Stack.Screen name="WeightGoal" component={WeightGoalScreen} />
      <Stack.Screen name="GoalResults" component={GoalResultsScreen} />
    </Stack.Navigator>
  );
}

