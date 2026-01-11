import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useMealStore } from '../store/useMealStore';
import { FoodItem } from '../types/meal.types';
import { Ionicons } from '@expo/vector-icons';

interface MealDetailScreenProps {
  navigation: any;
  route: any;
}

export default function MealDetailScreen({
  navigation,
  route,
}: MealDetailScreenProps) {
  const { mealId } = route.params;
  const meals = useMealStore((state) => state.meals);
  const deleteMeal = useMealStore((state) => state.deleteMeal);
  const removeFoodFromMeal = useMealStore((state) => state.removeFoodFromMeal);

  const meal = meals.find((m) => m.id === mealId);

  if (!meal) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Meal not found</Text>
      </SafeAreaView>
    );
  }

  const handleDeleteMeal = () => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this entire meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMeal(mealId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleDeleteFood = (foodId: string, foodName: string) => {
    Alert.alert('Remove Food', `Remove ${foodName} from this meal?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeFoodFromMeal(mealId, foodId);
          // If no foods left, go back
          if (meal.foods.length === 1) {
            navigation.goBack();
          }
        },
      },
    ]);
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast':
        return 'sunny';
      case 'lunch':
        return 'partly-sunny';
      case 'dinner':
        return 'moon';
      case 'snack':
        return 'nutrition';
      default:
        return 'restaurant';
    }
  };

  const renderFoodItem = (food: FoodItem) => (
    <View key={food.id} style={styles.foodCard}>
      <View style={styles.foodHeader}>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.foodPortion}>
            {food.portion} × {food.quantity}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteFood(food.id, food.name)}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.nutritionGrid}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>
            {Math.round(food.calories * food.quantity)}
          </Text>
          <Text style={styles.nutritionLabel}>cal</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>
            {Math.round(food.protein_g * food.quantity)}g
          </Text>
          <Text style={styles.nutritionLabel}>protein</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>
            {Math.round(food.carbs_g * food.quantity)}g
          </Text>
          <Text style={styles.nutritionLabel}>carbs</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>
            {Math.round(food.fat_g * food.quantity)}g
          </Text>
          <Text style={styles.nutritionLabel}>fat</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Meal Details</Text>
        <TouchableOpacity onPress={handleDeleteMeal}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Meal Header */}
        <View style={styles.mealHeader}>
          <View style={styles.mealTitleRow}>
            <Ionicons name={getMealIcon(meal.type) as any} size={24} color="#6366F1" style={{ marginRight: 8 }} />
            <Text style={styles.mealType}>
              {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
            </Text>
          </View>
          <Text style={styles.mealTime}>
            {new Date(meal.timestamp).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Total Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Nutrition</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {Math.round(meal.totalCalories)}
              </Text>
              <Text style={styles.summaryLabel}>calories</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {Math.round(meal.totalProtein)}g
              </Text>
              <Text style={styles.summaryLabel}>protein</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {Math.round(meal.totalCarbs)}g
              </Text>
              <Text style={styles.summaryLabel}>carbs</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {Math.round(meal.totalFat)}g
              </Text>
              <Text style={styles.summaryLabel}>fat</Text>
            </View>
          </View>
        </View>

        {/* Foods List */}
        <View style={styles.foodsSection}>
          <Text style={styles.sectionTitle}>
            Foods ({meal.foods.length})
          </Text>
          {meal.foods.map((food) => renderFoodItem(food))}
        </View>
      </ScrollView>
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
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  deleteText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  mealHeader: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 16,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  mealType: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  mealTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryCard: {
    backgroundColor: '#6366F1',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  foodsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  foodCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  foodPortion: {
    fontSize: 14,
    color: '#6B7280',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  nutritionLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
});

