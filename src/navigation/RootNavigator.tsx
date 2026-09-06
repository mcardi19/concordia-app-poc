import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/state/authStore';
import { MainTabs } from './MainTabs';
import { MeStack } from './MeStack';
import { LoginScreen } from '@/screens/auth';
import { SessionDetailScreen } from '@/screens/today/SessionDetailScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          {/*
            Transparent modal hosts the shared expand surface above tabs.
            Visible motion is geometry-driven (not a stack push animation).
          */}
          <Stack.Screen
            name="SessionDetail"
            component={SessionDetailScreen}
            options={{
              headerShown: false,
              presentation: 'transparentModal',
              animation: 'none',
              gestureEnabled: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
          {/*
            Account / profile. Formerly the "Me" tab; now opened from the Home
            header's profile action and presented as a modal above the tabs.
            MeStack keeps its own in-screen header and swipe-to-dismiss.
          */}
          <Stack.Screen
            name="Account"
            component={MeStack}
            options={{ headerShown: false, presentation: 'modal' }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
