// Theme Store
// Manages dark mode state and persistence

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, getTheme, ThemeColors } from '../config/theme';

interface ThemeState {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleMode: () => Promise<void>;
  initialize: () => Promise<void>;
}

const THEME_STORAGE_KEY = '@nutrisnap_theme_mode';

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'dark',
  colors: getTheme('dark'),
  isDark: true,
  
  setMode: async (mode: ThemeMode) => {
    const colors = getTheme(mode);
    set({ mode, colors, isDark: mode === 'dark' });
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  },
  
  toggleMode: async () => {
    const currentMode = get().mode;
    const newMode: ThemeMode = currentMode === 'light' ? 'dark' : 'light';
    await get().setMode(newMode);
  },
  
  initialize: async () => {
    // App is dark-mode only — always enforce dark regardless of any saved preference
    const colors = getTheme('dark');
    set({ mode: 'dark', colors, isDark: true });
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } catch {
      // Non-fatal
    }
  },
}));

