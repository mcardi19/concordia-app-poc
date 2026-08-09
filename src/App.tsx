import React, { useEffect, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppNavigation />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
