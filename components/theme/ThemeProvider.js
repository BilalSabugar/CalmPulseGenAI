// theme/ThemeProvider.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeCtx = createContext({ isDark: false, toggle: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  // Load preference (fallback to system)
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('theme:isDark');
      if (saved === null) {
        const sys = Appearance.getColorScheme() === 'dark';
        setIsDark(sys);
      } else {
        setIsDark(saved === 'true');
      }
    })();
  }, []);

  const toggle = async () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem('theme:isDark', String(next));
      return next;
    });
  };

  const value = useMemo(() => ({ isDark, toggle }), [isDark]);

  // Optional: set web <body> color scheme
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
      document.body.style.background = isDark ? '#0b1220' : '#f8fafc';
    }
  }, [isDark]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useThemeMode = () => useContext(ThemeCtx);
