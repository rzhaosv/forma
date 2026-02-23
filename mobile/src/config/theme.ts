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
  // Backgrounds — premium off-black, never pure black
  background: '#0A0A0C',
  surface: '#121214',
  surfaceSecondary: '#1A1A1E',

  // Text — never pure white (eye strain)
  text: '#F0F0F5',
  textSecondary: '#A0A0B0',
  textTertiary: '#6B6B80',

  // Primary colors
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',

  // Borders and dividers
  border: 'rgba(255,255,255,0.08)',
  divider: '#1A1A1E',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Input fields
  inputBackground: '#1A1A1E',
  inputBorder: 'rgba(255,255,255,0.1)',
  inputText: '#F0F0F5',
  placeholder: '#6B6B80',

  // Buttons
  buttonPrimary: '#6366F1',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondary: '#1A1A1E',
  buttonSecondaryText: '#F0F0F5',

  // Cards
  cardBackground: '#1A1A1E',
  cardBorder: 'rgba(255,255,255,0.08)',

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

