import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FoodRecognitionResult } from '../services/foodRecognitionService';
import { useMealStore } from '../store/useMealStore';
import { Meal, FoodItem, MealType } from '../types/meal.types';
import { trackFoodAccurate } from '../services/aiFeedbackService';

type RouteParams = {
  FoodResults: {
    result: FoodRecognitionResult;
  };
};

export default function FoodResultsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'FoodResults'>>();
  const { result } = route.params;
  const { addMeal } = useMealStore();
  const [selectedMealType, setSelectedMealType] = useState<MealType>('Lunch');

  const handleAddToLog = async () => {
    const mealId = `meal-${Date.now()}`;
    
    // Create food items from recognized foods
    const foodItems: FoodItem[] = result.foods.map((food, index) => ({
      id: `food-${Date.now()}-${index}`,
      name: food.name,
      calories: food.calories,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
      portion: food.serving_size,
      quantity: 1,
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
    };

    // Add to store
    addMeal(meal);

    // Track AI feedback (mark as accurate since user accepted without editing)
    for (let i = 0; i < result.foods.length; i++) {
      const food = result.foods[i];
      await trackFoodAccurate(mealId, foodItems[i].id, {
        name: food.name,
        calories: food.calories,
        protein_g: food.protein_g,
        carbs_g: food.carbs_g,
        fat_g: food.fat_g,
        confidence: food.confidence,
      });
    }

    // Show success and navigate back
    Alert.alert(
      'Added to Log! 🎉',
      `${foodItems.length} item${foodItems.length !== 1 ? 's' : ''} added to ${selectedMealType}`,
      [{ text: 'OK', onPress: () => navigation.navigate('Home' as never) }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Retake</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Food Identified</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Calories</Text>
          <Text style={styles.summaryValue}>{result.total_calories}</Text>
          <Text style={styles.summaryUnit}>kcal</Text>
          <Text style={styles.itemCount}>
            {result.foods.length} item{result.foods.length !== 1 ? 's' : ''} identified
          </Text>
        </View>

        {/* Meal Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add to Meal</Text>
          <View style={styles.mealTypeSelector}>
            {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === type && styles.mealTypeButtonActive
                ]}
                onPress={() => setSelectedMealType(type)}
              >
                <Text style={[
                  styles.mealTypeText,
                  selectedMealType === type && styles.mealTypeTextActive
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
          
          {result.foods.map((food, index) => (
            <View key={index} style={styles.foodCard}>
              <View style={styles.foodHeader}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodCalories}>{food.calories} cal</Text>
              </View>
              
              <View style={styles.foodDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Serving:</Text>
                  <Text style={styles.detailValue}>{food.serving_size}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Confidence:</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>{food.confidence}%</Text>
                  </View>
                </View>
              </View>

              <View style={styles.macrosRow}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{food.protein_g}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{food.carbs_g}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{food.fat_g}g</Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleAddToLog}
        >
          <Text style={styles.primaryButtonText}>Add to Meal Log</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#6366F1',
  },
  summaryUnit: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: -8,
  },
  itemCount: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  foodCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  foodDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  confidenceBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  macroLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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
});

