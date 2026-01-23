import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

export default function ValueDemoScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();

  // State
  const [isScanned, setIsScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Animations
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const resultsOpacity = useRef(new Animated.Value(0)).current;
  const resultsScale = useRef(new Animated.Value(0.8)).current;
  const voiceOpacity = useRef(new Animated.Value(0)).current;
  const voiceSlide = useRef(new Animated.Value(20)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // Individual macro animations
  const caloriesAnim = useRef(new Animated.Value(0)).current;
  const proteinAnim = useRef(new Animated.Value(0)).current;
  const carbsAnim = useRef(new Animated.Value(0)).current;
  const fatAnim = useRef(new Animated.Value(0)).current;

  const handleScanPress = () => {
    setIsScanning(true);

    // Scanning animation (line moving up and down)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 1 }
    ).start();

    // After 2 seconds, show results
    setTimeout(() => {
      setIsScanning(false);
      setIsScanned(true);

      // Animate results container
      Animated.parallel([
        Animated.timing(resultsOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(resultsScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Sequential macro animations
      const animateMacro = (anim: Animated.Value, delay: number) => {
        return Animated.sequence([
          Animated.delay(delay),
          Animated.spring(anim, {
            toValue: 1,
            tension: 60,
            friction: 7,
            useNativeDriver: true,
          }),
        ]);
      };

      Animated.stagger(100, [
        animateMacro(caloriesAnim, 200),
        animateMacro(proteinAnim, 0),
        animateMacro(carbsAnim, 0),
        animateMacro(fatAnim, 0),
      ]).start();

      // Voice teaser after results
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(voiceOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(voiceSlide, {
            toValue: 0,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();

        // Continue button
        setTimeout(() => {
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        }, 400);
      }, 800);
    }, 2000);
  };

  const handleContinue = () => {
    navigation.navigate('QuickGoal' as never);
  };

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    title: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 17,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
      paddingHorizontal: 20,
    },
    imageContainer: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 24,
      backgroundColor: colors.surface,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    sampleImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    scanOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scanLine: {
      width: '100%',
      height: 3,
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 8,
    },
    scanningText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
      marginTop: 20,
    },
    scanButton: {
      backgroundColor: colors.primary,
      paddingVertical: 18,
      paddingHorizontal: 32,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
      marginBottom: 24,
    },
    scanButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
      marginLeft: 8,
    },
    resultsContainer: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    resultsTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 16,
      textAlign: 'center',
    },
    macroRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    macroRowLast: {
      borderBottomWidth: 0,
    },
    macroLabel: {
      fontSize: 17,
      color: colors.text,
      fontWeight: '600',
    },
    macroValue: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.primary,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.divider,
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 15,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    voiceTeaser: {
      width: '100%',
      backgroundColor: colors.primary + '15',
      borderRadius: 16,
      padding: 20,
      borderWidth: 2,
      borderColor: colors.primary + '30',
      marginBottom: 24,
    },
    voiceTeaserTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    speechBubble: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    speechText: {
      fontSize: 16,
      color: colors.text,
      fontStyle: 'italic',
    },
    voiceDescription: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    continueButton: {
      backgroundColor: colors.primary,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
      width: '100%',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    continueButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingTop: 60, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={dynamicStyles.title}>See the Magic in Action</Text>
        <Text style={dynamicStyles.subtitle}>
          {isScanned
            ? 'Instantly know what\'s in your food!'
            : 'Instantly know what\'s in your food. Tap below to try it!'}
        </Text>

        {/* Sample Meal Image */}
        <View style={dynamicStyles.imageContainer}>
          <Image
            source={require('../../../assets/grilled-chicken-rice.jpg')}
            style={dynamicStyles.sampleImage}
            resizeMode="cover"
          />

          {/* Scanning Overlay */}
          {isScanning && (
            <View style={dynamicStyles.scanOverlay}>
              <Animated.View
                style={[
                  dynamicStyles.scanLine,
                  {
                    transform: [{ translateY: scanLineTranslateY }],
                  },
                ]}
              />
              <Text style={dynamicStyles.scanningText}>Analyzing with NutriSnap AI...</Text>
            </View>
          )}
        </View>

        {/* Scan Button (Phase 1) */}
        {!isScanned && !isScanning && (
          <TouchableOpacity
            style={dynamicStyles.scanButton}
            onPress={handleScanPress}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={24} color="#FFFFFF" />
            <Text style={dynamicStyles.scanButtonText}>Scan This Meal</Text>
          </TouchableOpacity>
        )}

        {/* Results (Phase 2) */}
        {isScanned && (
          <>
            <Animated.View
              style={[
                dynamicStyles.resultsContainer,
                {
                  opacity: resultsOpacity,
                  transform: [{ scale: resultsScale }],
                },
              ]}
            >
              <Text style={dynamicStyles.resultsTitle}>Scan Complete!</Text>

              <Animated.View
                style={[
                  dynamicStyles.macroRow,
                  { transform: [{ scale: caloriesAnim }] },
                ]}
              >
                <Text style={dynamicStyles.macroLabel}>🔥 Calories</Text>
                <Text style={dynamicStyles.macroValue}>535</Text>
              </Animated.View>

              <Animated.View
                style={[
                  dynamicStyles.macroRow,
                  { transform: [{ scale: proteinAnim }] },
                ]}
              >
                <Text style={dynamicStyles.macroLabel}>🥩 Protein</Text>
                <Text style={dynamicStyles.macroValue}>60g</Text>
              </Animated.View>

              <Animated.View
                style={[
                  dynamicStyles.macroRow,
                  { transform: [{ scale: carbsAnim }] },
                ]}
              >
                <Text style={dynamicStyles.macroLabel}>🍚 Carbs</Text>
                <Text style={dynamicStyles.macroValue}>56g</Text>
              </Animated.View>

              <Animated.View
                style={[
                  dynamicStyles.macroRow,
                  dynamicStyles.macroRowLast,
                  { transform: [{ scale: fatAnim }] },
                ]}
              >
                <Text style={dynamicStyles.macroLabel}>🥑 Fat</Text>
                <Text style={dynamicStyles.macroValue}>7g</Text>
              </Animated.View>
            </Animated.View>

            {/* Divider */}
            <Animated.View style={[dynamicStyles.divider, { opacity: voiceOpacity }]}>
              <View style={dynamicStyles.dividerLine} />
              <Text style={dynamicStyles.dividerText}>OR</Text>
              <View style={dynamicStyles.dividerLine} />
            </Animated.View>

            {/* Voice Teaser */}
            <Animated.View
              style={[
                dynamicStyles.voiceTeaser,
                {
                  opacity: voiceOpacity,
                  transform: [{ translateY: voiceSlide }],
                },
              ]}
            >
              <Text style={dynamicStyles.voiceTeaserTitle}>
                🎤 Too busy to snap a photo?
              </Text>

              <View style={dynamicStyles.speechBubble}>
                <Text style={dynamicStyles.speechText}>
                  "I had a chicken salad for lunch"
                </Text>
              </View>

              <Text style={dynamicStyles.voiceDescription}>
                Just say what you ate. We'll log it instantly.
              </Text>
            </Animated.View>

            {/* Continue Button */}
            <Animated.View style={{ width: '100%', opacity: buttonOpacity }}>
              <TouchableOpacity
                style={dynamicStyles.continueButton}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={dynamicStyles.continueButtonText}>
                  Wow! Let's Set My Goal →
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
