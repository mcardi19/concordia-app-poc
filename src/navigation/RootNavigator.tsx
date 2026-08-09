import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/state/authStore';
import { MainTabs } from './MainTabs';
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
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
