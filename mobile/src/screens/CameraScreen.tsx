import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { analyzePhoto, AnalysisResult } from '../services/photoUploadService';
import { lookupBarcode, BarcodeProduct, calculateNutrition } from '../services/barcodeService';
import { useMealStore } from '../store/useMealStore';
import { Meal, FoodItem, MealType } from '../types/meal.types';

type ScanMode = 'camera' | 'barcode';

interface CameraScreenProps {
  navigation: any;
}

export default function CameraScreen({ navigation }: CameraScreenProps) {
  const [scanMode, setScanMode] = useState<ScanMode>('camera');
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<BarcodeProduct | null>(null);
  const [scanned, setScanned] = useState(false);
  const [servingSize, setServingSize] = useState(100);
  const cameraRef = useRef<any>(null);

  const addMeal = useMealStore((state) => state.addMeal);
  const meals = useMealStore((state) => state.meals);

  if (!permission) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera access to scan food photos</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setCapturedPhoto(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedPhoto(result.assets[0].uri);
    }
  };

  const retake = () => {
    setCapturedPhoto(null);
    setAnalysisResult(null);
    setAnalyzing(false);
    setBarcodeProduct(null);
    setScanned(false);
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setAnalyzing(true);

    try {
      const product = await lookupBarcode(data);
      
      if (product.found) {
        setBarcodeProduct(product);
      } else {
        Alert.alert(
          'Product Not Found',
          `Barcode: ${data}\n\nThis product is not in our database.`,
          [
            { text: 'OK', onPress: () => { setScanned(false); setAnalyzing(false); }, style: 'cancel' },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to lookup barcode');
      setScanned(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzePhoto = async () => {
    if (!capturedPhoto) return;

    setAnalyzing(true);

    try {
      const result = await analyzePhoto(capturedPhoto);

      if (result.success && result.foods) {
        setAnalysisResult(result);
      } else {
        Alert.alert('❌ Analysis Failed', result.error || 'Could not recognize foods in image');
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      Alert.alert('❌ Error', error.message || 'Failed to analyze photo');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveMeal = () => {
    if (!analysisResult || !analysisResult.foods) return;

    // Determine meal type based on time
    const hour = new Date().getHours();
    let mealType: MealType = 'snack';
    if (hour >= 5 && hour < 11) mealType = 'breakfast';
    else if (hour >= 11 && hour < 16) mealType = 'lunch';
    else if (hour >= 16 && hour < 22) mealType = 'dinner';

    // Convert analyzed foods to FoodItems
    const foodItems: FoodItem[] = analysisResult.foods.map((food) => ({
      id: Date.now().toString() + Math.random(),
      name: food.name,
      calories: food.calories,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
      portion: food.portion,
      quantity: 1,
      timestamp: new Date().toISOString(),
    }));

    const newMeal: Meal = {
      id: Date.now().toString(),
      type: mealType,
      foods: foodItems,
      timestamp: new Date().toISOString(),
      totalCalories: analysisResult.total_calories || 0,
      totalProtein: foodItems.reduce((sum, f) => sum + f.protein_g, 0),
      totalCarbs: foodItems.reduce((sum, f) => sum + f.carbs_g, 0),
      totalFat: foodItems.reduce((sum, f) => sum + f.fat_g, 0),
    };

    addMeal(newMeal);
    Alert.alert('Success!', 'Meal saved to your log', [
      {
        text: 'OK',
        onPress: () => {
          retake();
          navigation.navigate('Home');
        },
      },
    ]);
  };

  const handleSaveBarcodeMeal = () => {
    if (!barcodeProduct) return;

    const hour = new Date().getHours();
    let mealType: MealType = 'snack';
    if (hour >= 5 && hour < 11) mealType = 'breakfast';
    else if (hour >= 11 && hour < 16) mealType = 'lunch';
    else if (hour >= 16 && hour < 22) mealType = 'dinner';

    const nutrition = calculateNutrition(barcodeProduct, servingSize);

    const foodItem: FoodItem = {
      id: Date.now().toString(),
      name: barcodeProduct.name,
      calories: nutrition.calories,
      protein_g: nutrition.protein_g,
      carbs_g: nutrition.carbs_g,
      fat_g: nutrition.fat_g,
      portion: `${servingSize}g`,
      quantity: 1,
      timestamp: new Date().toISOString(),
    };

    const newMeal: Meal = {
      id: Date.now().toString(),
      type: mealType,
      foods: [foodItem],
      timestamp: new Date().toISOString(),
      totalCalories: nutrition.calories,
      totalProtein: nutrition.protein_g,
      totalCarbs: nutrition.carbs_g,
      totalFat: nutrition.fat_g,
    };

    addMeal(newMeal);
    Alert.alert('Success!', 'Food added to your meal', [
      {
        text: 'OK',
        onPress: () => {
          retake();
          navigation.navigate('Home');
        },
      },
    ]);
  };

  // Show barcode product result
  if (barcodeProduct && barcodeProduct.found) {
    const nutrition = calculateNutrition(barcodeProduct, servingSize);
    
    return (
      <View style={styles.container}>
        <ScrollView style={styles.productContainer}>
          {barcodeProduct.image_url && (
            <Image 
              source={{ uri: barcodeProduct.image_url }} 
              style={styles.productImage}
              resizeMode="contain"
            />
          )}

          <View style={styles.productInfo}>
            <Text style={styles.productName}>{barcodeProduct.name}</Text>
            {barcodeProduct.brand && (
              <Text style={styles.productBrand}>{barcodeProduct.brand}</Text>
            )}
            <Text style={styles.barcode}>Barcode: {barcodeProduct.barcode}</Text>
          </View>

          <View style={styles.servingCard}>
            <Text style={styles.servingTitle}>Serving Size</Text>
            <View style={styles.servingSelector}>
              <TouchableOpacity 
                style={styles.servingButton}
                onPress={() => setServingSize(Math.max(10, servingSize - 10))}
              >
                <Text style={styles.servingButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.servingValue}>{servingSize}g</Text>
              <TouchableOpacity 
                style={styles.servingButton}
                onPress={() => setServingSize(servingSize + 10)}
              >
                <Text style={styles.servingButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.nutritionCard}>
            <Text style={styles.nutritionTitle}>Nutrition Facts</Text>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Calories</Text>
              <Text style={styles.nutritionValue}>{nutrition.calories}</Text>
            </View>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Protein</Text>
              <Text style={styles.nutritionValue}>{nutrition.protein_g}g</Text>
            </View>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Carbs</Text>
              <Text style={styles.nutritionValue}>{nutrition.carbs_g}g</Text>
            </View>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Fat</Text>
              <Text style={styles.nutritionValue}>{nutrition.fat_g}g</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.previewControls}>
          <TouchableOpacity style={styles.button} onPress={retake}>
            <Text style={styles.buttonText}>Scan Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleSaveBarcodeMeal}>
            <Text style={styles.buttonText}>Add to Meal</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedPhoto }} style={styles.preview} />
        
        {analysisResult && analysisResult.success && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>AI Detected Foods:</Text>
              <Text style={styles.totalCalories}>{analysisResult.total_calories} cal</Text>
            </View>
            
            {analysisResult.foods?.map((food, index) => (
              <View key={index} style={styles.foodItem}>
                <View style={styles.foodHeader}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.confidence}>
                    {food.confidence >= 0.8 ? '✓' : '⚠'} {Math.round(food.confidence * 100)}%
                  </Text>
                </View>
                <Text style={styles.foodPortion}>{food.portion}</Text>
                <Text style={styles.foodNutrition}>
                  {food.calories} cal · P: {food.protein_g}g · C: {food.carbs_g}g · F: {food.fat_g}g
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.previewControls}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={retake}
            disabled={analyzing}
          >
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton, analyzing && styles.buttonDisabled]} 
            onPress={analysisResult ? handleSaveMeal : handleAnalyzePhoto}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {analysisResult ? 'Save Meal' : 'Analyze Food'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {analyzing && (
          <View style={styles.analyzingOverlay}>
            <View style={styles.analyzingCard}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.analyzingText}>Analyzing with AI...</Text>
              <Text style={styles.analyzingSubtext}>This may take a few seconds</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  // Barcode Scanner Mode
  if (scanMode === 'barcode') {
    return (
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing={facing}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
          }}
          onBarcodeScanned={scanned ? undefined : (result: BarcodeScanningResult) => {
            handleBarCodeScanned({ type: result.type, data: result.data });
          }}
        />

        <View style={styles.overlay}>
          <View style={styles.topControls}>
            <TouchableOpacity 
              style={styles.modeButton}
              onPress={() => setScanMode('camera')}
            >
              <Text style={styles.modeButtonText}>📸 Camera</Text>
            </TouchableOpacity>
            <Text style={styles.title}>🏷️ Barcode Scanner</Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.centerGuide}>
            <View style={styles.barcodeFrame} />
            <Text style={styles.guideText}>Align barcode within the frame</Text>
          </View>

          <View style={styles.bottomControls}>
            <Text style={styles.textButtonLabel}>Scan product barcode</Text>
          </View>
        </View>

        {analyzing && (
          <View style={styles.analyzingOverlay}>
            <View style={styles.analyzingCard}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.analyzingText}>Looking up product...</Text>
            </View>
          </View>
        )}

        <StatusBar style="light" />
      </View>
    );
  }

  // Camera Mode
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.topControls}>
            <TouchableOpacity 
              style={styles.modeButton}
              onPress={() => setScanMode('barcode')}
            >
              <Text style={styles.modeButtonText}>🏷️ Barcode</Text>
            </TouchableOpacity>
            <Text style={styles.title}>📊 Forma</Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.centerGuide}>
            <View style={styles.scanFrame} />
            <Text style={styles.guideText}>Position your meal within the frame</Text>
          </View>

          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
              <Text style={styles.iconText}>🖼️</Text>
              <Text style={styles.iconLabel}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}>
              <Text style={styles.iconText}>🔄</Text>
              <Text style={styles.iconLabel}>Flip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topControls: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  centerGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  guideText: {
    marginTop: 24,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  iconButton: {
    alignItems: 'center',
  },
  iconText: {
    fontSize: 32,
  },
  iconLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#6366F1',
  },
  preview: {
    flex: 1,
    width: '100%',
  },
  resultsContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    maxHeight: '60%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  totalCalories: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6366F1',
  },
  foodItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  confidence: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  foodPortion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  foodNutrition: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#000',
  },
  button: {
    backgroundColor: '#374151',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  analyzingCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 250,
  },
  analyzingText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  analyzingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  modeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
  },
  modeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  barcodeFrame: {
    width: 280,
    height: 160,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  textButtonLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  productContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  productImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#F9FAFB',
  },
  productInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  barcode: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  servingCard: {
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  servingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  servingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  servingValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 24,
    minWidth: 100,
    textAlign: 'center',
  },
  nutritionCard: {
    padding: 20,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  nutritionLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 20,
    fontSize: 16,
    color: '#374151',
  },
});

