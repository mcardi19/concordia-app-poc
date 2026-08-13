import React, { useCallback } from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackHeaderItem } from '@react-navigation/native-stack';
import { TodayScreen } from '@/screens/today/TodayScreen';
import { useTheme } from '@/design-system/theme';
import { meNotificationCount } from '@/screens/me/accountData';
import { meScreens } from './meRoutes';
import { useStackScreenOptions } from './screenOptions';
import { TodayHeaderActions } from './TodayHeaderActions';
import type { TodayStackParamList } from './types';

const Stack = createNativeStackNavigator<TodayStackParamList>();

/** Material Symbols Rounded 400, exported as template PNGs for native bar buttons. */
const HEADER_ICONS = {
  security: require('../../assets/header/security.png'),
} as const;

export function TodayStack() {
  const screenOptions = useStackScreenOptions();
  const theme = useTheme();

  /**
   * Native bar-button items, not React views. `sharesBackground: false` is what
   * gives each its own liquid-glass capsule — a React view in `headerRight`
   * gets a single platter drawn around the whole slot, which reads as one
   * segmented control.
   *
   * The profile action stays native by using the item's own affordances rather
   * than a custom view: `label` carries the initials and `badge` is UIKit's own
   * bar-button badge (iOS 26+). Schedule and Campus have no native header, so
   * they keep the React `HeaderProfileButton`.
   */
  const headerRightItems = useCallback(
    (openProfile: () => void): NativeStackHeaderItem[] => [
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
        /*
          An icon item, not a text one: UIKit sizes a text bar-button to its
          label plus fixed padding and ignores `width`, so initials always came
          out as a pill beside the icon item's circle.

          SF Symbol rather than the Material Symbol the rest of the header uses
          — the exported PNG pipeline (see HEADER_ICONS) has no profile glyph
          yet. Swap `icon` to a template PNG once one exists.
        */
        icon: { type: 'sfSymbol', name: 'person.crop.circle' },
        sharesBackground: false,
        tintColor: theme.color.primary,
        badge: meNotificationCount > 0 ? { value: meNotificationCount } : undefined,
        accessibilityLabel:
          meNotificationCount > 0
            ? `Profile, ${meNotificationCount} notifications`
            : 'Profile',
        onPress: openProfile,
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
                  headerRightItems(() => navigation.navigate('MeHome')),
              }
            : {
                title: 'Home',
                headerRight: () => <TodayHeaderActions />,
              }),
        })}
      />
      {meScreens(Stack)}
    </Stack.Navigator>
  );
}
