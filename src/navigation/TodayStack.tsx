import React, { useCallback } from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackHeaderItem } from '@react-navigation/native-stack';
import { TodayScreen } from '@/screens/today/TodayScreen';
import { useTheme } from '@/design-system/theme';
import { useStackScreenOptions } from './screenOptions';
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

  const headerRightItems = useCallback((): NativeStackHeaderItem[] => {
    // Native buttons + Material Symbol templates keep separate liquid-glass capsules.
    // (Custom React views cannot set sharesBackground; hidesSharedBackground strips the glass.)
    return [
      {
        type: 'button',
        label: '',
        icon: { type: 'image', source: HEADER_ICONS.security, tinted: true },
        sharesBackground: false,
        tintColor: theme.color.primary,
        accessibilityLabel: 'Security',
        onPress: () => {},
      },
      {
        type: 'button',
        label: '',
        icon: { type: 'image', source: HEADER_ICONS.search, tinted: true },
        sharesBackground: false,
        tintColor: theme.color.primary,
        accessibilityLabel: 'Search',
        onPress: () => {},
      },
    ];
  }, [theme.color.primary]);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Today"
        component={TodayScreen}
        options={{
          title: '',
          ...(Platform.OS === 'ios'
            ? {
                headerTransparent: true,
                headerShadowVisible: false,
                headerStyle: undefined,
                headerLargeTitleEnabled: false,
                headerTitle: '',
                unstable_headerRightItems: headerRightItems,
              }
            : {
                title: 'Home',
                headerRight: () => <TodayHeaderActions />,
              }),
        }}
      />
    </Stack.Navigator>
  );
}
