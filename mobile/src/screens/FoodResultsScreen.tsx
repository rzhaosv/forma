import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FoodRecognitionResult, IdentifiedFood } from '../services/foodRecognitionService';
import { useMealStore } from '../store/useMealStore';
import { Meal, FoodItem, MealType } from '../types/meal.types';
import { trackFoodAccurate, trackFoodEdit } from '../services/aiFeedbackService';
import { useTheme } from '../hooks/useTheme';
import { isHealthKitEnabled } from '../utils/healthKitSettings';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import BadgeCelebrationModal from '../components/BadgeCelebrationModal';
import { checkAndAwardBadges } from '../services/achievementService';
import { triggerSmartReviewPrompt } from '../services/reviewService';
import { badges } from '../config/badgeData';

type RouteParams = {
  FoodResults: {
    result: FoodRecognitionResult;
    existingMealId?: string;
    existingMealType?: MealType;
    logType?: 'photo' | 'voice' | 'manual' | 'barcode';
  };
};

interface EditableFood extends IdentifiedFood {
  quantity: number;
}

export default function FoodResultsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'FoodResults'>>();
  const { result, existingMealId, existingMealType, logType } = route.params;
  const { addMeal, deleteMeal } = useMealStore();
  const { colors, isDark } = useTheme();
  const [healthKitEnabled, setHealthKitEnabled] = useState(false);
  const [celebrationBadgeId, setCelebrationBadgeId] = useState<string | null>(null);
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      isHealthKitEnabled().then(setHealthKitEnabled);
    }
  }, []);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(existingMealType || 'Lunch');

  // Editable food state - initialize with AI results
  const [editableFoods, setEditableFoods] = useState<EditableFood[]>(
    result.foods.map(food => ({ ...food, quantity: 1 }))
  );

  const updateFood = (index: number, updates: Partial<EditableFood>) => {
    setEditableFoods(prev => prev.map((food, i) =>
      i === index ? { ...food, ...updates } : food
    ));
  };

  const handleAddToLog = async () => {
    // If editing, delete the old meal first
    if (existingMealId) {
      deleteMeal(existingMealId);
    }

    const mealId = existingMealId || `meal-${Date.now()}`;

    // Create food items from editable foods (with quantity multiplier)
    const foodItems: FoodItem[] = editableFoods.map((food, index) => ({
      id: `food-${Date.now()}-${index}`,
      name: food.name,
      calories: food.calories * food.quantity,
      protein_g: food.protein_g * food.quantity,
      carbs_g: food.carbs_g * food.quantity,
      fat_g: food.fat_g * food.quantity,
      portion: food.serving_size,
      quantity: food.quantity,
      timestamp: new Date().toISOString(),
    }));

    // Calculate totals
    const totalCalories = foodItems.reduce((sum, food) => sum + food.calories, 0);
    const totalProtein = foodItems.reduce((sum, food) => sum + food.protein_g, 0);
    const totalCarbs = foodItems.reduce((sum, food) => sum + food.carbs_g, 0);
    const totalFat = foodItems.reduce((sum, food) => sum + food.fat_g, 0);

    // Create meal
    const meal: Meal = {
      id: mealId,
      mealType: selectedMealType,
      foods: foodItems,
      timestamp: new Date().toISOString(),
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      logType: logType || 'photo', // Default to photo if not specified
    };

    // Add to store
    addMeal(meal);

    // Track AI feedback - check if user edited anything
    for (let i = 0; i < editableFoods.length; i++) {
      const editedFood = editableFoods[i];
      const originalFood = result.foods[i];

      const wasEdited =
        editedFood.name !== originalFood.name ||
        editedFood.calories !== originalFood.calories ||
        editedFood.protein_g !== originalFood.protein_g ||
        editedFood.carbs_g !== originalFood.carbs_g ||
        editedFood.fat_g !== originalFood.fat_g ||
        editedFood.quantity !== 1;

      if (wasEdited) {
        // Track as edited
        await trackFoodEdit(mealId, foodItems[i].id, {
          name: originalFood.name,
          calories: originalFood.calories,
          protein_g: originalFood.protein_g,
          carbs_g: originalFood.carbs_g,
          fat_g: originalFood.fat_g,
          confidence: originalFood.confidence,
        }, {
          name: editedFood.name,
          calories: editedFood.calories * editedFood.quantity,
          protein_g: editedFood.protein_g * editedFood.quantity,
          carbs_g: editedFood.carbs_g * editedFood.quantity,
          fat_g: editedFood.fat_g * editedFood.quantity,
        });
      } else {
        // Track as accurate
        await trackFoodAccurate(mealId, foodItems[i].id, {
          name: originalFood.name,
          calories: originalFood.calories,
          protein_g: originalFood.protein_g,
          carbs_g: originalFood.carbs_g,
          fat_g: originalFood.fat_g,
          confidence: originalFood.confidence,
        });
      }
    }

    // Check for new achievements after tracking is complete
    let earnedBadges = [];
    try {
      const newBadges = await checkAndAwardBadges();
      earnedBadges = newBadges;
      if (newBadges.length > 0) {
        // Show celebration for the first earned badge
        console.log('New badges earned:', newBadges);
        setCelebrationBadgeId(newBadges[0].badgeId);
        setShowBadgeCelebration(true);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }

    // Only show success alert and navigate if no badges were earned
    // If badge celebration is showing, it will handle navigation when closed
    if (earnedBadges.length === 0) {
      Alert.alert(
        existingMealId ? 'Updated!' : 'Added to Log!',
        existingMealId
          ? `${selectedMealType} updated with ${foodItems.length} item${foodItems.length !== 1 ? 's' : ''}`
          : `${foodItems.length} item${foodItems.length !== 1 ? 's' : ''} added to ${selectedMealType}`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home' as never) }]
      );
    }
  };

  const handleBadgeCelebrationClose = () => {
    // Check if this was a streak badge (win moment for review prompt)
    if (celebrationBadgeId) {
      const badge = badges[celebrationBadgeId];
      if (badge && badge.category === 'streak') {
        // Trigger smart review after streak milestone celebration
        triggerSmartReviewPrompt('streak_milestone');
      }
    }

    setShowBadgeCelebration(false);
    setCelebrationBadgeId(null);

    // Navigate home after closing badge celebration
    navigation.navigate('Home' as never);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    summaryCard: {
      backgroundColor: colors.primary,
      margin: 16,
      padding: 28,
      borderRadius: 20,
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
    summaryLabel: {
      fontSize: 13,
      color: '#FFFFFF',
      opacity: 0.9,
      marginBottom: 8,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    summaryValue: {
      fontSize: 56,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    summaryUnit: {
      fontSize: 16,
      color: '#FFFFFF',
      opacity: 0.8,
      marginBottom: 16,
    },
    itemCount: {
      fontSize: 14,
      color: '#FFFFFF',
      opacity: 0.9,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    foodCard: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    foodNameInput: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      backgroundColor: colors.inputBackground,
      borderWidth: 2,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    inputField: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.inputText,
      backgroundColor: colors.inputBackground,
      borderWidth: 2,
      borderColor: colors.inputBorder,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    mealTypeButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: colors.surfaceSecondary,
      alignItems: 'center',
    },
    mealTypeButtonActive: {
      backgroundColor: colors.primary,
    },
    mealTypeText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    mealTypeTextActive: {
      color: '#FFFFFF',
    },
    macroBox: {
      flex: 1,
      minWidth: '47%',
      backgroundColor: colors.inputBackground,
      borderWidth: 2,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
    },
    macroBoxInput: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      width: '100%',
      paddingVertical: 4,
    },
    totalSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 2,
      borderTopColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      padding: 16,
    },
    totalValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryButtonText: {
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={dynamicStyles.backText}>← Retake</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>
          {existingMealId ? 'Edit Meal' : 'Food Identified'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Summary Card */}
        <View style={dynamicStyles.summaryCard}>
          <Text style={dynamicStyles.summaryLabel}>Total Calories</Text>
          <Text style={dynamicStyles.summaryValue}>
            {Math.round(editableFoods.reduce((sum, food) => sum + (food.calories * food.quantity), 0))}
          </Text>
          <Text style={dynamicStyles.summaryUnit}>kcal</Text>
          <View style={styles.summaryDivider} />
          <Text style={dynamicStyles.itemCount}>
            {editableFoods.length} food item{editableFoods.length !== 1 ? 's' : ''} identified
          </Text>
        </View>

        {/* Meal Type Selector */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Add to Meal</Text>
          <View style={styles.mealTypeSelector}>
            {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  dynamicStyles.mealTypeButton,
                  selectedMealType === type && dynamicStyles.mealTypeButtonActive
                ]}
                onPress={() => setSelectedMealType(type)}
              >
                <Text style={[
                  dynamicStyles.mealTypeText,
                  selectedMealType === type && dynamicStyles.mealTypeTextActive
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Foods List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identified Foods</Text>

          {editableFoods.map((food, index) => {
            const totalCalories = food.calories * food.quantity;
            const totalProtein = food.protein_g * food.quantity;
            const totalCarbs = food.carbs_g * food.quantity;
            const totalFat = food.fat_g * food.quantity;

            return (
              <View key={index} style={dynamicStyles.foodCard}>
                {/* Food Name - Large Editable Box */}
                <View style={styles.foodNameContainer}>
                  <Text style={styles.foodNameLabel}>Food Name</Text>
                  <TextInput
                    style={dynamicStyles.foodNameInput}
                    value={food.name}
                    onChangeText={(text) => updateFood(index, { name: text })}
                    placeholder="Enter food name"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>

                {/* Serving Size - Editable Box */}
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>Serving Size</Text>
                  <TextInput
                    style={dynamicStyles.inputField}
                    value={food.serving_size}
                    onChangeText={(text) => updateFood(index, { serving_size: text })}
                    placeholder="e.g., 150g, 1 cup"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>

                {/* Confidence Badge (read-only) */}
                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceLabel}>AI Confidence:</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>{food.confidence}%</Text>
                  </View>
                </View>

                {/* Quantity Selector */}
                <View style={styles.quantitySection}>
                  <Text style={styles.quantityLabel}>Quantity</Text>
                  <View style={styles.quantityBox}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateFood(index, { quantity: Math.max(0.5, food.quantity - 0.5) })}
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.quantityDisplay}>
                      <Text style={styles.quantityValue}>{food.quantity}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateFood(index, { quantity: food.quantity + 0.5 })}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Editable Macros - Grid Layout */}
                <View style={styles.macrosSection}>
                  <Text style={styles.macrosSectionTitle}>Nutrition (per serving)</Text>
                  <View style={styles.macrosGrid}>
                    <View style={dynamicStyles.macroBox}>
                      <Text style={styles.macroBoxLabel}>Calories</Text>
                      <TextInput
                        style={dynamicStyles.macroBoxInput}
                        value={food.calories.toString()}
                        onChangeText={(text) => {
                          const val = parseFloat(text) || 0;
                          updateFood(index, { calories: val });
                        }}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.placeholder}
                      />
                      <Text style={styles.macroBoxUnit}>cal</Text>
                    </View>
                    <View style={dynamicStyles.macroBox}>
                      <Text style={styles.macroBoxLabel}>Protein</Text>
                      <TextInput
                        style={dynamicStyles.macroBoxInput}
                        value={food.protein_g.toString()}
                        onChangeText={(text) => {
                          const val = parseFloat(text) || 0;
                          updateFood(index, { protein_g: val });
                        }}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.placeholder}
                      />
                      <Text style={styles.macroBoxUnit}>g</Text>
                    </View>
                    <View style={dynamicStyles.macroBox}>
                      <Text style={styles.macroBoxLabel}>Carbs</Text>
                      <TextInput
                        style={dynamicStyles.macroBoxInput}
                        value={food.carbs_g.toString()}
                        onChangeText={(text) => {
                          const val = parseFloat(text) || 0;
                          updateFood(index, { carbs_g: val });
                        }}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.placeholder}
                      />
                      <Text style={styles.macroBoxUnit}>g</Text>
                    </View>
                    <View style={dynamicStyles.macroBox}>
                      <Text style={styles.macroBoxLabel}>Fat</Text>
                      <TextInput
                        style={dynamicStyles.macroBoxInput}
                        value={food.fat_g.toString()}
                        onChangeText={(text) => {
                          const val = parseFloat(text) || 0;
                          updateFood(index, { fat_g: val });
                        }}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.placeholder}
                      />
                      <Text style={styles.macroBoxUnit}>g</Text>
                    </View>
                  </View>
                </View>

                {/* Total Display */}
                <View style={dynamicStyles.totalSection}>
                  <Text style={styles.totalLabel}>Total ({food.quantity} {food.quantity === 1 ? 'serving' : 'servings'})</Text>
                  <View style={styles.totalBox}>
                    <View style={styles.totalItem}>
                      <Text style={dynamicStyles.totalValue}>{totalCalories}</Text>
                      <Text style={styles.totalUnit}>cal</Text>
                    </View>
                    <View style={styles.totalItem}>
                      <Text style={dynamicStyles.totalValue}>{totalProtein.toFixed(1)}</Text>
                      <Text style={styles.totalUnit}>g protein</Text>
                    </View>
                    <View style={styles.totalItem}>
                      <Text style={dynamicStyles.totalValue}>{totalCarbs.toFixed(1)}</Text>
                      <Text style={styles.totalUnit}>g carbs</Text>
                    </View>
                    <View style={styles.totalItem}>
                      <Text style={dynamicStyles.totalValue}>{totalFat.toFixed(1)}</Text>
                      <Text style={styles.totalUnit}>g fat</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={dynamicStyles.primaryButton}
          onPress={handleAddToLog}
        >
          <Text style={dynamicStyles.primaryButtonText}>
            {existingMealId ? 'Update Meal Log' : 'Add to Meal Log'}
          </Text>
        </TouchableOpacity>

        {healthKitEnabled && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
            <Ionicons name="heart" size={14} color="#FF2D55" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '500' }}>
              Synced with Apple Health
            </Text>
          </View>
        )}
      </View>

      {/* Badge Celebration Modal */}
      {celebrationBadgeId && (
        <BadgeCelebrationModal
          visible={showBadgeCelebration}
          badgeId={celebrationBadgeId}
          onClose={handleBadgeCelebrationClose}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#6366F1',
    margin: 16,
    padding: 28,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summaryUnit: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 16,
  },
  summaryDivider: {
    width: 40,
    height: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
    marginBottom: 12,
  },
  itemCount: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  foodCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  foodNameContainer: {
    marginBottom: 16,
  },
  foodNameLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  foodNameInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputBox: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputField: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  confidenceLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 8,
  },
  confidenceBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
  },
  actions: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mealTypeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  mealTypeButtonActive: {
    backgroundColor: '#6366F1',
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  mealTypeTextActive: {
    color: '#FFFFFF',
  },
  quantitySection: {
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  quantityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quantityDisplay: {
    minWidth: 60,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  macrosSection: {
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  macrosSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  macroBox: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  macroBoxLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  macroBoxInput: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 4,
  },
  macroBoxUnit: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  totalSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  totalBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-around',
  },
  totalItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  totalUnit: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
});

