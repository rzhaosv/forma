import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useMealStore } from '../store/useMealStore';
import { Meal } from '../types/meal.types';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const dailySummary = useMealStore((state) => state.dailySummary);
  const updateDailySummary = useMealStore((state) => state.updateDailySummary);

  useEffect(() => {
    updateDailySummary();
  }, []);

  const caloriesRemaining = dailySummary
    ? dailySummary.calorieGoal - dailySummary.totalCalories
    : 0;
  const proteinRemaining = dailySummary
    ? dailySummary.proteinGoal - dailySummary.totalProtein
    : 0;
  const caloriesPercent = dailySummary
    ? Math.min((dailySummary.totalCalories / dailySummary.calorieGoal) * 100, 100)
    : 0;

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  const renderMealCard = (meal: Meal) => (
    <TouchableOpacity
      key={meal.id}
      style={styles.mealCard}
      onPress={() => navigation.navigate('MealDetail', { mealId: meal.id })}
    >
      <View style={styles.mealHeader}>
        <View style={styles.mealTitleRow}>
          <Text style={styles.mealIcon}>{getMealIcon(meal.type)}</Text>
          <Text style={styles.mealType}>
            {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
          </Text>
        </View>
        <Text style={styles.mealCalories}>{Math.round(meal.totalCalories)} cal</Text>
      </View>
      <View style={styles.mealFoods}>
        {meal.foods.slice(0, 3).map((food, index) => (
          <Text key={food.id} style={styles.foodName} numberOfLines={1}>
            • {food.name} ({food.portion})
          </Text>
        ))}
        {meal.foods.length > 3 && (
          <Text style={styles.foodName}>+ {meal.foods.length - 3} more</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>📊 Forma</Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Calorie Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.calorieCircle}>
            <Text style={styles.calorieNumber}>
              {dailySummary ? Math.round(dailySummary.totalCalories) : 0}
            </Text>
            <Text style={styles.calorieLabel}>calories</Text>
          </View>
          <View style={styles.summaryDetails}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Goal</Text>
              <Text style={styles.summaryValue}>
                {dailySummary ? dailySummary.calorieGoal : 2000} cal
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Remaining</Text>
              <Text
                style={[
                  styles.summaryValue,
                  caloriesRemaining < 0 && styles.overGoal,
                ]}
              >
                {Math.round(caloriesRemaining)} cal
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${caloriesPercent}%` },
                  caloriesPercent > 100 && styles.progressOverGoal,
                ]}
              />
            </View>
          </View>
        </View>

        {/* Macros Card */}
        <View style={styles.macrosCard}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>
              {dailySummary ? Math.round(dailySummary.totalProtein) : 0}g
            </Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>
              {dailySummary ? Math.round(dailySummary.totalCarbs) : 0}g
            </Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>
              {dailySummary ? Math.round(dailySummary.totalFat) : 0}g
            </Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>

        {/* Meals Section */}
        <View style={styles.mealsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
          </View>

          {dailySummary && dailySummary.meals.length > 0 ? (
            dailySummary.meals.map((meal) => renderMealCard(meal))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyText}>No meals logged yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the camera button below to scan your first meal
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Meal Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.addButtonIcon}>📸</Text>
          <Text style={styles.addButtonText}>Scan Food</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButtonSecondary}
          onPress={() => navigation.navigate('AddFood')}
        >
          <Text style={styles.addButtonIcon}>➕</Text>
          <Text style={styles.addButtonText}>Add Manually</Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFF',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryCard: {
    backgroundColor: '#6366F1',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calorieCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  calorieNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  calorieLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  summaryDetails: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  overGoal: {
    color: '#FEE2E2',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  progressOverGoal: {
    backgroundColor: '#FEE2E2',
  },
  macrosCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  macroLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  mealsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  mealCard: {
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
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  mealType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
  },
  mealFoods: {
    gap: 4,
  },
  foodName: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonSecondary: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonIcon: {
    fontSize: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

