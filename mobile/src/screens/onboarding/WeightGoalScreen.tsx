import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore, WeightGoal } from '../../store/useOnboardingStore';
import { useTheme } from '../../hooks/useTheme';

const WEIGHT_GOALS: { value: WeightGoal; label: string; description?: string }[] = [
  {
    value: 'lose',
    label: 'Lose Weight',
    description: 'Recommended',
  },
  {
    value: 'maintain',
    label: 'Maintain Weight',
  },
  {
    value: 'gain',
    label: 'Gain Muscle',
  },
];

export default function WeightGoalScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { data, updateData, setStep } = useOnboardingStore();
  
  const [selectedGoal, setSelectedGoal] = useState<WeightGoal | undefined>(data.weightGoal);
  const [targetWeight, setTargetWeight] = useState(
    data.targetWeight_kg?.toString() || data.weight_kg?.toString() || '65'
  );

  const handleCalculate = () => {
    if (!selectedGoal) return;
    
    const targetWeightNum = parseFloat(targetWeight);
    if (isNaN(targetWeightNum) || targetWeightNum < 30 || targetWeightNum > 300) {
      return;
    }
    
    updateData({
      weightGoal: selectedGoal,
      targetWeight_kg: targetWeightNum,
    });
    
    // Calculate goals - need to get the store instance
    const store = useOnboardingStore.getState();
    store.calculateGoals();
    
    navigation.navigate('GoalResults' as never);
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
      width: '100%', // Step 4 of 4
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
    },
    optionLabelSelected: {
      color: colors.primary,
    },
    optionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderWidth: 2,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 32,
    },
    input: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      color: colors.inputText,
      paddingVertical: 16,
    },
    unitText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    calculateButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
      opacity: selectedGoal ? 1 : 0.5,
    },
    calculateButtonText: {
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
        <Text style={dynamicStyles.title}>What's your goal?</Text>
        <Text style={dynamicStyles.subtitle}>
          We'll calculate your daily calorie target based on your goal
        </Text>

        {/* Progress Bar */}
        <View style={dynamicStyles.progressBar}>
          <View style={dynamicStyles.progressFill} />
        </View>
        <Text style={dynamicStyles.stepText}>Step 4 of 4</Text>

        {/* Weight Goal Options */}
        {WEIGHT_GOALS.map((goal) => (
          <TouchableOpacity
            key={goal.value}
            style={[
              dynamicStyles.optionCard,
              selectedGoal === goal.value && dynamicStyles.optionCardSelected,
            ]}
            onPress={() => setSelectedGoal(goal.value)}
          >
            <Text
              style={[
                dynamicStyles.optionLabel,
                selectedGoal === goal.value && dynamicStyles.optionLabelSelected,
              ]}
            >
              {selectedGoal === goal.value ? '●' : '○'} {goal.label}
            </Text>
            {goal.description && (
              <Text style={dynamicStyles.optionDescription}>{goal.description}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Target Weight Input */}
        <Text style={dynamicStyles.inputLabel}>Target Weight</Text>
        <View style={dynamicStyles.inputContainer}>
          <TextInput
            style={dynamicStyles.input}
            value={targetWeight}
            onChangeText={setTargetWeight}
            keyboardType="numeric"
            placeholder="65"
            placeholderTextColor={colors.placeholder}
          />
          <Text style={dynamicStyles.unitText}>kg</Text>
        </View>

        <TouchableOpacity
          style={dynamicStyles.calculateButton}
          onPress={handleCalculate}
          disabled={!selectedGoal}
        >
          <Text style={dynamicStyles.calculateButtonText}>Calculate</Text>
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

