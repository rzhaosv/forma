// Unit System Utility
// Manages unit conversions and preferences throughout the app

import AsyncStorage from '@react-native-async-storage/async-storage';

export type UnitSystem = 'metric' | 'imperial';

const UNIT_SYSTEM_KEY = '@nutrisnap_unit_system';

// Unit conversion functions with proper decimal handling
export const kgToLbs = (kg: number): number => {
  return Math.round(kg * 2.20462);
};

export const lbsToKg = (lbs: number): number => {
  return Math.round((lbs / 2.20462) * 10) / 10; // Round to 1 decimal place
};

export const cmToInches = (cm: number): number => {
  return Math.round(cm / 2.54);
};

export const inchesToCm = (inches: number): number => {
  return Math.round(inches * 2.54);
};

export const cmToFeetInches = (cm: number): { feet: number; inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

export const feetInchesToCm = (feet: number, inches: number): number => {
  return Math.round((feet * 12 + inches) * 2.54);
};

// Format weight with unit
export const formatWeight = (kg: number, unitSystem: UnitSystem): string => {
  if (unitSystem === 'imperial') {
    return `${kgToLbs(kg)} lbs`;
  }
  return `${Math.round(kg * 10) / 10} kg`;
};

// Format height with unit
export const formatHeight = (cm: number, unitSystem: UnitSystem): string => {
  if (unitSystem === 'imperial') {
    const { feet, inches } = cmToFeetInches(cm);
    return `${feet}'${inches}"`;
  }
  return `${Math.round(cm)} cm`;
};

// Get unit system from AsyncStorage
export const getUnitSystem = async (): Promise<UnitSystem> => {
  try {
    const stored = await AsyncStorage.getItem(UNIT_SYSTEM_KEY);
    return (stored as UnitSystem) || 'metric';
  } catch (error) {
    console.error('Error getting unit system:', error);
    return 'metric';
  }
};

// Save unit system to AsyncStorage
export const setUnitSystem = async (unitSystem: UnitSystem): Promise<void> => {
  try {
    await AsyncStorage.setItem(UNIT_SYSTEM_KEY, unitSystem);
  } catch (error) {
    console.error('Error saving unit system:', error);
  }
};
