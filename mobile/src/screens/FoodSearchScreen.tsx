import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { searchFoods, FoodDatabaseItem, calculateNutritionForServing } from '../services/foodDatabaseService';
import { FoodItem, MealType } from '../types/meal.types';
import { useMealStore } from '../store/useMealStore';
import { Meal } from '../types/meal.types';

type RouteParams = {
  FoodSearch: {
    mealType?: MealType;
  };
};

export default function FoodSearchScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'FoodSearch'>>();
  const { addMeal } = useMealStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<FoodDatabaseItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodDatabaseItem | null>(null);
  const [selectedServing, setSelectedServing] = useState<{ label: string; grams: number } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(route.params?.mealType || 'Lunch');

  // Search as user types
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const searchResults = searchFoods(searchQuery);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  const handleSelectFood = (food: FoodDatabaseItem) => {
    setSelectedFood(food);
    // Auto-select first serving size
    if (food.common_servings.length > 0) {
      setSelectedServing(food.common_servings[0]);
    }
  };

  const handleAddToLog = () => {
    if (!selectedFood || !selectedServing) return;

    const nutrition = calculateNutritionForServing(selectedFood, selectedServing.grams * quantity);

    const foodItem: FoodItem = {
      id: `food-${Date.now()}`,
      name: selectedFood.name,
      calories: nutrition.calories,
      protein_g: nutrition.protein_g,
      carbs_g: nutrition.carbs_g,
      fat_g: nutrition.fat_g,
      portion: selectedServing.label,
      quantity: quantity,
      timestamp: new Date().toISOString(),
    };

    // Create meal and add to log
    const meal: Meal = {
      id: `meal-${Date.now()}`,
      mealType: selectedMealType,
      foods: [foodItem],
      timestamp: new Date().toISOString(),
      totalCalories: nutrition.calories,
      totalProtein: nutrition.protein_g,
      totalCarbs: nutrition.carbs_g,
      totalFat: nutrition.fat_g,
    };

    addMeal(meal);

    // Navigate back to home
    navigation.navigate('Home' as never);
  };

  const renderFoodItem = ({ item }: { item: FoodDatabaseItem }) => {
    const nutrition = calculateNutritionForServing(item, 100);
    
    return (
      <TouchableOpacity
        style={styles.foodItem}
        onPress={() => handleSelectFood(item)}
      >
        <View style={styles.foodItemContent}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodCategory}>{item.category}</Text>
          <View style={styles.foodNutrition}>
            <Text style={styles.nutritionText}>
              {nutrition.calories} cal • {nutrition.protein_g}g protein
            </Text>
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  if (selectedFood) {
    const nutrition = selectedServing
      ? calculateNutritionForServing(selectedFood, selectedServing.grams * quantity)
      : calculateNutritionForServing(selectedFood, 100);

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedFood(null)} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Serving</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.selectedFoodContainer}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
          <Text style={styles.selectedFoodCategory}>{selectedFood.category}</Text>

          {/* Serving Size Selection */}
          <View style={styles.servingSection}>
            <Text style={styles.sectionTitle}>Serving Size</Text>
            <View style={styles.servingButtons}>
              {selectedFood.common_servings.map((serving, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.servingButton,
                    selectedServing?.label === serving.label && styles.servingButtonActive
                  ]}
                  onPress={() => setSelectedServing(serving)}
                >
                  <Text style={[
                    styles.servingButtonText,
                    selectedServing?.label === serving.label && styles.servingButtonTextActive
                  ]}>
                    {serving.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(0.1, quantity - 0.5))}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.quantityInput}
                value={quantity.toString()}
                onChangeText={(text) => {
                  const num = parseFloat(text);
                  if (!isNaN(num) && num > 0) {
                    setQuantity(num);
                  } else if (text === '') {
                    setQuantity(0.1);
                  }
                }}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 0.5)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Meal Type Selector */}
          <View style={styles.mealTypeSection}>
            <Text style={styles.sectionTitle}>Add to:</Text>
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

          {/* Nutrition Summary */}
          <View style={styles.nutritionCard}>
            <Text style={styles.nutritionTitle}>Nutrition</Text>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Calories:</Text>
              <Text style={styles.nutritionValue}>{nutrition.calories}</Text>
            </View>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Protein:</Text>
              <Text style={styles.nutritionValue}>{nutrition.protein_g}g</Text>
            </View>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Carbs:</Text>
              <Text style={styles.nutritionValue}>{nutrition.carbs_g}g</Text>
            </View>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Fat:</Text>
              <Text style={styles.nutritionValue}>{nutrition.fat_g}g</Text>
            </View>
          </View>
        </ScrollView>

        {/* Add Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddToLog}>
            <Text style={styles.addButtonText}>Add to Log</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Search Foods</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search foods (e.g., chicken, rice, apple)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
      </View>

      {/* Results */}
      {searchQuery.trim().length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Start typing to search foods</Text>
          <Text style={styles.emptyStateSubtext}>
            Search by name or category (e.g., "protein", "grains")
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No foods found</Text>
          <Text style={styles.emptyStateSubtext}>
            Try a different search term or search for the food category
          </Text>
          <Text style={[styles.emptyStateSubtext, { marginTop: 8, fontStyle: 'italic' }]}>
            Tip: Search by ingredient name (e.g., "rice", "beef") or category (e.g., "protein", "vegetables")
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id}
          style={styles.resultsList}
          contentContainerStyle={styles.resultsContent}
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
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    padding: 20,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  foodItemContent: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  foodCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  foodNutrition: {
    flexDirection: 'row',
  },
  nutritionText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  chevron: {
    fontSize: 24,
    color: '#9CA3AF',
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
  scrollView: {
    flex: 1,
  },
  selectedFoodContainer: {
    padding: 20,
    paddingBottom: 100, // Extra padding for bottom bar
  },
  selectedFoodName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  selectedFoodCategory: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  servingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  servingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  servingButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  servingButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  servingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  servingButtonTextActive: {
    color: '#6366F1',
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quantityValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 24,
    minWidth: 40,
    textAlign: 'center',
  },
  quantityInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 24,
    minWidth: 80,
    textAlign: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  nutritionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  nutritionLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  addButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mealTypeSection: {
    marginBottom: 24,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
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
});

