// Theme Configuration
// Defines color palettes for light and dark modes

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceSecondary: string;
  
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Borders and dividers
  border: string;
  divider: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Input fields
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
  
  // Buttons
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  
  // Cards
  cardBackground: string;
  cardBorder: string;
  
  // Shadows
  shadowColor: string;
}

const lightTheme: ThemeColors = {
  // Backgrounds
  background: '#F8F8F8',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9FAFB',
  
  // Text
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // Primary colors
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Borders and dividers
  border: '#E5E7EB',
  divider: '#F3F4F6',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Input fields
  inputBackground: '#F9FAFB',
  inputBorder: '#E5E7EB',
  inputText: '#111827',
  placeholder: '#9CA3AF',
  
  // Buttons
  buttonPrimary: '#6366F1',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondary: '#FFFFFF',
  buttonSecondaryText: '#374151',
  
  // Cards
  cardBackground: '#FFFFFF',
  cardBorder: '#E5E7EB',
  
  // Shadows
  shadowColor: '#000000',
};

const darkTheme: ThemeColors = {
  // Backgrounds
  background: '#000000',
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  
  // Primary colors
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Borders and dividers
  border: '#3A3A3C',
  divider: '#2C2C2E',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Input fields
  inputBackground: '#2C2C2E',
  inputBorder: '#3A3A3C',
  inputText: '#FFFFFF',
  placeholder: '#71717A',
  
  // Buttons
  buttonPrimary: '#6366F1',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondary: '#2C2C2E',
  buttonSecondaryText: '#FFFFFF',
  
  // Cards
  cardBackground: '#1C1C1E',
  cardBorder: '#3A3A3C',
  
  // Shadows
  shadowColor: '#000000',
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export const getTheme = (mode: ThemeMode): ThemeColors => {
  return themes[mode];
};

