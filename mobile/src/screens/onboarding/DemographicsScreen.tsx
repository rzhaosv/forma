import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore, Gender } from '../../store/useOnboardingStore';
import { useTheme } from '../../hooks/useTheme';

export default function DemographicsScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { data, updateData, setStep } = useOnboardingStore();
  
  const [age, setAge] = useState(data.age?.toString() || '28');
  const [selectedGender, setSelectedGender] = useState<Gender | undefined>(data.gender);

  const handleContinue = () => {
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      return;
    }
    
    if (!selectedGender) {
      return;
    }
    
    updateData({
      age: ageNum,
      gender: selectedGender,
    });
    
    setStep(3);
    navigation.navigate('ActivityLevel' as never);
  };

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
    scrollContent: {
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 32,
    },
    progressBar: {
      height: 4,
      backgroundColor: colors.divider,
      borderRadius: 2,
      marginBottom: 24,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 2,
      width: '50%', // Step 2 of 4
    },
    stepText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 32,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    inputContainer: {
      backgroundColor: colors.inputBackground,
      borderWidth: 2,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 32,
    },
    input: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.inputText,
      paddingVertical: 16,
    },
    genderContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 32,
    },
    genderButton: {
      flex: 1,
      minWidth: 100,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    genderButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '20',
    },
    genderButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    genderButtonTextSelected: {
      color: colors.primary,
    },
    continueButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
      opacity: selectedGender ? 1 : 0.5,
    },
    continueButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
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
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={dynamicStyles.scrollContent}>
        <Text style={dynamicStyles.title}>Tell us about yourself</Text>
        <Text style={dynamicStyles.subtitle}>
          This helps us calculate your metabolic rate
        </Text>

        {/* Progress Bar */}
        <View style={dynamicStyles.progressBar}>
          <View style={dynamicStyles.progressFill} />
        </View>
        <Text style={dynamicStyles.stepText}>Step 2 of 4</Text>

        {/* Age Input */}
        <Text style={dynamicStyles.inputLabel}>Age</Text>
        <View style={dynamicStyles.inputContainer}>
          <TextInput
            style={dynamicStyles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholder="28"
            placeholderTextColor={colors.placeholder}
          />
        </View>

        {/* Gender Selection */}
        <Text style={dynamicStyles.inputLabel}>Gender</Text>
        <View style={dynamicStyles.genderContainer}>
          {(['male', 'female', 'other'] as Gender[]).map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                dynamicStyles.genderButton,
                selectedGender === gender && dynamicStyles.genderButtonSelected,
              ]}
              onPress={() => setSelectedGender(gender)}
            >
              <Text
                style={[
                  dynamicStyles.genderButtonText,
                  selectedGender === gender && dynamicStyles.genderButtonTextSelected,
                ]}
              >
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={dynamicStyles.continueButton}
          onPress={handleContinue}
          disabled={!selectedGender}
        >
          <Text style={dynamicStyles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});

