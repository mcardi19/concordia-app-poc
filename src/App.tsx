import React, { useEffect, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '@/design-system/theme';
import { useConcordiaFonts } from '@/design-system/fonts';
import { RootNavigator } from '@/navigation';
import { createNavigationTheme } from '@/navigation/navigationTheme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden in Fast Refresh / web.
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppNavigation() {
  const theme = useTheme();
  const navigationTheme = useMemo(() => createNavigationTheme(theme), [theme]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  const { loaded, error } = useConcordiaFonts();

  useEffect(() => {
    if (!loaded && !error) return;
    SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppNavigation />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
