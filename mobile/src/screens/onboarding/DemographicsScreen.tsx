import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore, Gender } from '../../store/useOnboardingStore';
import { useTheme } from '../../hooks/useTheme';
import Slider from '@react-native-community/slider';
import OnboardingProgress from '../../components/OnboardingProgress';
import { Ionicons } from '@expo/vector-icons';

export default function DemographicsScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { data, updateData, setStep } = useOnboardingStore();

  const [age, setAge] = useState(data.age || 28);
  const [selectedGender, setSelectedGender] = useState<Gender | undefined>(data.gender);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const genderScales = useRef({
    male: new Animated.Value(1),
    female: new Animated.Value(1),
    other: new Animated.Value(1),
  }).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender);

    // Bounce animation on selection
    Animated.sequence([
      Animated.spring(genderScales[gender], {
        toValue: 1.1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(genderScales[gender], {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = () => {
    if (!selectedGender) {
      return;
    }

    updateData({
      age: age,
      gender: selectedGender,
    });

    setStep(3);
    navigation.navigate('ActivityLevel' as never);
  };

  const getAgeIcon = () => {
    if (age < 20) return 'happy';
    if (age < 30) return 'barbell';
    if (age < 40) return 'walk';
    if (age < 50) return 'person';
    if (age < 60) return 'person-circle';
    return 'glasses';
  };

  const getAgeMessage = () => {
    if (age < 20) return 'Starting young - amazing!';
    if (age < 30) return 'Prime time for fitness!';
    if (age < 40) return 'Perfect age to build habits!';
    if (age < 50) return 'Never too late to start!';
    if (age < 60) return 'Age is just a number!';
    return 'Wisdom meets wellness!';
  };

  const genderOptions: { value: Gender; icon: string; label: string; color: string }[] = [
    { value: 'male', icon: 'male', label: 'Male', color: '#3B82F6' },
    { value: 'female', icon: 'female', label: 'Female', color: '#EC4899' },
    { value: 'other', icon: 'person', label: 'Other', color: '#8B5CF6' },
  ];

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    backText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
      marginLeft: 4,
    },
    scrollContent: {
      padding: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 17,
      color: colors.textSecondary,
      marginBottom: 32,
      lineHeight: 24,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      marginBottom: 24,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    sectionLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 20,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    ageDisplay: {
      alignItems: 'center',
      marginBottom: 20,
    },
    ageEmoji: {
      fontSize: 48,
      marginBottom: 8,
    },
    ageNumber: {
      fontSize: 56,
      fontWeight: '800',
      color: colors.text,
    },
    ageMessage: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
      marginTop: 8,
    },
    slider: {
      width: '100%',
      height: 40,
    },
    sliderRange: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    rangeText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    genderContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    genderButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 3,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      minHeight: 140,
      justifyContent: 'center',
    },
    genderButtonSelected: {
      borderWidth: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    genderEmoji: {
      fontSize: 48,
      marginBottom: 12,
    },
    genderLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    continueButton: {
      backgroundColor: colors.primary,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    continueButtonDisabled: {
      opacity: 0.5,
    },
    continueButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
    encouragement: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      fontStyle: 'italic',
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

        <OnboardingProgress
          currentStep={2}
          totalSteps={4}
          stepTitles={['Physical Info', 'About You', 'Activity', 'Goals']}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={dynamicStyles.title}>Tell us about yourself! 😊</Text>
          <Text style={dynamicStyles.subtitle}>
            We'll use this to personalize your nutrition goals and recommendations.
          </Text>

          {/* Age Slider */}
          <View style={dynamicStyles.card}>
            <Text style={dynamicStyles.sectionLabel}>Your Age</Text>
            <View style={dynamicStyles.ageDisplay}>
              <Ionicons name={getAgeIcon() as any} size={48} color={colors.primary} />
              <Text style={dynamicStyles.ageNumber}>{age}</Text>
              <Text style={dynamicStyles.ageMessage}>{getAgeMessage()}</Text>
            </View>
            <Slider
              style={dynamicStyles.slider}
              minimumValue={13}
              maximumValue={100}
              value={age}
              onValueChange={(value) => setAge(Math.round(value))}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.divider}
              thumbTintColor={colors.primary}
              step={1}
            />
            <View style={dynamicStyles.sliderRange}>
              <Text style={dynamicStyles.rangeText}>13 years</Text>
              <Text style={dynamicStyles.rangeText}>100 years</Text>
            </View>
          </View>

          {/* Gender Selection */}
          <View style={dynamicStyles.card}>
            <Text style={dynamicStyles.sectionLabel}>Gender</Text>
            <View style={dynamicStyles.genderContainer}>
              {genderOptions.map((option) => (
                <Animated.View
                  key={option.value}
                  style={{ flex: 1, transform: [{ scale: genderScales[option.value] }] }}
                >
                  <TouchableOpacity
                    style={[
                      dynamicStyles.genderButton,
                      selectedGender === option.value && dynamicStyles.genderButtonSelected,
                      selectedGender === option.value && {
                        borderColor: option.color,
                        backgroundColor: option.color + '15',
                      },
                    ]}
                    onPress={() => handleGenderSelect(option.value)}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={48}
                      color={selectedGender === option.value ? option.color : colors.textSecondary}
                    />
                    <Text
                      style={[
                        dynamicStyles.genderLabel,
                        selectedGender === option.value && { color: option.color },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>

          <Text style={dynamicStyles.encouragement}>
            "The best project you'll ever work on is you!" ✨
          </Text>

          <TouchableOpacity
            style={[
              dynamicStyles.continueButton,
              !selectedGender && dynamicStyles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedGender}
          >
            <Text style={dynamicStyles.continueButtonText}>Continue →</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
