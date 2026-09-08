import React from 'react';
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
import { CURTAIN_HEADER, useStackScreenOptions } from './screenOptions';
import { HeaderIconButton } from './HeaderIconButton';
import { dismissAccountModal } from './dismissAccount';
import { msCloseSemibold } from '@/components/icons';
import type { MeStackParamList } from './types';

const Stack = createNativeStackNavigator<MeStackParamList>();

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
        options={({ navigation }) => ({
          title: 'Notifications',
          ...CURTAIN_HEADER,
          headerBackVisible: false,
          headerLeft: () => (
            <HeaderIconButton
              icon={msCloseSemibold}
              accessibilityLabel="Close"
              onPress={() => dismissAccountModal(navigation)}
            />
          ),
        })}
      />
      <Stack.Screen
        name="NotificationDetail"
        component={NotificationDetailScreen}
        /* The screen leads with the notification's own title, so the bar
           carrying it too would say everything twice. */
        options={{ title: '', ...CURTAIN_HEADER }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: 'Profile',
          headerBackVisible: false,
          headerLeft: () => (
            <HeaderIconButton
              icon={msCloseSemibold}
              accessibilityLabel="Close"
              onPress={() => dismissAccountModal(navigation)}
            />
          ),
        })}
      />
      <Stack.Screen name="Grades" component={GradesScreen} options={{ title: 'Course grades' }} />
      <Stack.Screen name="Balance" component={BalanceScreen} options={{ title: 'Account balance' }} />
      {searchScreens(Stack)}
    </Stack.Navigator>
  );
}
