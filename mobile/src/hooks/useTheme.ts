// useTheme Hook
// Convenient hook to access theme colors and mode

import { useThemeStore } from '../store/useThemeStore';

export const useTheme = () => {
  const { colors, mode, isDark, setMode, toggleMode } = useThemeStore();
  
  return {
    colors,
    mode,
    isDark,
    setMode,
    toggleMode,
  };
};

