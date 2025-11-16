import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { lookupBarcode, calculateNutrition, isValidBarcode } from '../services/barcodeService';
import { useMealStore } from '../store/useMealStore';
import { Meal, FoodItem, MealType } from '../types/meal.types';

export default function BarcodeScannerScreen() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addMeal } = useMealStore();

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera permission to scan barcodes</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    // Validate barcode
    if (!isValidBarcode(data)) {
      Alert.alert(
        'Invalid Barcode',
        'Please scan a valid product barcode (UPC-A, EAN-8, or EAN-13)',
        [{ text: 'Try Again', onPress: () => setScanned(false) }]
      );
      setLoading(false);
      return;
    }

    // Look up product
    const product = await lookupBarcode(data);
    setLoading(false);

    if (product.found) {
      // Calculate nutrition for standard serving
      const nutrition = calculateNutrition(product, 100);
      
      Alert.alert(
        `${product.name}`,
        `${product.brand ? product.brand + '\n' : ''}` +
        `Barcode: ${product.barcode}\n\n` +
        `Per 100g:\n` +
        `Calories: ${nutrition.calories} kcal\n` +
        `Protein: ${nutrition.protein_g}g\n` +
        `Carbs: ${nutrition.carbs_g}g\n` +
        `Fat: ${nutrition.fat_g}g\n\n` +
        `Add to meal log?`,
        [
          { text: 'Scan Another', onPress: () => setScanned(false), style: 'cancel' },
          { 
            text: 'Add to Log', 
            onPress: () => {
              // Create food item
              const foodItem: FoodItem = {
                id: `food-${Date.now()}`,
                name: product.name || 'Unknown Product',
                calories: nutrition.calories,
                protein_g: nutrition.protein_g,
                carbs_g: nutrition.carbs_g,
                fat_g: nutrition.fat_g,
                portion: '100g',
                quantity: 1,
                timestamp: new Date().toISOString(),
              };

              // Create meal with this food
              const meal: Meal = {
                id: `meal-${Date.now()}`,
                mealType: 'Snack', // Default to Snack for scanned items
                foods: [foodItem],
                timestamp: new Date().toISOString(),
                totalCalories: nutrition.calories,
                totalProtein: nutrition.protein_g,
                totalCarbs: nutrition.carbs_g,
                totalFat: nutrition.fat_g,
              };

              // Add to store
              addMeal(meal);

              setScanned(false);
              navigation.goBack();
              
              // Show success after navigation
              setTimeout(() => {
                Alert.alert('Added to Log! 🎉', `${product.name} added to Snack`);
              }, 500);
            },
            style: 'default'
          }
        ]
      );
    } else {
      Alert.alert(
        'Product Not Found',
        `Barcode: ${product.barcode}\n\n${product.error || 'This product is not in our database yet.'}\n\nTry manual entry instead.`,
        [
          { text: 'Try Again', onPress: () => setScanned(false), style: 'cancel' },
          { 
            text: 'Back', 
            onPress: () => {
              setScanned(false);
              navigation.goBack();
            },
            style: 'default'
          }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Scan Barcode</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Scanning Frame */}
        <View style={styles.scanningArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Looking up product...</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.instructionsText}>
            Position barcode in frame
          </Text>
          <Text style={styles.instructionsSubtext}>
            UPC, EAN-13, and EAN-8 supported
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  placeholder: {
    width: 60,
  },
  scanningArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 200,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#6366F1',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '600',
  },
  instructionsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  instructionsSubtext: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  button: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

