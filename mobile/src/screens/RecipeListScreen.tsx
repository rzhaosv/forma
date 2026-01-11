import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRecipeStore } from '../store/useRecipeStore';
import { Recipe } from '../types/meal.types';
import { useTheme } from '../hooks/useTheme';
import { useMealStore } from '../store/useMealStore';
import { FoodItem, MealType } from '../types/meal.types';
import { Ionicons } from '@expo/vector-icons';

export default function RecipeListScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { recipes, deleteRecipe } = useRecipeStore();
  const { addMeal } = useMealStore();

  const handleCreateRecipe = () => {
    navigation.navigate('RecipeBuilder' as never);
  };

  const handleEditRecipe = (recipeId: string) => {
    navigation.navigate('RecipeBuilder' as never, { recipeId } as never);
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to delete "${recipe.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRecipe(recipe.id),
        },
      ]
    );
  };

  const handleAddToMeal = async (recipe: Recipe, mealType: MealType) => {
    const recipeFood: FoodItem = {
      id: `recipe-${recipe.id}-${Date.now()}`,
      name: recipe.name,
      calories: recipe.caloriesPerServing,
      protein_g: recipe.proteinPerServing,
      carbs_g: recipe.carbsPerServing,
      fat_g: recipe.fatPerServing,
      portion: '1 serving',
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

    await addMeal(meal);
    Alert.alert('Added to Meal', `Added ${recipe.name} to ${mealType}`);
    navigation.navigate('Home' as never);
  };

  const handleSelectMealType = (recipe: Recipe) => {
    Alert.alert(
      'Add to Meal',
      'Which meal would you like to add this to?',
      [
        { text: 'Breakfast', onPress: () => handleAddToMeal(recipe, 'Breakfast') },
        { text: 'Lunch', onPress: () => handleAddToMeal(recipe, 'Lunch') },
        { text: 'Dinner', onPress: () => handleAddToMeal(recipe, 'Dinner') },
        { text: 'Snack', onPress: () => handleAddToMeal(recipe, 'Snack') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderRecipe = ({ item: recipe }: { item: Recipe }) => {
    const dynamicStyles = StyleSheet.create({
      recipeCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 3,
      },
      recipeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
      },
      recipeName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
        marginRight: 12,
      },
      recipeActions: {
        flexDirection: 'row',
        gap: 8,
      },
      actionButton: {
        padding: 8,
      },
      recipeDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 12,
      },
      recipeStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
      },
      statItem: {
        alignItems: 'center',
      },
      statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 4,
      },
      statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
      },
      addButton: {
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 12,
      },
      addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
      },
    });

    return (
      <View style={dynamicStyles.recipeCard}>
        <View style={dynamicStyles.recipeHeader}>
          <Text style={dynamicStyles.recipeName}>{recipe.name}</Text>
          <View style={dynamicStyles.recipeActions}>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => handleEditRecipe(recipe.id)}
            >
              <Ionicons name="pencil" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => handleDeleteRecipe(recipe)}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {recipe.description && (
          <Text style={dynamicStyles.recipeDescription}>{recipe.description}</Text>
        )}

        <View style={dynamicStyles.recipeStats}>
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statValue}>{recipe.caloriesPerServing}</Text>
            <Text style={dynamicStyles.statLabel}>Calories</Text>
          </View>
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statValue}>{recipe.proteinPerServing}g</Text>
            <Text style={dynamicStyles.statLabel}>Protein</Text>
          </View>
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statValue}>{recipe.servings}</Text>
            <Text style={dynamicStyles.statLabel}>Servings</Text>
          </View>
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statValue}>{recipe.ingredients.length}</Text>
            <Text style={dynamicStyles.statLabel}>Ingredients</Text>
          </View>
        </View>

        <TouchableOpacity
          style={dynamicStyles.addButton}
          onPress={() => handleSelectMealType(recipe)}
        >
          <Text style={dynamicStyles.addButtonText}>+ Add to Meal</Text>
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
      alignItems: 'center',
      justifyContent: 'space-between',
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
    addButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
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
    listContent: {
      padding: 20,
    },
  });

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
        <Text style={dynamicStyles.title}>My Recipes</Text>
        <TouchableOpacity
          style={dynamicStyles.addButton}
          onPress={handleCreateRecipe}
        >
          <Text style={dynamicStyles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {recipes.length === 0 ? (
        <View style={dynamicStyles.emptyState}>
          <Ionicons name="restaurant" size={64} color={colors.textSecondary} style={{ marginBottom: 16 }} />
          <Text style={dynamicStyles.emptyStateText}>No Recipes Yet</Text>
          <Text style={dynamicStyles.emptyStateSubtext}>
            Create your first recipe to quickly log your favorite meals!
          </Text>
          <TouchableOpacity
            style={[dynamicStyles.addButton, { marginTop: 24 }]}
            onPress={handleCreateRecipe}
          >
            <Text style={dynamicStyles.addButtonText}>Create Recipe</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id}
          contentContainerStyle={dynamicStyles.listContent}
        />
      )}
    </SafeAreaView>
  );
}
