import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useMealStore } from '../store/useMealStore';
import { Meal, MealType } from '../types/meal.types';
import { Ionicons } from '@expo/vector-icons';

interface AddFoodScreenProps {
  navigation: any;
}

export default function AddFoodScreen({ navigation }: AddFoodScreenProps) {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [portion, setPortion] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');

  const addMeal = useMealStore((state) => state.addMeal);
  const meals = useMealStore((state) => state.meals);

  const handleSave = () => {
    // Validation
    if (!foodName.trim()) {
      Alert.alert('Error', 'Please enter food name');
      return;
    }
    if (!calories || isNaN(Number(calories))) {
      Alert.alert('Error', 'Please enter valid calories');
      return;
    }
    if (!portion.trim()) {
      Alert.alert('Error', 'Please enter portion size');
      return;
    }

    // Check if meal for this type exists today
    const today = new Date().toISOString();
    const existingMeal = meals.find(
      (m) =>
        m.type === selectedMealType &&
        m.timestamp.startsWith(today.split('T')[0])
    );

    const foodItem = {
      id: Date.now().toString(),
      name: foodName.trim(),
      calories: Number(calories),
      protein_g: Number(protein) || 0,
      carbs_g: Number(carbs) || 0,
      fat_g: Number(fat) || 0,
      portion: portion.trim(),
      quantity: Number(quantity) || 1,
      timestamp: today,
    };

    if (existingMeal) {
      // Add to existing meal
      const updatedMeal: Meal = {
        ...existingMeal,
        foods: [...existingMeal.foods, foodItem],
        totalCalories: existingMeal.totalCalories + foodItem.calories * foodItem.quantity,
        totalProtein: existingMeal.totalProtein + foodItem.protein_g * foodItem.quantity,
        totalCarbs: existingMeal.totalCarbs + foodItem.carbs_g * foodItem.quantity,
        totalFat: existingMeal.totalFat + foodItem.fat_g * foodItem.quantity,
      };
      
      // Remove old meal and add updated one
      useMealStore.setState((state) => ({
        meals: state.meals.map((m) =>
          m.id === existingMeal.id ? updatedMeal : m
        ),
      }));
    } else {
      // Create new meal
      const newMeal: Meal = {
        id: Date.now().toString(),
        type: selectedMealType,
        foods: [foodItem],
        timestamp: today,
        totalCalories: foodItem.calories * foodItem.quantity,
        totalProtein: foodItem.protein_g * foodItem.quantity,
        totalCarbs: foodItem.carbs_g * foodItem.quantity,
        totalFat: foodItem.fat_g * foodItem.quantity,
      };
      addMeal(newMeal);
    }

    Alert.alert('Success', 'Food added to meal!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const mealTypes: { type: MealType; icon: string; label: string }[] = [
    { type: 'breakfast', icon: 'sunny', label: 'Breakfast' },
    { type: 'lunch', icon: 'partly-sunny', label: 'Lunch' },
    { type: 'dinner', icon: 'moon', label: 'Dinner' },
    { type: 'snack', icon: 'nutrition', label: 'Snack' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Food</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Meal Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Type</Text>
          <View style={styles.mealTypeGrid}>
            {mealTypes.map((meal) => (
              <TouchableOpacity
                key={meal.type}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === meal.type && styles.mealTypeButtonActive,
                ]}
                onPress={() => setSelectedMealType(meal.type)}
              >
                <Ionicons
                  name={meal.icon as any}
                  size={28}
                  color={selectedMealType === meal.type ? '#6366F1' : '#6B7280'}
                  style={{ marginBottom: 4 }}
                />
                <Text
                  style={[
                    styles.mealTypeLabel,
                    selectedMealType === meal.type && styles.mealTypeLabelActive,
                  ]}
                >
                  {meal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Food Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Details</Text>

          <TextInput
            style={styles.input}
            placeholder="Food name (e.g., Chicken Breast)"
            value={foodName}
            onChangeText={setFoodName}
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="Portion (e.g., 100g)"
              value={portion}
              onChangeText={setPortion}
            />
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="Quantity"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
          </View>
        </View>

        {/* Nutrition Facts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Facts</Text>

          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Calories *</Text>
            <TextInput
              style={styles.nutritionInput}
              placeholder="0"
              keyboardType="numeric"
              value={calories}
              onChangeText={setCalories}
            />
          </View>

          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Protein (g)</Text>
            <TextInput
              style={styles.nutritionInput}
              placeholder="0"
              keyboardType="numeric"
              value={protein}
              onChangeText={setProtein}
            />
          </View>

          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Carbs (g)</Text>
            <TextInput
              style={styles.nutritionInput}
              placeholder="0"
              keyboardType="numeric"
              value={carbs}
              onChangeText={setCarbs}
            />
          </View>

          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Fat (g)</Text>
            <TextInput
              style={styles.nutritionInput}
              placeholder="0"
              keyboardType="numeric"
              value={fat}
              onChangeText={setFat}
            />
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Add to {selectedMealType}</Text>
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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealTypeButton: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  mealTypeButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  mealTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  mealTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  mealTypeLabelActive: {
    color: '#6366F1',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  nutritionLabel: {
    fontSize: 16,
    color: '#374151',
  },
  nutritionInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#111827',
    minWidth: 80,
    textAlign: 'right',
  },
  spacer: {
    height: 100,
  },
  footer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

