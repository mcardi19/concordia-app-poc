import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MeHomeScreen } from '@/screens/me/MeHomeScreen';
import { SettingsScreen } from '@/screens/me/SettingsScreen';
import { NotificationsScreen } from '@/screens/me/NotificationsScreen';
import { NotificationDetailScreen } from '@/screens/me/NotificationDetailScreen';
import { AppearanceScreen } from '@/screens/me/AppearanceScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { GradesScreen } from '@/screens/grades/GradesScreen';
import { BalanceScreen } from '@/screens/balance/BalanceScreen';
import { searchScreens } from './searchRoutes';
import { useStackScreenOptions } from './screenOptions';
import type { MeStackParamList } from './types';

const Stack = createNativeStackNavigator<MeStackParamList>();

/**
 * For screens that draw their own gradient curtain behind the bar: the bar
 * itself must not paint, or there would be two backgrounds.
 *
 * iOS only. `headerTransparent` there keeps the liquid-glass bar, while on
 * Android the header is a solid surface and content running under it would
 * just collide.
 */
const CURTAIN_HEADER = Platform.select({
  ios: { headerTransparent: true, headerShadowVisible: false, headerStyle: undefined },
  default: {},
});

export function MeStack() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MeHome" component={MeHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings', ...CURTAIN_HEADER }}
      />
      <Stack.Screen name="Appearance" component={AppearanceScreen} options={{ title: 'Appearance' }} />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications', ...CURTAIN_HEADER }}
      />
      <Stack.Screen
        name="NotificationDetail"
        component={NotificationDetailScreen}
        /* The screen leads with the notification's own title, so the bar
           carrying it too would say everything twice. */
        options={{ title: '', ...CURTAIN_HEADER }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="Grades" component={GradesScreen} options={{ title: 'Course grades' }} />
      <Stack.Screen name="Balance" component={BalanceScreen} options={{ title: 'Account balance' }} />
      {searchScreens(Stack)}
    </Stack.Navigator>
  );
}
