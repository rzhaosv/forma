import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore, ActivityLevel } from '../../store/useOnboardingStore';
import { useTheme } from '../../hooks/useTheme';

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; description: string }[] = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    description: 'Little to no exercise',
  },
  {
    value: 'light',
    label: 'Light',
    description: 'Exercise 1-3 days per week',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Exercise 3-5 days per week',
  },
  {
    value: 'active',
    label: 'Active',
    description: 'Exercise 6-7 days per week',
  },
  {
    value: 'very_active',
    label: 'Very Active',
    description: 'Hard exercise or physical job',
  },
];

export default function ActivityLevelScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { data, updateData, setStep } = useOnboardingStore();
  
  const [selectedLevel, setSelectedLevel] = useState<ActivityLevel | undefined>(data.activityLevel);

  const handleContinue = () => {
    if (!selectedLevel) return;
    
    updateData({ activityLevel: selectedLevel });
    setStep(4);
    navigation.navigate('WeightGoal' as never);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 16,
    },
    backText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    scrollContent: {
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 32,
    },
    progressBar: {
      height: 4,
      backgroundColor: colors.divider,
      borderRadius: 2,
      marginBottom: 24,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 2,
      width: '75%', // Step 3 of 4
    },
    stepText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 32,
    },
    optionCard: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 20,
      marginBottom: 12,
    },
    optionCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '20',
    },
    optionLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    optionLabelSelected: {
      color: colors.primary,
    },
    optionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    continueButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
      opacity: selectedLevel ? 1 : 0.5,
    },
    continueButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          style={dynamicStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={dynamicStyles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={dynamicStyles.scrollContent}>
        <Text style={dynamicStyles.title}>Your fitness level</Text>
        <Text style={dynamicStyles.subtitle}>
          This helps us calculate your daily calorie needs
        </Text>

        {/* Progress Bar */}
        <View style={dynamicStyles.progressBar}>
          <View style={dynamicStyles.progressFill} />
        </View>
        <Text style={dynamicStyles.stepText}>Step 3 of 4</Text>

        {/* Activity Level Options */}
        <Text style={[dynamicStyles.optionLabel, { marginBottom: 16 }]}>Activity Level</Text>
        {ACTIVITY_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.value}
            style={[
              dynamicStyles.optionCard,
              selectedLevel === level.value && dynamicStyles.optionCardSelected,
            ]}
            onPress={() => setSelectedLevel(level.value)}
          >
            <Text
              style={[
                dynamicStyles.optionLabel,
                selectedLevel === level.value && dynamicStyles.optionLabelSelected,
              ]}
            >
              {selectedLevel === level.value ? '●' : '○'} {level.label}
            </Text>
            <Text style={dynamicStyles.optionDescription}>{level.description}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={dynamicStyles.continueButton}
          onPress={handleContinue}
          disabled={!selectedLevel}
        >
          <Text style={dynamicStyles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});

