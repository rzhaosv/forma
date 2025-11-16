import React, { useState } from 'react';
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
import { signOut } from '../services/authService';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [currentDate] = useState(new Date());

  // Mock data - will be replaced with Zustand store later
  const caloriesConsumed = 1245;
  const caloriesGoal = 2150;
  const caloriesLeft = caloriesGoal - caloriesConsumed;
  const percentage = Math.round((caloriesConsumed / caloriesGoal) * 100);
  
  const macros = {
    protein: { current: 85, goal: 161 },
    carbs: { current: 120, goal: 242 },
    fat: { current: 45, goal: 72 },
  };

  const meals = [
    {
      id: '1',
      type: 'Breakfast',
      icon: '🌅',
      calories: 385,
      items: [
        { name: 'Oatmeal', calories: 250 },
        { name: 'Banana', calories: 105 },
        { name: 'Coffee', calories: 30 },
      ],
    },
    {
      id: '2',
      type: 'Lunch',
      icon: '☀️',
      calories: 860,
      items: [
        { name: 'Chicken salad', calories: 860 },
      ],
    },
  ];

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
    } else {
      Alert.alert('Manual Entry', 'Coming soon!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>Forma</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </View>

        {/* Calorie Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.calorieRing}>
            <View style={[styles.ringProgress, { borderColor: getProgressColor() }]}>
              <Text style={styles.calorieText}>
                {caloriesConsumed}
                <Text style={styles.calorieGoal}> / {caloriesGoal}</Text>
              </Text>
              <Text style={styles.percentageText}>{percentage}%</Text>
            </View>
          </View>
          
          <Text style={styles.caloriesLeftLabel}>Calories Left</Text>
          <Text style={[styles.caloriesLeft, { color: getProgressColor() }]}>
            {caloriesLeft}
          </Text>

          {/* Macro Progress */}
          <View style={styles.macrosContainer}>
            <View style={styles.macroRow}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>
                {macros.protein.current}g / {macros.protein.goal}g
              </Text>
            </View>
            <View style={styles.macroBar}>
              <View
                style={[
                  styles.macroProgress,
                  {
                    width: `${Math.min((macros.protein.current / macros.protein.goal) * 100, 100)}%`,
                    backgroundColor: '#6366F1',
                  },
                ]}
              />
            </View>

            <View style={styles.macroRow}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>
                {macros.carbs.current}g / {macros.carbs.goal}g
              </Text>
            </View>
            <View style={styles.macroBar}>
              <View
                style={[
                  styles.macroProgress,
                  {
                    width: `${Math.min((macros.carbs.current / macros.carbs.goal) * 100, 100)}%`,
                    backgroundColor: '#34C759',
                  },
                ]}
              />
            </View>

            <View style={styles.macroRow}>
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={styles.macroValue}>
                {macros.fat.current}g / {macros.fat.goal}g
              </Text>
            </View>
            <View style={styles.macroBar}>
              <View
                style={[
                  styles.macroProgress,
                  {
                    width: `${Math.min((macros.fat.current / macros.fat.goal) * 100, 100)}%`,
                    backgroundColor: '#FF9500',
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Quick Add Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
        </View>
        <View style={styles.quickAddContainer}>
          <TouchableOpacity
            style={styles.quickAddButton}
            onPress={() => handleQuickAdd('photo')}
          >
            <Text style={styles.quickAddIcon}>📸</Text>
            <Text style={styles.quickAddText}>Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAddButton}
            onPress={() => handleQuickAdd('barcode')}
          >
            <Text style={styles.quickAddIcon}>📊</Text>
            <Text style={styles.quickAddText}>Barcode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAddButton}
            onPress={() => handleQuickAdd('manual')}
          >
            <Text style={styles.quickAddIcon}>✏️</Text>
            <Text style={styles.quickAddText}>Manual</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Meals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
        </View>

        {meals.map((meal) => (
          <View key={meal.id} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <View style={styles.mealTitleRow}>
                <Text style={styles.mealIcon}>{meal.icon}</Text>
                <Text style={styles.mealType}>{meal.type}</Text>
              </View>
              <Text style={styles.mealCalories}>{meal.calories} cal</Text>
            </View>
            {meal.items.map((item, index) => (
              <View key={index} style={styles.foodItem}>
                <Text style={styles.foodBullet}>○</Text>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodCalories}>{item.calories}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Add Meal Buttons */}
        <TouchableOpacity style={styles.addMealButton}>
          <Text style={styles.addMealText}>+ Add Dinner</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addMealButton}>
          <Text style={styles.addMealText}>+ Add Snack</Text>
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
  },
  ringProgress: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
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
});
