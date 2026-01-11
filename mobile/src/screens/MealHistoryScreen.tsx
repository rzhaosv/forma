import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMealStore } from '../store/useMealStore';
import { Meal, DailySummary } from '../types/meal.types';
import { useTheme } from '../hooks/useTheme';
import { Swipeable } from 'react-native-gesture-handler';

import { getLocalDateString, parseLocalDate, isDateToday, isDateYesterday } from '../utils/dateUtils';

const MEAL_TYPE_ICONS = {
  Breakfast: '🌅',
  Lunch: '☀️',
  Dinner: '🌙',
  Snack: '🍎',
};

export default function MealHistoryScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { meals, calorieGoal, proteinGoal, deleteMeal } = useMealStore();

  const [selectedDate, setSelectedDate] = useState(new Date());


  // Get all unique dates with meals, sorted descending
  const datesWithMeals = useMemo(() => {
    const dateSet = new Set<string>();
    meals.forEach(meal => {
      const date = getLocalDateString(new Date(meal.timestamp));
      dateSet.add(date);
    });
    return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  }, [meals]);

  // Get meals for selected date
  const selectedDateMeals = useMemo(() => {
    const dateStr = getLocalDateString(selectedDate);
    return meals
      .filter(meal => getLocalDateString(new Date(meal.timestamp)) === dateStr)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }, [meals, selectedDate]);

  // Calculate daily totals for selected date
  const dailyTotals = useMemo(() => {
    return selectedDateMeals.reduce(
      (totals, meal) => ({
        totalCalories: totals.totalCalories + meal.totalCalories,
        totalProtein: totals.totalProtein + meal.totalProtein,
        totalCarbs: totals.totalCarbs + meal.totalCarbs,
        totalFat: totals.totalFat + meal.totalFat,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
    );
  }, [selectedDateMeals]);

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const formatDate = (date: Date) => {
    if (isDateToday(date)) return 'Today';
    if (isDateYesterday(date)) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderRightActions = (mealId: string, mealType: string) => {
    return (
      <View style={styles.swipeDeleteContainer}>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.error }]}
          onPress={() => {
            deleteMeal(mealId);
          }}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMeal = (meal: Meal) => {
    const dynamicStyles = StyleSheet.create({
      mealCard: {
        backgroundColor: colors.surface,
        marginBottom: 12,
        borderRadius: 16,
        padding: 15,
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.05,
        shadowRadius: 8,
        elevation: 3,
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
        fontSize: 20,
        marginRight: 8,
      },
      mealType: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
      },
      mealCalories: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textSecondary,
      },
      foodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
      },
      foodBullet: {
        fontSize: 16,
        color: colors.textTertiary,
        marginRight: 8,
      },
      foodName: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
      },
      foodCalories: {
        fontSize: 15,
        color: colors.textSecondary,
      },
    });

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(meal.id, meal.mealType)}
        overshootRight={false}
        rightThreshold={40}
      >
        <View style={dynamicStyles.mealCard}>
          <View style={dynamicStyles.mealHeader}>
            <View style={dynamicStyles.mealTitleRow}>
              <Text style={dynamicStyles.mealIcon}>
                {MEAL_TYPE_ICONS[meal.mealType as keyof typeof MEAL_TYPE_ICONS] || '🍽️'}
              </Text>
              <Text style={dynamicStyles.mealType}>{meal.mealType}</Text>
            </View>
            <Text style={dynamicStyles.mealCalories}>{Math.round(meal.totalCalories)} cal</Text>
          </View>
          {meal.foods.map((food) => (
            <View key={food.id} style={dynamicStyles.foodItem}>
              <Text style={dynamicStyles.foodBullet}>○</Text>
              <Text style={dynamicStyles.foodName}>
                {food.name} {food.quantity > 1 ? `(${food.quantity}x)` : ''}
              </Text>
              <Text style={dynamicStyles.foodCalories}>
                {Math.round(food.calories * food.quantity)} cal
              </Text>
            </View>
          ))}
        </View>
      </Swipeable>
    );
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
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    dateNavigator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dateNavButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.surfaceSecondary,
    },
    dateNavButtonText: {
      fontSize: 18,
      color: colors.primary,
      fontWeight: '600',
    },
    dateDisplay: {
      alignItems: 'center',
      flex: 1,
    },
    dateText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    dateSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    todayButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.primary,
      borderRadius: 8,
      marginLeft: 12,
    },
    todayButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    summaryCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 16,
      borderRadius: 16,
      padding: 20,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    summaryRowLast: {
      borderBottomWidth: 0,
    },
    summaryLabel: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    summaryProgress: {
      height: 6,
      backgroundColor: colors.divider,
      borderRadius: 3,
      marginTop: 4,
      overflow: 'hidden',
    },
    summaryProgressFill: {
      height: '100%',
      borderRadius: 3,
    },
    mealsSection: {
      paddingHorizontal: 20,
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
      paddingHorizontal: 32,
    },
    emptyStateIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyStateText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    datesList: {
      maxHeight: 200,
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginTop: 16,
      borderRadius: 12,
      padding: 8,
    },
    dateListItem: {
      padding: 12,
      borderRadius: 8,
      marginBottom: 4,
    },
    dateListItemActive: {
      backgroundColor: colors.primary + '20',
    },
    dateListItemText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    dateListItemTextActive: {
      color: colors.primary,
      fontWeight: '700',
    },
  });

  const selectedDateStr = getLocalDateString(selectedDate);
  const isTodayActive = isDateToday(selectedDate);
  const caloriesPercentage = calorieGoal > 0 ? Math.min((dailyTotals.totalCalories / calorieGoal) * 100, 100) : 0;
  const proteinPercentage = proteinGoal > 0 ? Math.min((dailyTotals.totalProtein / proteinGoal) * 100, 100) : 0;

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
        <Text style={dynamicStyles.title}>Meal History</Text>
      </View>

      {/* Date Navigator */}
      <View style={dynamicStyles.dateNavigator}>
        <TouchableOpacity
          style={dynamicStyles.dateNavButton}
          onPress={() => navigateDate(-1)}
        >
          <Text style={dynamicStyles.dateNavButtonText}>←</Text>
        </TouchableOpacity>

        <View style={dynamicStyles.dateDisplay}>
          <Text style={dynamicStyles.dateText}>{formatDate(selectedDate)}</Text>
          <Text style={dynamicStyles.dateSubtext}>{formatDateShort(selectedDate)}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={dynamicStyles.dateNavButton}
            onPress={() => navigateDate(1)}
            disabled={isTodayActive}
          >
            <Text style={[dynamicStyles.dateNavButtonText, isTodayActive && { opacity: 0.3 }]}>→</Text>
          </TouchableOpacity>
          {!isTodayActive && (
            <TouchableOpacity
              style={dynamicStyles.todayButton}
              onPress={goToToday}
            >
              <Text style={dynamicStyles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quick Date List */}
        {datesWithMeals.length > 0 && (
          <View style={dynamicStyles.datesList}>
            <Text style={[dynamicStyles.sectionTitle, { fontSize: 14, marginBottom: 8, paddingHorizontal: 4 }]}>
              Quick Jump
            </Text>
            {datesWithMeals.slice(0, 7).map((dateStr) => {
              const date = parseLocalDate(dateStr);
              const isSelected = dateStr === selectedDateStr;

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[
                    dynamicStyles.dateListItem,
                    isSelected && dynamicStyles.dateListItemActive,
                  ]}
                  onPress={() => {
                    setSelectedDate(date);
                  }}
                >
                  <Text
                    style={[
                      dynamicStyles.dateListItemText,
                      isSelected && dynamicStyles.dateListItemTextActive,
                    ]}
                  >
                    {formatDate(date)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Daily Summary */}
        <View style={dynamicStyles.summaryCard}>
          <Text style={dynamicStyles.summaryTitle}>Daily Summary</Text>

          <View style={dynamicStyles.summaryRow}>
            <Text style={dynamicStyles.summaryLabel}>Calories</Text>
            <Text style={dynamicStyles.summaryValue}>
              {Math.round(dailyTotals.totalCalories)} / {calorieGoal} kcal
            </Text>
          </View>
          <View style={dynamicStyles.summaryProgress}>
            <View
              style={[
                dynamicStyles.summaryProgressFill,
                {
                  width: `${caloriesPercentage}%`,
                  backgroundColor: caloriesPercentage > 100 ? colors.error : colors.primary,
                },
              ]}
            />
          </View>

          <View style={dynamicStyles.summaryRow}>
            <Text style={dynamicStyles.summaryLabel}>Protein</Text>
            <Text style={dynamicStyles.summaryValue}>
              {Math.round(dailyTotals.totalProtein)} / {proteinGoal} g
            </Text>
          </View>
          <View style={dynamicStyles.summaryProgress}>
            <View
              style={[
                dynamicStyles.summaryProgressFill,
                {
                  width: `${proteinPercentage}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>

          <View style={dynamicStyles.summaryRow}>
            <Text style={dynamicStyles.summaryLabel}>Carbs</Text>
            <Text style={dynamicStyles.summaryValue}>{Math.round(dailyTotals.totalCarbs)} g</Text>
          </View>

          <View style={[dynamicStyles.summaryRow, dynamicStyles.summaryRowLast]}>
            <Text style={dynamicStyles.summaryLabel}>Fat</Text>
            <Text style={dynamicStyles.summaryValue}>{Math.round(dailyTotals.totalFat)} g</Text>
          </View>
        </View>

        {/* Meals List */}
        <View style={dynamicStyles.mealsSection}>
          <Text style={dynamicStyles.sectionTitle}>Meals</Text>

          {selectedDateMeals.length === 0 ? (
            <View style={dynamicStyles.emptyState}>
              <Text style={dynamicStyles.emptyStateIcon}>🍽️</Text>
              <Text style={dynamicStyles.emptyStateText}>No meals logged</Text>
              <Text style={dynamicStyles.emptyStateSubtext}>
                {isTodayActive
                  ? 'Start logging your meals today!'
                  : 'No meals were logged on this date'}
              </Text>
            </View>
          ) : (
            selectedDateMeals.map((meal) => (
              <View key={meal.id}>
                {renderMeal(meal)}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  swipeDeleteContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
