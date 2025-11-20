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
import { useRecipeStore } from '../store/useRecipeStore';
import { useMealStore } from '../store/useMealStore';
import { Recipe, RecipeIngredient } from '../types/meal.types';
import { FoodItem, MealType } from '../types/meal.types';
import { useTheme } from '../hooks/useTheme';
import { searchFoods, FoodDatabaseItem } from '../services/foodDatabaseService';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { getSubscriptionLimits } from '../utils/subscriptionLimits';
import PaywallModal from '../components/PaywallModal';

type RouteParams = {
  RecipeBuilder: {
    recipeId?: string;
    mealType?: MealType;
  };
};

export default function RecipeBuilderScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'RecipeBuilder'>>();
  const { colors, isDark } = useTheme();
  const { recipes, addRecipe, updateRecipe, getRecipe } = useRecipeStore();
  const { addMeal } = useMealStore();
  const { isPremium } = useSubscriptionStore();
  const [showPaywall, setShowPaywall] = useState(false);
  
  const editingRecipe = route.params?.recipeId ? getRecipe(route.params.recipeId) : null;
  const mealType = route.params?.mealType || 'Lunch';

  // Check if recipe builder is allowed
  useEffect(() => {
    const limits = getSubscriptionLimits();
    if (!limits.allowRecipeBuilder && !isPremium) {
      setShowPaywall(true);
    }
  }, [isPremium]);
  
  const [recipeName, setRecipeName] = useState(editingRecipe?.name || '');
  const [description, setDescription] = useState(editingRecipe?.description || '');
  const [servings, setServings] = useState(editingRecipe?.servings.toString() || '4');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(editingRecipe?.ingredients || []);
  const [showIngredientSearch, setShowIngredientSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodDatabaseItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodDatabaseItem | null>(null);
  const [ingredientAmount, setIngredientAmount] = useState('1');
  const [ingredientUnit, setIngredientUnit] = useState('serving');

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const results = searchFoods(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleAddIngredient = () => {
    if (!selectedFood) {
      Alert.alert('No Food Selected', 'Please search and select a food item first');
      return;
    }

    const amount = parseFloat(ingredientAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    // Calculate nutrition based on amount
    const caloriesPer100g = selectedFood.calories_per_100g;
    const proteinPer100g = selectedFood.protein_per_100g;
    const carbsPer100g = selectedFood.carbs_per_100g;
    const fatPer100g = selectedFood.fat_per_100g;

    // If unit is "serving", use the first common serving size
    let grams = amount;
    if (ingredientUnit === 'serving' && selectedFood.common_servings.length > 0) {
      grams = selectedFood.common_servings[0].grams * amount;
    } else if (ingredientUnit === 'g') {
      grams = amount;
    } else if (ingredientUnit === 'kg') {
      grams = amount * 1000;
    }

    const ingredient: RecipeIngredient = {
      id: `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: selectedFood.name,
      calories: Math.round((caloriesPer100g * grams) / 100),
      protein_g: Math.round((proteinPer100g * grams) / 100),
      carbs_g: Math.round((carbsPer100g * grams) / 100),
      fat_g: Math.round((fatPer100g * grams) / 100),
      amount: amount,
      unit: ingredientUnit,
    };

    setIngredients([...ingredients, ingredient]);
    setSelectedFood(null);
    setSearchQuery('');
    setIngredientAmount('1');
    setIngredientUnit('serving');
    setShowIngredientSearch(false);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const handleSaveRecipe = async () => {
    if (!recipeName.trim()) {
      Alert.alert('Missing Name', 'Please enter a recipe name');
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert('No Ingredients', 'Please add at least one ingredient');
      return;
    }

    const servingsNum = parseInt(servings, 10);
    if (isNaN(servingsNum) || servingsNum <= 0) {
      Alert.alert('Invalid Servings', 'Please enter a valid number of servings');
      return;
    }

    if (editingRecipe) {
      await updateRecipe(editingRecipe.id, {
        name: recipeName,
        description: description || undefined,
        servings: servingsNum,
        ingredients,
      });
      Alert.alert('Recipe Updated', 'Your recipe has been updated successfully!');
    } else {
      await addRecipe({
        name: recipeName,
        description: description || undefined,
        servings: servingsNum,
        ingredients,
      });
      Alert.alert('Recipe Saved', 'Your recipe has been saved successfully!');
    }

    navigation.goBack();
  };

  const handleAddToMeal = async () => {
    if (!editingRecipe) {
      Alert.alert('Error', 'Please save the recipe first');
      return;
    }

    const servingsNum = parseFloat(servings);
    if (isNaN(servingsNum) || servingsNum <= 0) {
      Alert.alert('Invalid Servings', 'Please enter a valid number of servings');
      return;
    }

    // Create a food item from the recipe
    const recipeFood: FoodItem = {
      id: `recipe-${editingRecipe.id}-${Date.now()}`,
      name: editingRecipe.name,
      calories: Math.round(editingRecipe.caloriesPerServing * servingsNum),
      protein_g: Math.round(editingRecipe.proteinPerServing * servingsNum),
      carbs_g: Math.round(editingRecipe.carbsPerServing * servingsNum),
      fat_g: Math.round(editingRecipe.fatPerServing * servingsNum),
      portion: `${servingsNum} serving${servingsNum !== 1 ? 's' : ''}`,
      quantity: 1,
      timestamp: new Date().toISOString(),
    };

    const meal = {
      id: `meal-${Date.now()}`,
      mealType,
      foods: [recipeFood],
      timestamp: new Date().toISOString(),
      totalCalories: recipeFood.calories,
      totalProtein: recipeFood.protein_g,
      totalCarbs: recipeFood.carbs_g,
      totalFat: recipeFood.fat_g,
    };

    addMeal(meal);
    Alert.alert('Added to Meal', `Added ${editingRecipe.name} to ${mealType}`);
    navigation.navigate('Home' as never);
  };

  const totals = useRecipeStore.getState().calculateRecipeTotals(ingredients);
  const servingsNum = parseInt(servings, 10) || 1;
  const caloriesPerServing = servingsNum > 0 ? Math.round(totals.totalCalories / servingsNum) : 0;
  const proteinPerServing = servingsNum > 0 ? Math.round(totals.totalProtein / servingsNum) : 0;
  const carbsPerServing = servingsNum > 0 ? Math.round(totals.totalCarbs / servingsNum) : 0;
  const fatPerServing = servingsNum > 0 ? Math.round(totals.totalFat / servingsNum) : 0;

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
    },
    scrollContent: {
      padding: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.inputText,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginTop: 8,
      marginBottom: 16,
    },
    ingredientCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    ingredientInfo: {
      flex: 1,
    },
    ingredientName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    ingredientDetails: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    deleteButton: {
      padding: 8,
    },
    deleteButtonText: {
      color: colors.error,
      fontSize: 16,
      fontWeight: '600',
    },
    addIngredientButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 20,
    },
    addIngredientButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    searchContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    searchInput: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.inputText,
      marginBottom: 12,
    },
    searchResult: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    searchResultText: {
      fontSize: 16,
      color: colors.text,
    },
    amountInputRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
    },
    amountInput: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.inputText,
    },
    unitPicker: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginTop: 20,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
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
    saveButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
    addToMealButton: {
      backgroundColor: colors.success,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 12,
    },
    addToMealButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
  });

  // Show paywall if user doesn't have access
  if (showPaywall) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <PaywallModal
          visible={showPaywall}
          onClose={async () => {
            // Check if user upgraded
            const limits = getSubscriptionLimits();
            if (limits.allowRecipeBuilder || isPremium) {
              setShowPaywall(false);
            } else {
              navigation.goBack();
            }
          }}
          title="Recipe Builder is Premium"
          message="Upgrade to premium to create and manage custom recipes with automatic nutrition calculation."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <TouchableOpacity
            style={dynamicStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={dynamicStyles.backText}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={dynamicStyles.title}>
            {editingRecipe ? 'Edit Recipe' : 'New Recipe'}
          </Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={dynamicStyles.scrollContent}>
          {/* Recipe Name */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Recipe Name *</Text>
            <TextInput
              style={dynamicStyles.input}
              value={recipeName}
              onChangeText={setRecipeName}
              placeholder="e.g., Chicken Stir Fry"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          {/* Description */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Description (Optional)</Text>
            <TextInput
              style={[dynamicStyles.input, dynamicStyles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add notes or cooking instructions..."
              placeholderTextColor={colors.placeholder}
              multiline
            />
          </View>

          {/* Servings */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Number of Servings *</Text>
            <TextInput
              style={dynamicStyles.input}
              value={servings}
              onChangeText={setServings}
              keyboardType="numeric"
              placeholder="4"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          {/* Ingredients */}
          <Text style={dynamicStyles.sectionTitle}>Ingredients</Text>

          {ingredients.map((ingredient) => (
            <View key={ingredient.id} style={dynamicStyles.ingredientCard}>
              <View style={dynamicStyles.ingredientInfo}>
                <Text style={dynamicStyles.ingredientName}>{ingredient.name}</Text>
                <Text style={dynamicStyles.ingredientDetails}>
                  {ingredient.amount} {ingredient.unit} • {ingredient.calories} cal
                </Text>
              </View>
              <TouchableOpacity
                style={dynamicStyles.deleteButton}
                onPress={() => handleRemoveIngredient(ingredient.id)}
              >
                <Text style={dynamicStyles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Ingredient */}
          {!showIngredientSearch ? (
            <TouchableOpacity
              style={dynamicStyles.addIngredientButton}
              onPress={() => setShowIngredientSearch(true)}
            >
              <Text style={dynamicStyles.addIngredientButtonText}>+ Add Ingredient</Text>
            </TouchableOpacity>
          ) : (
            <View style={dynamicStyles.searchContainer}>
              <TextInput
                style={dynamicStyles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search for food..."
                placeholderTextColor={colors.placeholder}
                autoFocus
              />
              
              {searchResults.length > 0 && (
                <ScrollView style={{ maxHeight: 200 }}>
                  {searchResults.map((food) => (
                    <TouchableOpacity
                      key={food.id}
                      style={dynamicStyles.searchResult}
                      onPress={() => {
                        setSelectedFood(food);
                        setSearchQuery(food.name);
                        setSearchResults([]);
                      }}
                    >
                      <Text style={dynamicStyles.searchResultText}>{food.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {selectedFood && (
                <>
                  <Text style={[dynamicStyles.label, { marginTop: 8 }]}>Amount</Text>
                  <View style={dynamicStyles.amountInputRow}>
                    <TextInput
                      style={dynamicStyles.amountInput}
                      value={ingredientAmount}
                      onChangeText={setIngredientAmount}
                      keyboardType="numeric"
                      placeholder="1"
                      placeholderTextColor={colors.placeholder}
                    />
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => setIngredientUnit('serving')}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          backgroundColor: ingredientUnit === 'serving' ? colors.primary : colors.surfaceSecondary,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: ingredientUnit === 'serving' ? colors.primary : colors.border,
                        }}
                      >
                        <Text style={{ 
                          color: ingredientUnit === 'serving' ? '#FFFFFF' : colors.text,
                          fontWeight: '600',
                        }}>
                          serving
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setIngredientUnit('g')}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          backgroundColor: ingredientUnit === 'g' ? colors.primary : colors.surfaceSecondary,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: ingredientUnit === 'g' ? colors.primary : colors.border,
                        }}
                      >
                        <Text style={{ 
                          color: ingredientUnit === 'g' ? '#FFFFFF' : colors.text,
                          fontWeight: '600',
                        }}>
                          g
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={dynamicStyles.amountInputRow}>
                    <TouchableOpacity
                      style={[dynamicStyles.addIngredientButton, { marginTop: 8, flex: 1 }]}
                      onPress={handleAddIngredient}
                    >
                      <Text style={dynamicStyles.addIngredientButtonText}>Add to Recipe</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[dynamicStyles.addIngredientButton, { backgroundColor: colors.surfaceSecondary, marginTop: 8, flex: 1 }]}
                      onPress={() => {
                        setShowIngredientSearch(false);
                        setSelectedFood(null);
                        setSearchQuery('');
                      }}
                    >
                      <Text style={[dynamicStyles.addIngredientButtonText, { color: colors.text }]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}

          {/* Nutrition Summary */}
          {ingredients.length > 0 && (
            <View style={dynamicStyles.summaryCard}>
              <Text style={dynamicStyles.summaryTitle}>Nutrition Summary</Text>
              
              <View style={dynamicStyles.summaryRow}>
                <Text style={dynamicStyles.summaryLabel}>Total (Entire Recipe)</Text>
                <Text style={dynamicStyles.summaryValue}>{totals.totalCalories} cal</Text>
              </View>
              
              <View style={[dynamicStyles.summaryRow, dynamicStyles.summaryRowLast]}>
                <Text style={dynamicStyles.summaryLabel}>Per Serving ({servingsNum} servings)</Text>
                <Text style={dynamicStyles.summaryValue}>{caloriesPerServing} cal</Text>
              </View>
              
              <View style={dynamicStyles.summaryRow}>
                <Text style={dynamicStyles.summaryLabel}>Protein</Text>
                <Text style={dynamicStyles.summaryValue}>{proteinPerServing}g</Text>
              </View>
              
              <View style={dynamicStyles.summaryRow}>
                <Text style={dynamicStyles.summaryLabel}>Carbs</Text>
                <Text style={dynamicStyles.summaryValue}>{carbsPerServing}g</Text>
              </View>
              
              <View style={[dynamicStyles.summaryRow, dynamicStyles.summaryRowLast]}>
                <Text style={dynamicStyles.summaryLabel}>Fat</Text>
                <Text style={dynamicStyles.summaryValue}>{fatPerServing}g</Text>
              </View>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={dynamicStyles.saveButton}
            onPress={handleSaveRecipe}
          >
            <Text style={dynamicStyles.saveButtonText}>
              {editingRecipe ? 'Update Recipe' : 'Save Recipe'}
            </Text>
          </TouchableOpacity>

          {/* Add to Meal Button (only if editing existing recipe) */}
          {editingRecipe && (
            <TouchableOpacity
              style={dynamicStyles.addToMealButton}
              onPress={handleAddToMeal}
            >
              <Text style={dynamicStyles.addToMealButtonText}>
                Add to {mealType}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});

