import React, { useCallback } from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackHeaderItem } from '@react-navigation/native-stack';
import { TodayScreen } from '@/screens/today/TodayScreen';
import { CampusTodayScreen } from '@/screens/campusToday/CampusTodayScreen';
import { EmergencyScreen } from '@/screens/today/EmergencyScreen';
import { useTheme } from '@/design-system/theme';
import { searchScreens } from './searchRoutes';
import { CURTAIN_HEADER, useStackScreenOptions } from './screenOptions';
import { TodayHeaderActions } from './TodayHeaderActions';
import type { TodayStackParamList } from './types';

const Stack = createNativeStackNavigator<TodayStackParamList>();

/** Material Symbols Rounded 400, exported as template PNGs for native bar buttons. */
const HEADER_ICONS = {
  security: require('../../assets/header/security.png'),
  search: require('../../assets/header/search.png'),
} as const;

export function TodayStack() {
  const screenOptions = useStackScreenOptions();
  const theme = useTheme();

  /**
   * Native bar-button items, not React views. `sharesBackground: false` is what
   * gives each its own liquid-glass capsule — a React view in `headerRight`
   * gets a single platter drawn around the whole slot, which reads as one
   * segmented control.
   */
  const headerRightItems = useCallback(
    (openSearch: () => void, openEmergency: () => void): NativeStackHeaderItem[] => [
      {
        type: 'button',
        label: '',
        icon: { type: 'image', source: HEADER_ICONS.security, tinted: true },
        sharesBackground: false,
        tintColor: theme.color.primary,
        accessibilityLabel: 'Emergency and crisis help',
        onPress: openEmergency,
      },
      {
        type: 'button',
        label: '',
        icon: { type: 'image', source: HEADER_ICONS.search, tinted: true },
        sharesBackground: false,
        tintColor: theme.color.primary,
        accessibilityLabel: 'Search',
        onPress: openSearch,
      },
    ],
    [theme.color.primary],
  );

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Today"
        component={TodayScreen}
        options={({ navigation }) => ({
          title: '',
          ...(Platform.OS === 'ios'
            ? {
                headerTransparent: true,
                headerShadowVisible: false,
                headerStyle: undefined,
                headerLargeTitleEnabled: false,
                headerTitle: '',
                unstable_headerRightItems: () =>
                  headerRightItems(
                    () => navigation.navigate('Search'),
                    () => navigation.navigate('Emergency'),
                  ),
              }
            : {
                title: 'Home',
                headerRight: () => (
                  <TodayHeaderActions
                    onSearchPress={() => navigation.navigate('Search')}
                    onSecurityPress={() => navigation.navigate('Emergency')}
                  />
                ),
              }),
        })}
      />
      <Stack.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{ title: 'Emergency & crisis', ...CURTAIN_HEADER }}
      />
      <Stack.Screen
        name="CampusToday"
        component={CampusTodayScreen}
        options={{ title: 'Campus events', ...CURTAIN_HEADER }}
      />
      {searchScreens(Stack)}
    </Stack.Navigator>
  );
}
