import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, AppState, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { lookupBarcode, calculateNutrition, isValidBarcode } from '../services/barcodeService';
import { useMealStore } from '../store/useMealStore';
import { Meal, FoodItem, MealType } from '../types/meal.types';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import {
  canPerformBarcodeScan,
  recordBarcodeScan,
  getRemainingBarcodeScans
} from '../utils/subscriptionLimits';
import PaywallModal from '../components/PaywallModal';

export default function BarcodeScannerScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { isPremium, subscriptionStatus } = useSubscriptionStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAppActive, setIsAppActive] = useState(true);
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('Snack');
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [servingQuantity, setServingQuantity] = useState(1);
  const [showPaywall, setShowPaywall] = useState(false);
  const [remainingScans, setRemainingScans] = useState<number | null>(null);
  const { addMeal } = useMealStore();
  const isProcessing = useRef(false);

  useEffect(() => {
    loadRemainingScans();
  }, []);

  useEffect(() => {
    // Refresh remaining scans when premium status changes
    loadRemainingScans();
    if (isPremium && showPaywall) {
      setShowPaywall(false);
    }
  }, [isPremium]);

  // Auto-request permission if undetermined when screen is focused
  useEffect(() => {
    if (isFocused && permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [isFocused, permission?.granted, permission?.canAskAgain]);

  const loadRemainingScans = async () => {
    if (subscriptionStatus === 'loading') return;
    if (!isPremium) {
      const remaining = await getRemainingBarcodeScans();
      setRemainingScans(remaining);
    }
  };

  // Helper function to parse serving size to grams
  const parseServingSize = (servingSize: string): number => {
    const match = servingSize.match(/(\d+(\.\d+)?)\s*g/i);
    return match ? parseFloat(match[1]) : 100; // Default to 100g if can't parse
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // If undetermined, we are auto-requesting
    if (permission.canAskAgain) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera access is required to scan barcodes.</Text>
        <TouchableOpacity style={styles.button} onPress={() => Linking.openSettings()}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { marginTop: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#6366f1' }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, { color: '#6366f1' }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    // Prevent multiple rapid scans using ref (faster than state)
    if (scanned || loading || isProcessing.current) return;

    // Check barcode scan limit for free users
    if (subscriptionStatus !== 'loading' && !isPremium) {
      const canScan = await canPerformBarcodeScan();
      if (!canScan) {
        setShowPaywall(true);
        return;
      }
    }

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
        // Record the scan for free users
        if (subscriptionStatus !== 'loading' && !isPremium) {
          await recordBarcodeScan();
          await loadRemainingScans();
        }

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

    // Calculate nutrition based on serving size
    const servingSizeG = parseServingSize(scannedProduct.serving_size || '100g');
    const nutritionPerServing = calculateNutrition(scannedProduct, servingSizeG);

    // Create food item
    const foodItem: FoodItem = {
      id: `food-${Date.now()}`,
      name: scannedProduct.name || 'Unknown Product',
      calories: nutritionPerServing.calories,
      protein_g: nutritionPerServing.protein_g,
      carbs_g: nutritionPerServing.carbs_g,
      fat_g: nutritionPerServing.fat_g,
      portion: scannedProduct.serving_size || '100g',
      quantity: servingQuantity,
      timestamp: new Date().toISOString(),
    };

    // Create meal with this food (multiply by quantity)
    const meal: Meal = {
      id: `meal-${Date.now()}`,
      mealType: selectedMealType,
      foods: [foodItem],
      timestamp: new Date().toISOString(),
      totalCalories: nutritionPerServing.calories * servingQuantity,
      totalProtein: nutritionPerServing.protein_g * servingQuantity,
      totalCarbs: nutritionPerServing.carbs_g * servingQuantity,
      totalFat: nutritionPerServing.fat_g * servingQuantity,
    };

    // Add to store
    addMeal(meal);

    // Reset serving quantity for next scan
    setServingQuantity(1);

    // Navigate back and show success
    navigation.goBack();
    setTimeout(() => {
      const servingText = servingQuantity === 1 ? '1 serving' : `${servingQuantity} servings`;
      Alert.alert('Added to Log! 🎉', `${scannedProduct.name} (${servingText}) added to ${selectedMealType}`);
    }, 500);
  };

  // Show paywall if user doesn't have access
  if (showPaywall) {
    return (
      <View style={styles.container}>
        <PaywallModal
          isVisible={showPaywall}
          onClose={async () => {
            // Refresh remaining scans in case user upgraded
            await loadRemainingScans();
            setShowPaywall(false);
            // Only navigate back if still not premium
            if (subscriptionStatus !== 'loading' && !isPremium) {
              navigation.goBack();
            }
          }}
          title="Daily Limit Reached"
          message="You've used your 2 free barcode scans for today. Upgrade to premium for unlimited barcode scanning and other premium features."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && isAppActive && (
        <>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
            }}
            onBarcodeScanned={scanned || showMealSelector ? undefined : handleBarCodeScanned}
          />

          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Scan Barcode</Text>
              {!isPremium && remainingScans !== null && (
                <Text style={styles.remainingScans}>
                  {remainingScans} scan{remainingScans !== 1 ? 's' : ''} remaining today
                </Text>
              )}
            </View>
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
                    {calculateNutrition(scannedProduct, parseServingSize(scannedProduct.serving_size || '100g')).calories}
                  </Text>
                  <Text style={styles.caloriesLabel}>
                    calories per serving ({scannedProduct.serving_size || '100g'})
                  </Text>
                </View>

                {/* Serving Quantity Selector */}
                <View style={styles.servingSelectorContainer}>
                  <Text style={styles.selectorTitle}>Servings:</Text>
                  <View style={styles.servingButtons}>
                    <TouchableOpacity
                      style={[styles.servingButton, servingQuantity <= 0.5 && styles.servingButtonDisabled]}
                      onPress={() => setServingQuantity(Math.max(0.5, servingQuantity - 0.5))}
                      disabled={servingQuantity <= 0.5}
                    >
                      <Text style={styles.servingButtonText}>−</Text>
                    </TouchableOpacity>

                    <View style={styles.servingDisplay}>
                      <Text style={styles.servingQuantityText}>{servingQuantity}</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.servingButton, servingQuantity >= 10 && styles.servingButtonDisabled]}
                      onPress={() => setServingQuantity(Math.min(10, servingQuantity + 0.5))}
                      disabled={servingQuantity >= 10}
                    >
                      <Text style={styles.servingButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.totalCaloriesText}>
                    Total: {Math.round(calculateNutrition(scannedProduct, parseServingSize(scannedProduct.serving_size || '100g')).calories * servingQuantity)} calories
                  </Text>
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
                      setServingQuantity(1);
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
        </>
      )}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
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
  titleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  remainingScans: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.8,
    marginTop: 2,
  },
  placeholder: {
    width: 60,
  },
  scanningArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  servingSelectorContainer: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  servingButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  servingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingButtonDisabled: {
    backgroundColor: '#E5E7EB',
    opacity: 0.5,
  },
  servingButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  servingDisplay: {
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  servingQuantityText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  totalCaloriesText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
});
