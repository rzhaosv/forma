import React, { useState, useRef } from 'react';
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
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('Snack');
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const { addMeal } = useMealStore();
  const isProcessing = useRef(false);

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
    // Prevent multiple rapid scans using ref (faster than state)
    if (scanned || loading || isProcessing.current) return;

    isProcessing.current = true;
    setScanned(true);
    setLoading(true);

    try {
      // Validate barcode
      if (!isValidBarcode(data)) {
        setLoading(false);
        Alert.alert(
          'Invalid Barcode',
          'Please scan a valid product barcode (UPC-A, EAN-8, or EAN-13)',
          [{ 
            text: 'OK', 
            onPress: () => {
              setScanned(false);
              isProcessing.current = false;
            }
          }]
        );
        return;
      }

      // Look up product
      const product = await lookupBarcode(data);
      setLoading(false);

      if (product.found) {
        // Store product and show meal selector
        setScannedProduct(product);
        setShowMealSelector(true);
        isProcessing.current = false;
      } else {
        // Product not found - show simple error
        Alert.alert(
          'Product Not Found',
          'This barcode is not in our database. Try scanning another product or use manual entry.',
          [{ 
            text: 'OK', 
            onPress: () => {
              setScanned(false);
              isProcessing.current = false;
            }
          }]
        );
      }
    } catch (error) {
      // Handle any unexpected errors gracefully
      setLoading(false);
      Alert.alert(
        'Scan Error',
        'Something went wrong. Please try again.',
        [{ 
          text: 'OK', 
          onPress: () => {
            setScanned(false);
            isProcessing.current = false;
          }
        }]
      );
    }
  };

  const handleAddToLog = () => {
    if (!scannedProduct) return;

    const nutrition = calculateNutrition(scannedProduct, 100);

    // Create food item
    const foodItem: FoodItem = {
      id: `food-${Date.now()}`,
      name: scannedProduct.name || 'Unknown Product',
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
      mealType: selectedMealType,
      foods: [foodItem],
      timestamp: new Date().toISOString(),
      totalCalories: nutrition.calories,
      totalProtein: nutrition.protein_g,
      totalCarbs: nutrition.carbs_g,
      totalFat: nutrition.fat_g,
    };

    // Add to store
    addMeal(meal);

    // Navigate back and show success
    navigation.goBack();
    setTimeout(() => {
      Alert.alert('Added to Log! 🎉', `${scannedProduct.name} added to ${selectedMealType}`);
    }, 500);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={scanned || showMealSelector ? undefined : handleBarCodeScanned}
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
        {/* Scanning Area - Hide when meal selector is shown */}
        {!showMealSelector && (
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
        )}

        {/* Meal Selector Overlay */}
        {showMealSelector && scannedProduct && (
          <View style={styles.mealSelectorOverlay}>
            <View style={styles.mealSelectorCard}>
              <Text style={styles.productName}>{scannedProduct.name}</Text>
              {scannedProduct.brand && (
                <Text style={styles.productBrand}>{scannedProduct.brand}</Text>
              )}
              
              <View style={styles.nutritionSummary}>
                <Text style={styles.caloriesBig}>
                  {calculateNutrition(scannedProduct, 100).calories}
                </Text>
                <Text style={styles.caloriesLabel}>calories per 100g</Text>
              </View>

              <Text style={styles.selectorTitle}>Add to:</Text>
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
                      styles.mealTypeButtonText,
                      selectedMealType === type && styles.mealTypeButtonTextActive
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowMealSelector(false);
                    setScannedProduct(null);
                    setScanned(false);
                    isProcessing.current = false;
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddToLog}
                >
                  <Text style={styles.addButtonText}>Add to Log</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
  mealSelectorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mealSelectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  nutritionSummary: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  caloriesBig: {
    fontSize: 36,
    fontWeight: '700',
    color: '#6366F1',
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
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
  mealTypeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  mealTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  addButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

