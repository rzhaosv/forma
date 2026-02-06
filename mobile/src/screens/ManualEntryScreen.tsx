import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useMealStore } from '../store/useMealStore';
import { Meal, FoodItem, MealType } from '../types/meal.types';
import { Ionicons } from '@expo/vector-icons';
import BadgeCelebrationModal from '../components/BadgeCelebrationModal';
import { checkAndAwardBadges } from '../services/achievementService';
import { triggerSmartReviewPrompt } from '../services/reviewService';
import { badges } from '../config/badgeData';

type RouteParams = {
  ManualEntry: {
    selectedFood?: FoodItem;
  };
};

export default function ManualEntryScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'ManualEntry'>>();
  const { addMeal } = useMealStore();
  
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [portion, setPortion] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('Lunch');
  const [celebrationBadgeId, setCelebrationBadgeId] = useState<string | null>(null);
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false);

  // Handle food selected from search
  useEffect(() => {
    if (route.params?.selectedFood) {
      const food = route.params.selectedFood;
      setFoodName(food.name);
      setCalories(food.calories.toString());
      setProtein(food.protein_g.toString());
      setCarbs(food.carbs_g.toString());
      setFat(food.fat_g.toString());
      setPortion(food.portion);
      setQuantity(food.quantity.toString());
    }
  }, [route.params]);

  const handleAddFood = async () => {
    // Validation
    if (!foodName.trim()) {
      Alert.alert('Missing Info', 'Please enter a food name');
      return;
    }
    if (!calories.trim() || isNaN(Number(calories))) {
      Alert.alert('Invalid Calories', 'Please enter a valid number for calories');
      return;
    }

    // Use defaults for optional fields
    const proteinValue = protein.trim() ? Number(protein) : 0;
    const carbsValue = carbs.trim() ? Number(carbs) : 0;
    const fatValue = fat.trim() ? Number(fat) : 0;
    const portionValue = portion.trim() || '1 serving';
    const quantityValue = quantity.trim() ? Number(quantity) : 1;

    // Create food item
    const foodItem: FoodItem = {
      id: `food-${Date.now()}`,
      name: foodName.trim(),
      calories: Number(calories),
      protein_g: proteinValue,
      carbs_g: carbsValue,
      fat_g: fatValue,
      portion: portionValue,
      quantity: quantityValue,
      timestamp: new Date().toISOString(),
    };

    // Create meal
    const meal: Meal = {
      id: `meal-${Date.now()}`,
      mealType: selectedMealType,
      foods: [foodItem],
      timestamp: new Date().toISOString(),
      totalCalories: Number(calories) * quantityValue,
      totalProtein: proteinValue * quantityValue,
      totalCarbs: carbsValue * quantityValue,
      totalFat: fatValue * quantityValue,
      logType: 'manual',
    };

    // Add to store
    addMeal(meal);

    // Check for new achievements
    try {
      const newBadges = await checkAndAwardBadges();
      if (newBadges.length > 0) {
        // Show celebration for the first earned badge
        console.log('New badges earned:', newBadges);
        setCelebrationBadgeId(newBadges[0].badgeId);
        setShowBadgeCelebration(true);
        return; // Don't navigate back yet, let badge celebration handle it
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }

    // Navigate back with success message (only if no badge celebration)
    navigation.goBack();
    setTimeout(() => {
      Alert.alert('Added to Log!', `${foodName} added to ${selectedMealType}`);
    }, 500);
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

    // Navigate back after closing badge celebration
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manual Entry</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Search Database Button */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('FoodSearch' as never)}
          >
            <Ionicons name="search" size={32} color="#6366F1" style={{ marginBottom: 8 }} />
            <Text style={styles.searchButtonText}>Search Food Database</Text>
            <Text style={styles.searchButtonSubtext}>Find foods with nutrition data</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or enter manually</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Food Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Food Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Chicken Breast"
              value={foodName}
              onChangeText={setFoodName}
              autoCapitalize="words"
            />
          </View>

          {/* Calories */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Calories *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 250"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
            />
          </View>

          {/* Macros Section */}
          <Text style={styles.sectionTitle}>Macros (optional)</Text>
          
          <View style={styles.macroRow}>
            <View style={[styles.inputGroup, styles.macroInput]}>
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.macroInput]}>
              <Text style={styles.label}>Carbs (g)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.macroInput]}>
              <Text style={styles.label}>Fat (g)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Portion and Quantity */}
          <View style={styles.portionRow}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.label}>Portion</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 100g, 1 cup"
                value={portion}
                onChangeText={setPortion}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Meal Type Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Add to:</Text>
            <View style={styles.mealTypeButtons}>
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

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddFood}>
          <Text style={styles.addButtonText}>Add to Log</Text>
        </TouchableOpacity>
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
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  backText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    width: 60,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    marginTop: 8,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  macroInput: {
    flex: 1,
    marginBottom: 0,
  },
  portionRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  mealTypeButtons: {
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
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  mealTypeTextActive: {
    color: '#FFFFFF',
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  addButton: {
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
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 4,
  },
  searchButtonSubtext: {
    fontSize: 13,
    color: '#6B7280',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
});

