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

const THEME_STORAGE_KEY = '@forma_theme_mode';

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  colors: getTheme('light'),
  isDark: false,
  
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
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode === 'light' || savedMode === 'dark') {
        const colors = getTheme(savedMode);
        set({ mode: savedMode, colors, isDark: savedMode === 'dark' });
      } else {
        // Default to light mode
        const colors = getTheme('light');
        set({ mode: 'light', colors, isDark: false });
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      // Default to light mode on error
      const colors = getTheme('light');
      set({ mode: 'light', colors, isDark: false });
    }
  },
}));

