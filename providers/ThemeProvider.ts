import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useColorScheme } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { lightColors, darkColors } from '@/constants/colors';
import type { ThemeColors } from '@/constants/colors';

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_KEY = 'canimmigrate_theme';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  const themeQuery = useQuery({
    queryKey: ['theme-mode'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      return (stored as ThemeMode) || 'system';
    },
  });

  useEffect(() => {
    if (themeQuery.data) {
      setThemeMode(themeQuery.data);
    }
  }, [themeQuery.data]);

  const themeMutation = useMutation({
    mutationFn: async (mode: ThemeMode) => {
      await AsyncStorage.setItem(THEME_KEY, mode);
      return mode;
    },
    onSuccess: (mode) => {
      setThemeMode(mode);
    },
  });

  const setTheme = useCallback((mode: ThemeMode) => {
    themeMutation.mutate(mode);
  }, [themeMutation]);

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemScheme]);

  const colors: ThemeColors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  return {
    themeMode,
    isDark,
    colors,
    setTheme,
  };
});
