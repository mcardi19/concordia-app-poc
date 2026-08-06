import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/design-system/theme';
import { useConcordiaFonts } from '@/design-system/fonts';
import { RootNavigator } from '@/navigation';

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

export default function App() {
  const { loaded, error, missingKeys } = useConcordiaFonts();

  useEffect(() => {
    if (!loaded && !error) return;

    if (error) {
      const message = `[fonts] Failed to load required Concordia fonts (${missingKeys.join(', ')}): ${error.message}`;
      if (__DEV__) {
        console.warn(message);
      } else {
        console.error(message);
      }
    }

    SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error, missingKeys]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
