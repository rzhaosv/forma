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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { useTheme } from '../../hooks/useTheme';

export default function PhysicalInfoScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { data, updateData, setStep } = useOnboardingStore();
  
  const [weight, setWeight] = useState(data.weight_kg?.toString() || '70');
  const [height, setHeight] = useState(data.height_cm?.toString() || '175');
  const [errors, setErrors] = useState<{ weight?: string; height?: string }>({});

  const validateAndContinue = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    
    const newErrors: { weight?: string; height?: string } = {};
    
    if (!weight || isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
      newErrors.weight = 'Please enter a weight between 30-300 kg';
    }
    
    if (!height || isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      newErrors.height = 'Please enter a height between 100-250 cm';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    updateData({
      weight_kg: weightNum,
      height_cm: heightNum,
    });
    
    setStep(2);
    navigation.navigate('Demographics' as never);
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
      width: '25%', // Step 1 of 4
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
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderWidth: 2,
      borderColor: errors.weight ? colors.error : colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    input: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      color: colors.inputText,
      paddingVertical: 16,
    },
    unitText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    errorText: {
      fontSize: 14,
      color: colors.error,
      marginTop: -20,
      marginBottom: 20,
    },
    continueButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
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
        <Text style={dynamicStyles.title}>Let's personalize your calorie goal</Text>
        <Text style={dynamicStyles.subtitle}>
          We'll use this information to calculate your daily calorie needs
        </Text>

        {/* Progress Bar */}
        <View style={dynamicStyles.progressBar}>
          <View style={dynamicStyles.progressFill} />
        </View>
        <Text style={dynamicStyles.stepText}>Step 1 of 4</Text>

        {/* Weight Input */}
        <Text style={dynamicStyles.inputLabel}>What's your current weight?</Text>
        <View style={dynamicStyles.inputContainer}>
          <TextInput
            style={dynamicStyles.input}
            value={weight}
            onChangeText={(text) => {
              setWeight(text);
              if (errors.weight) setErrors({ ...errors, weight: undefined });
            }}
            keyboardType="numeric"
            placeholder="70"
            placeholderTextColor={colors.placeholder}
          />
          <Text style={dynamicStyles.unitText}>kg</Text>
        </View>
        {errors.weight && <Text style={dynamicStyles.errorText}>{errors.weight}</Text>}

        {/* Height Input */}
        <Text style={dynamicStyles.inputLabel}>Your height?</Text>
        <View style={dynamicStyles.inputContainer}>
          <TextInput
            style={dynamicStyles.input}
            value={height}
            onChangeText={(text) => {
              setHeight(text);
              if (errors.height) setErrors({ ...errors, height: undefined });
            }}
            keyboardType="numeric"
            placeholder="175"
            placeholderTextColor={colors.placeholder}
          />
          <Text style={dynamicStyles.unitText}>cm</Text>
        </View>
        {errors.height && <Text style={dynamicStyles.errorText}>{errors.height}</Text>}

        <TouchableOpacity
          style={dynamicStyles.continueButton}
          onPress={validateAndContinue}
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

