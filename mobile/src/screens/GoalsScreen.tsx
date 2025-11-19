import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMealStore } from '../store/useMealStore';
import { useOnboardingStore } from '../store/useOnboardingStore';
import { useTheme } from '../hooks/useTheme';
// Goals screen - no need to import calorie calculator as we use onboarding store's calculateGoals

export default function GoalsScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { calorieGoal, proteinGoal, setGoals } = useMealStore();
  const { data: onboardingData, calculateGoals } = useOnboardingStore();
  
  const [calorieInput, setCalorieInput] = useState(calorieGoal.toString());
  const [proteinInput, setProteinInput] = useState(proteinGoal.toString());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setCalorieInput(calorieGoal.toString());
    setProteinInput(proteinGoal.toString());
  }, [calorieGoal, proteinGoal]);

  const handleSave = async () => {
    const calories = parseInt(calorieInput, 10);
    const protein = parseInt(proteinInput, 10);

    if (isNaN(calories) || calories < 1000 || calories > 5000) {
      Alert.alert('Invalid Calories', 'Please enter a calorie goal between 1000-5000 kcal');
      return;
    }

    if (isNaN(protein) || protein < 0 || protein > 500) {
      Alert.alert('Invalid Protein', 'Please enter a protein goal between 0-500g');
      return;
    }

    await setGoals(calories, protein);
    setIsEditing(false);
    Alert.alert('Goals Updated', 'Your daily goals have been updated successfully!');
  };

  const handleRecalculate = () => {
    if (!onboardingData.weight_kg || !onboardingData.height_cm || !onboardingData.age || 
        !onboardingData.gender || !onboardingData.activityLevel) {
      Alert.alert(
        'Missing Information',
        'Please complete your profile information first. You can update it in Settings.'
      );
      return;
    }

    // Recalculate goals based on current onboarding data
    calculateGoals();
    const { calorieGoal: newCalorieGoal, proteinGoal: newProteinGoal } = useOnboardingStore.getState().data;
    
    if (newCalorieGoal && newProteinGoal) {
      setGoals(newCalorieGoal, newProteinGoal);
      Alert.alert(
        'Goals Recalculated',
        `Your goals have been recalculated:\nCalories: ${newCalorieGoal} kcal\nProtein: ${newProteinGoal}g`
      );
    }
  };

  const handleCancel = () => {
    setCalorieInput(calorieGoal.toString());
    setProteinInput(proteinGoal.toString());
    setIsEditing(false);
  };

  // Calculate macro breakdown
  const carbsGoal = Math.round((calorieGoal * 0.4) / 4); // 40% of calories from carbs
  const fatGoal = Math.round((calorieGoal * 0.3) / 9); // 30% of calories from fat

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
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    scrollContent: {
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    goalCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    goalLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
      fontWeight: '500',
    },
    goalValueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    goalInput: {
      flex: 1,
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      backgroundColor: colors.inputBackground,
      borderWidth: isEditing ? 2 : 0,
      borderColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      textAlign: 'center',
    },
    goalUnit: {
      fontSize: 18,
      color: colors.textSecondary,
      marginLeft: 12,
    },
    goalDisplay: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
      paddingVertical: 12,
    },
    macroRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    macroRowLast: {
      borderBottomWidth: 0,
    },
    macroLabel: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    macroValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonPrimary: {
      backgroundColor: colors.primary,
    },
    buttonSecondary: {
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    buttonTextSecondary: {
      color: colors.text,
    },
    recalculateButton: {
      backgroundColor: colors.surface,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    recalculateButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    infoText: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: 'center',
      lineHeight: 18,
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
        <Text style={dynamicStyles.title}>Daily Goals</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={dynamicStyles.scrollContent}>
        {/* Calorie Goal */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Calorie Goal</Text>
          <View style={dynamicStyles.goalCard}>
            <Text style={dynamicStyles.goalLabel}>Daily Calorie Target</Text>
            {isEditing ? (
              <View style={dynamicStyles.goalValueContainer}>
                <TextInput
                  style={dynamicStyles.goalInput}
                  value={calorieInput}
                  onChangeText={setCalorieInput}
                  keyboardType="numeric"
                  placeholder="2000"
                  placeholderTextColor={colors.placeholder}
                />
                <Text style={dynamicStyles.goalUnit}>kcal</Text>
              </View>
            ) : (
              <Text style={dynamicStyles.goalDisplay}>{calorieGoal} kcal</Text>
            )}
            {isEditing ? (
              <View style={dynamicStyles.buttonRow}>
                <TouchableOpacity
                  style={[dynamicStyles.button, dynamicStyles.buttonSecondary]}
                  onPress={handleCancel}
                >
                  <Text style={[dynamicStyles.buttonText, dynamicStyles.buttonTextSecondary]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[dynamicStyles.button, dynamicStyles.buttonPrimary]}
                  onPress={handleSave}
                >
                  <Text style={dynamicStyles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[dynamicStyles.button, dynamicStyles.buttonPrimary]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={dynamicStyles.buttonText}>Edit Goal</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Protein Goal */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Protein Goal</Text>
          <View style={dynamicStyles.goalCard}>
            <Text style={dynamicStyles.goalLabel}>Daily Protein Target</Text>
            {isEditing ? (
              <View style={dynamicStyles.goalValueContainer}>
                <TextInput
                  style={dynamicStyles.goalInput}
                  value={proteinInput}
                  onChangeText={setProteinInput}
                  keyboardType="numeric"
                  placeholder="150"
                  placeholderTextColor={colors.placeholder}
                />
                <Text style={dynamicStyles.goalUnit}>g</Text>
              </View>
            ) : (
              <Text style={dynamicStyles.goalDisplay}>{proteinGoal} g</Text>
            )}
          </View>
        </View>

        {/* Macro Breakdown */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Macro Breakdown</Text>
          <View style={dynamicStyles.goalCard}>
            <View style={dynamicStyles.macroRow}>
              <Text style={dynamicStyles.macroLabel}>Protein</Text>
              <Text style={dynamicStyles.macroValue}>{proteinGoal} g</Text>
            </View>
            <View style={dynamicStyles.macroRow}>
              <Text style={dynamicStyles.macroLabel}>Carbs</Text>
              <Text style={dynamicStyles.macroValue}>{carbsGoal} g</Text>
            </View>
            <View style={[dynamicStyles.macroRow, dynamicStyles.macroRowLast]}>
              <Text style={dynamicStyles.macroLabel}>Fat</Text>
              <Text style={dynamicStyles.macroValue}>{fatGoal} g</Text>
            </View>
            <Text style={dynamicStyles.infoText}>
              Based on 30% protein, 40% carbs, 30% fat split
            </Text>
          </View>
        </View>

        {/* Recalculate Button */}
        <TouchableOpacity
          style={dynamicStyles.recalculateButton}
          onPress={handleRecalculate}
        >
          <Text style={dynamicStyles.recalculateButtonText}>
            🔄 Recalculate Based on Profile
          </Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.infoText}>
          Recalculate your goals based on your current weight, height, age, gender, and activity level
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});

