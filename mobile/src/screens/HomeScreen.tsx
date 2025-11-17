import React, { useState, useEffect } from 'react';
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
import { Swipeable } from 'react-native-gesture-handler';
import Svg, { Circle } from 'react-native-svg';
import { signOut } from '../services/authService';
import { useMealStore } from '../store/useMealStore';
import { useTheme } from '../hooks/useTheme';

const MEAL_TYPE_ICONS = {
  Breakfast: '🌅',
  Lunch: '☀️',
  Dinner: '🌙',
  Snack: '🍎',
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [currentDate] = useState(new Date());
  const { colors, isDark } = useTheme();
  
  // Get real meal data from store
  const { meals, dailySummary, calorieGoal, proteinGoal, updateDailySummary, deleteMeal } = useMealStore();
  
  // Update summary when screen loads or meals change
  useEffect(() => {
    updateDailySummary();
  }, [meals]);
  
  // Calculate values from real data
  const caloriesConsumed = dailySummary?.totalCalories || 0;
  const caloriesLeft = calorieGoal - caloriesConsumed;
  const percentage = Math.round((caloriesConsumed / calorieGoal) * 100);
  
  const macros = {
    protein: { 
      current: Math.round(dailySummary?.totalProtein || 0), 
      goal: proteinGoal 
    },
    carbs: { 
      current: Math.round(dailySummary?.totalCarbs || 0), 
      goal: Math.round(calorieGoal * 0.5 / 4) // 50% of calories from carbs
    },
    fat: { 
      current: Math.round(dailySummary?.totalFat || 0), 
      goal: Math.round(calorieGoal * 0.3 / 9) // 30% of calories from fat
    },
  };
  
  // Get today's meals grouped by type
  const today = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter(meal => meal.timestamp.startsWith(today));

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = () => {
    return currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getProgressColor = () => {
    if (percentage > 100) return '#FF3B30'; // Red - over goal
    if (percentage > 80) return '#FF9500'; // Orange - warning
    return '#34C759'; // Green - on track
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleQuickAdd = (type: string) => {
    if (type === 'photo') {
      navigation.navigate('Camera' as never);
    } else if (type === 'barcode') {
      navigation.navigate('BarcodeScanner' as never);
    } else if (type === 'manual') {
      // Navigate directly to food search for better UX
      navigation.navigate('FoodSearch' as never);
    }
  };

  const handleDeleteMeal = (mealId: string, mealType: string) => {
    Alert.alert(
      'Delete Meal',
      `Are you sure you want to delete this ${mealType}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMeal(mealId);
          },
        },
      ]
    );
  };

  const renderRightActions = (mealId: string, mealType: string) => {
    return (
      <View style={styles.swipeDeleteContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMeal(mealId, mealType)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
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
      paddingTop: 20,
      paddingBottom: 10,
      backgroundColor: colors.background,
    },
    appName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    signOutButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 8,
    },
    signOutText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    date: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
    progressCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
      alignItems: 'center',
    },
    calorieText: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    calorieGoal: {
      fontSize: 18,
      color: colors.textSecondary,
    },
    percentageText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    caloriesLeftLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
    },
    macroLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      width: 60,
    },
    macroValue: {
      fontSize: 14,
      color: colors.textSecondary,
      marginRight: 10,
    },
    macroBar: {
      flex: 1,
      height: 8,
      backgroundColor: colors.divider,
      borderRadius: 4,
      overflow: 'hidden',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    quickAddButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    quickAddText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    mealCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      borderRadius: 16,
      padding: 15,
      marginBottom: 15,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 8,
      elevation: 3,
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
    foodName: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },
    addMealButton: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginTop: 10,
      paddingVertical: 15,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
    },
    addMealText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
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
      color: colors.textTertiary,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.appName}>Forma</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings' as never)}
            style={[dynamicStyles.signOutButton, { marginRight: 0 }]}
          >
            <Text style={dynamicStyles.signOutText}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut} style={dynamicStyles.signOutButton}>
            <Text style={dynamicStyles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={dynamicStyles.greeting}>{getGreeting()}! 👋</Text>
          <Text style={dynamicStyles.date}>{formatDate()}</Text>
        </View>

        {/* Calorie Progress Card */}
        <View style={dynamicStyles.progressCard}>
          <View style={styles.calorieRing}>
            {/* SVG Circle Progress */}
            <Svg width="180" height="180" style={styles.svgContainer}>
              {/* Background Circle (gray) */}
              <Circle
                cx="90"
                cy="90"
                r="76"
                stroke={colors.divider}
                strokeWidth="14"
                fill="none"
              />
              {/* Progress Circle (colored, fills based on percentage, caps at 100%) */}
              <Circle
                cx="90"
                cy="90"
                r="76"
                stroke={getProgressColor()}
                strokeWidth="14"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 76}`}
                strokeDashoffset={`${2 * Math.PI * 76 * (1 - Math.min(percentage, 100) / 100)}`}
                strokeLinecap="round"
                rotation="-90"
                origin="90, 90"
              />
            </Svg>
            
            {/* Center Text Overlay */}
            <View style={styles.centerTextContainer}>
              <Text style={dynamicStyles.calorieText}>
                {caloriesConsumed}
                <Text style={dynamicStyles.calorieGoal}> / {calorieGoal}</Text>
              </Text>
              <Text style={dynamicStyles.percentageText}>{percentage}%</Text>
            </View>
          </View>
          
          <Text style={dynamicStyles.caloriesLeftLabel}>Calories Left</Text>
          <Text style={[styles.caloriesLeft, { color: getProgressColor() }]}>
            {caloriesLeft}
          </Text>

          {/* Macro Progress */}
          <View style={styles.macrosContainer}>
            <View style={styles.macroRow}>
              <Text style={dynamicStyles.macroLabel}>Protein</Text>
              <Text style={dynamicStyles.macroValue}>
                {macros.protein.current}g / {macros.protein.goal}g
              </Text>
            </View>
            <View style={dynamicStyles.macroBar}>
              <View
                style={[
                  styles.macroProgress,
                  {
                    width: `${Math.min((macros.protein.current / macros.protein.goal) * 100, 100)}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>

            <View style={styles.macroRow}>
              <Text style={dynamicStyles.macroLabel}>Carbs</Text>
              <Text style={dynamicStyles.macroValue}>
                {macros.carbs.current}g / {macros.carbs.goal}g
              </Text>
            </View>
            <View style={dynamicStyles.macroBar}>
              <View
                style={[
                  styles.macroProgress,
                  {
                    width: `${Math.min((macros.carbs.current / macros.carbs.goal) * 100, 100)}%`,
                    backgroundColor: colors.success,
                  },
                ]}
              />
            </View>

            <View style={styles.macroRow}>
              <Text style={dynamicStyles.macroLabel}>Fat</Text>
              <Text style={dynamicStyles.macroValue}>
                {macros.fat.current}g / {macros.fat.goal}g
              </Text>
            </View>
            <View style={dynamicStyles.macroBar}>
              <View
                style={[
                  styles.macroProgress,
                  {
                    width: `${Math.min((macros.fat.current / macros.fat.goal) * 100, 100)}%`,
                    backgroundColor: colors.warning,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Quick Add Section */}
        <View style={styles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>Quick Add</Text>
        </View>
        <View style={styles.quickAddContainer}>
          <TouchableOpacity
            style={dynamicStyles.quickAddButton}
            onPress={() => handleQuickAdd('photo')}
          >
            <Text style={styles.quickAddIcon}>📸</Text>
            <Text style={dynamicStyles.quickAddText}>Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.quickAddButton}
            onPress={() => handleQuickAdd('barcode')}
          >
            <Text style={styles.quickAddIcon}>📊</Text>
            <Text style={dynamicStyles.quickAddText}>Barcode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.quickAddButton}
            onPress={() => handleQuickAdd('manual')}
          >
            <Text style={styles.quickAddIcon}>✏️</Text>
            <Text style={dynamicStyles.quickAddText}>Manual</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Meals */}
        <View style={styles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>Today's Meals</Text>
        </View>

        {todayMeals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🍽️</Text>
            <Text style={dynamicStyles.emptyStateText}>No meals logged yet today</Text>
            <Text style={dynamicStyles.emptyStateSubtext}>Use Quick Add to log your first meal!</Text>
          </View>
        ) : (
          todayMeals.map((meal) => (
            <Swipeable
              key={meal.id}
              renderRightActions={() => renderRightActions(meal.id, meal.mealType)}
              overshootRight={false}
              rightThreshold={40}
            >
              <View style={dynamicStyles.mealCard}>
                <View style={styles.mealHeader}>
                  <View style={styles.mealTitleRow}>
                    <Text style={styles.mealIcon}>
                      {MEAL_TYPE_ICONS[meal.mealType as keyof typeof MEAL_TYPE_ICONS] || '🍽️'}
                    </Text>
                    <Text style={dynamicStyles.mealType}>{meal.mealType}</Text>
                  </View>
                  <Text style={dynamicStyles.mealCalories}>{Math.round(meal.totalCalories)} cal</Text>
                </View>
                {meal.foods.map((food) => (
                  <View key={food.id} style={styles.foodItem}>
                    <Text style={styles.foodBullet}>○</Text>
                    <Text style={dynamicStyles.foodName}>
                      {food.name} {food.quantity > 1 ? `(${food.quantity}x)` : ''}
                    </Text>
                    <Text style={styles.foodCalories}>
                      {Math.round(food.calories * food.quantity)}
                    </Text>
                  </View>
                ))}
              </View>
            </Swipeable>
          ))
        )}

        {/* Quick Add Meal Type Buttons */}
            {!todayMeals.some(m => m.mealType === 'Breakfast') && (
              <TouchableOpacity 
                style={dynamicStyles.addMealButton}
                onPress={() => handleQuickAdd('photo')}
              >
                <Text style={dynamicStyles.addMealText}>+ Add Breakfast</Text>
              </TouchableOpacity>
            )}
            
            {!todayMeals.some(m => m.mealType === 'Lunch') && (
              <TouchableOpacity 
                style={dynamicStyles.addMealButton}
                onPress={() => handleQuickAdd('photo')}
              >
                <Text style={dynamicStyles.addMealText}>+ Add Lunch</Text>
              </TouchableOpacity>
            )}
            
            {!todayMeals.some(m => m.mealType === 'Dinner') && (
              <TouchableOpacity 
                style={dynamicStyles.addMealButton}
                onPress={() => handleQuickAdd('photo')}
              >
                <Text style={dynamicStyles.addMealText}>+ Add Dinner</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={dynamicStyles.addMealButton}
              onPress={() => handleQuickAdd('photo')}
            >
              <Text style={dynamicStyles.addMealText}>+ Add Snack</Text>
            </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  signOutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  signOutText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#6B7280',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  calorieRing: {
    marginBottom: 16,
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calorieText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  calorieGoal: {
    fontSize: 18,
    fontWeight: '400',
    color: '#6B7280',
  },
  percentageText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  caloriesLeftLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  caloriesLeft: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
  },
  macrosContainer: {
    width: '100%',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  macroValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  macroBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  macroProgress: {
    height: '100%',
    borderRadius: 3,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  quickAddContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickAddButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 100,
  },
  quickAddIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickAddText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
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
    fontSize: 20,
    marginRight: 8,
  },
  mealType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  foodBullet: {
    fontSize: 16,
    color: '#9CA3AF',
    marginRight: 8,
  },
  foodName: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  foodCalories: {
    fontSize: 15,
    color: '#6B7280',
  },
  addMealButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addMealText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
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
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  swipeDeleteContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
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
