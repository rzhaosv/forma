import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, AppState, AppStateStatus, Linking } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { analyzeFoodPhoto, mockAnalyzeFoodPhoto } from '../services/foodRecognitionService';
import { canPerformPhotoScan, recordPhotoScan, getRemainingPhotoScans } from '../utils/subscriptionLimits';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import PaywallModal from '../components/PaywallModal';

export default function CameraScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { isPremium, subscriptionStatus } = useSubscriptionStore();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const [remainingScans, setRemainingScans] = useState<number | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [isAppActive, setIsAppActive] = useState(true);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setIsAppActive(nextAppState === 'active');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    loadRemainingScans();
  }, []);

  const loadRemainingScans = async () => {
    if (subscriptionStatus === 'loading') return;
    if (!isPremium) {
      const remaining = await getRemainingPhotoScans();
      setRemainingScans(remaining);
    }
  };

  if (!permission) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            if (!permission.canAskAgain) {
              Alert.alert(
                'Camera Permission Required',
                'Please enable camera access in your device settings to use this feature.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Open Settings', onPress: () => Linking.openSettings() }
                ]
              );
            } else {
              await requestPermission();
            }
          }}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        {/* Manual check button in case state doesn't update automatically */}
        <TouchableOpacity
          style={[styles.button, { marginTop: 12, backgroundColor: '#333' }]}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Check Permission Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current && !analyzing) {
      try {
        // Check photo scan limit for free users
        if (subscriptionStatus !== 'loading' && !isPremium) {
          const canScan = await canPerformPhotoScan();
          if (!canScan) {
            setShowPaywall(true);
            return;
          }
        }

        setAnalyzing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1.0,
        });

        if (!photo) {
          throw new Error('No photo captured');
        }

        console.log('📸 Photo captured, analyzing...');

        // Record the scan for free users
        if (subscriptionStatus !== 'loading' && !isPremium) {
          await recordPhotoScan();
          await loadRemainingScans();
        }

        // Try real API first, fallback to mock if no API key
        let result;
        try {
          result = await analyzeFoodPhoto(photo.uri);
        } catch (apiError: any) {
          if (apiError.message.includes('API key not configured')) {
            console.log('⚠️ Using mock data (API key not configured)');
            result = await mockAnalyzeFoodPhoto(photo.uri);
          } else {
            throw apiError;
          }
        }

        setAnalyzing(false);

        if (result.success && result.foods.length > 0) {
          // Navigate to results screen
          navigation.navigate('FoodResults' as never, { result } as never);
        } else {
          Alert.alert(
            'No Food Detected',
            result.error || 'Could not identify any food in this photo. Try taking another photo with better lighting.',
            [
              { text: 'Try Again', style: 'default' }
            ]
          );
        }

      } catch (error: any) {
        setAnalyzing(false);
        console.error('Camera error:', error);
        Alert.alert(
          'Error',
          error.message || 'Failed to analyze photo. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      {isFocused && isAppActive && (
        <>
          <CameraView style={styles.camera} facing={facing} ref={cameraRef} />

          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Take Photo</Text>
            {!isPremium && remainingScans !== null ? (
              <View style={styles.scanCounter}>
                <Text style={styles.scanCounterText}>{remainingScans} left</Text>
              </View>
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>

          {/* Instructions or Analyzing Overlay */}
          {analyzing ? (
            <View style={styles.analyzingOverlay}>
              <ActivityIndicator size="large" color="#FFF" />
              <Text style={styles.analyzingText}>Analyzing food...</Text>
              <Text style={styles.analyzingSubtext}>This may take a few seconds</Text>
            </View>
          ) : (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                📸 Position food in frame
              </Text>
              <Text style={styles.instructionsSubtext}>
                AI will identify and calculate calories
              </Text>
            </View>
          )}

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
              disabled={analyzing}
            >
              <Text style={styles.flipText}>🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, analyzing && styles.buttonDisabled]}
              onPress={takePicture}
              disabled={analyzing}
            >
              {analyzing ? (
                <ActivityIndicator size="large" color="#6366F1" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>

            <View style={styles.flipButton} />
          </View>
        </>
      )}

      {/* Paywall Modal */}
      <PaywallModal
        isVisible={showPaywall}
        onClose={() => setShowPaywall(false)}
        title="Daily Limit Reached"
        message="You've reached your daily limit of 5 photo scans. Upgrade to Premium for unlimited scans!"
        showFeatures={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#FFF',
    fontSize: 16,
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  placeholder: {
    width: 60,
  },
  scanCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scanCounterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
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
  analyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 16,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 8,
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  flipButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 30,
  },
  flipText: {
    fontSize: 28,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#6366F1',
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
