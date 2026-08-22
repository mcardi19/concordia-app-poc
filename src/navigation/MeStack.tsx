import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MeHomeScreen } from '@/screens/me/MeHomeScreen';
import { SettingsScreen } from '@/screens/me/SettingsScreen';
import { AppearanceScreen } from '@/screens/me/AppearanceScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { GradesScreen } from '@/screens/grades/GradesScreen';
import { BalanceScreen } from '@/screens/balance/BalanceScreen';
import { searchScreens } from './searchRoutes';
import { useStackScreenOptions } from './screenOptions';
import type { MeStackParamList } from './types';

const Stack = createNativeStackNavigator<MeStackParamList>();

export function MeStack() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MeHome" component={MeHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="Appearance" component={AppearanceScreen} options={{ title: 'Appearance' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="Grades" component={GradesScreen} options={{ title: 'Course grades' }} />
      <Stack.Screen name="Balance" component={BalanceScreen} options={{ title: 'Account balance' }} />
      {searchScreens(Stack)}
    </Stack.Navigator>
  );
}
