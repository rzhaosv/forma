import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Opening block (screens 1–5)
import QuickGoalScreen from '../screens/onboarding/QuickGoalScreen';
import HeightScreen from '../screens/onboarding/HeightScreen';
import CurrentWeightScreen from '../screens/onboarding/CurrentWeightScreen';
import GoalWeightScreen from '../screens/onboarding/GoalWeightScreen';
import AgeScreen from '../screens/onboarding/AgeScreen';

// Value break 1 (screen 6)
import SocialProof1Screen from '../screens/onboarding/SocialProof1Screen';

// Deepening block (screens 7–12)
import ActivityLevelScreen from '../screens/onboarding/ActivityLevelScreen';
import TimeAvailableScreen from '../screens/onboarding/TimeAvailableScreen';
import DietaryPrefsScreen from '../screens/onboarding/DietaryPrefsScreen';
import ObstaclesScreen from '../screens/onboarding/ObstaclesScreen';
import SocialProof2Screen from '../screens/onboarding/SocialProof2Screen';
import CoachingStyleScreen from '../screens/onboarding/CoachingStyleScreen';

// Climax sequence (screens 13–14)
import LaborIllusionScreen from '../screens/onboarding/LaborIllusionScreen';
import TransformationTimelineScreen from '../screens/onboarding/TransformationTimelineScreen';

const Stack = createStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => ({
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
          },
        }),
      }}
    >
      {/* Opening block */}
      <Stack.Screen name="QuickGoal" component={QuickGoalScreen} />
      <Stack.Screen name="Height" component={HeightScreen} />
      <Stack.Screen name="CurrentWeight" component={CurrentWeightScreen} />
      <Stack.Screen name="GoalWeight" component={GoalWeightScreen} />
      <Stack.Screen name="AgeScreen" component={AgeScreen} />

      {/* Value break 1 */}
      <Stack.Screen name="SocialProof1" component={SocialProof1Screen} />

      {/* Deepening block */}
      <Stack.Screen name="ActivityLevel" component={ActivityLevelScreen} />
      <Stack.Screen name="TimeAvailable" component={TimeAvailableScreen} />
      <Stack.Screen name="DietaryPrefs" component={DietaryPrefsScreen} />
      <Stack.Screen name="Obstacles" component={ObstaclesScreen} />
      <Stack.Screen name="SocialProof2" component={SocialProof2Screen} />
      <Stack.Screen name="CoachingStyle" component={CoachingStyleScreen} />

      {/* Climax sequence */}
      <Stack.Screen name="LaborIllusion" component={LaborIllusionScreen} />
      <Stack.Screen name="TransformationTimeline" component={TransformationTimelineScreen} />
    </Stack.Navigator>
  );
}
