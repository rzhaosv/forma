import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { analyzePhoto, AnalysisResult } from './src/services/photoUploadService';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const cameraRef = useRef<any>(null);

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
        Alert.alert('Photo captured!', 'In a real app, this would be sent to AI for analysis.');
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
      Alert.alert('Image selected!', 'In a real app, this would be sent to AI for analysis.');
    }
  };

  const retake = () => {
    setCapturedPhoto(null);
    setAnalysisResult(null);
    setAnalyzing(false);
  };

  const handleAnalyzePhoto = async () => {
    if (!capturedPhoto) return;

    setAnalyzing(true);

    try {
      // Send photo to backend for AI analysis
      // Backend will call OpenAI Vision API
      // No storage needed - photo is analyzed and discarded
      const result = await analyzePhoto(capturedPhoto);

      if (result.success && result.foods) {
        setAnalysisResult(result);
        // Photo is now analyzed - no storage needed!
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
            onPress={handleAnalyzePhoto}
            disabled={analyzing || !!analysisResult}
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

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.topControls}>
            <Text style={styles.title}>📊 Forma - Food Scanner</Text>
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
  message: {
    textAlign: 'center',
    paddingBottom: 20,
    fontSize: 16,
    color: '#374151',
  },
});
