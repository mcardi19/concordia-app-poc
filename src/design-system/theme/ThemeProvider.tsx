import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type Theme } from './theme';
import { useAppearanceStore, type AppearancePreference } from '@/state/appearanceStore';

type ColorScheme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  scheme: ColorScheme;
  preference: AppearancePreference;
  setPreference: (preference: AppearancePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const osScheme = useColorScheme();
  const preference = useAppearanceStore((s) => s.preference);
  const setPreference = useAppearanceStore((s) => s.setPreference);

  const scheme: ColorScheme = preference === 'system' ? (osScheme ?? 'light') : preference;
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, scheme, preference, setPreference }),
    [theme, scheme, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

export function useTheme(): Theme {
  return useThemeContext().theme;
}

/** For the Settings appearance picker — everything else should use `useTheme()`. */
export function useAppearance(): Pick<ThemeContextValue, 'scheme' | 'preference' | 'setPreference'> {
  const { scheme, preference, setPreference } = useThemeContext();
  return { scheme, preference, setPreference };
}
