import React, { useCallback } from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackHeaderItem } from '@react-navigation/native-stack';
import { msSearch, msSecurity } from '@/components/icons';
import { TodayScreen } from '@/screens/today/TodayScreen';
import { useTheme } from '@/design-system/theme';
import { HeaderIconButton } from './HeaderIconButton';
import { useStackScreenOptions } from './screenOptions';
import { TodayHeaderActions } from './TodayHeaderActions';
import type { TodayStackParamList } from './types';

const Stack = createNativeStackNavigator<TodayStackParamList>();

export function TodayStack() {
  const screenOptions = useStackScreenOptions();
  const theme = useTheme();

  const headerRightItems = useCallback((): NativeStackHeaderItem[] => {
    // Custom elements keep Concordia Material Symbols inside the shared liquid-glass capsule.
    // Fixed 44×44 buttons (see HeaderIconButton) keep glyphs optically centered.
    return [
      {
        type: 'custom',
        element: (
          <HeaderIconButton
            icon={msSecurity}
            accessibilityLabel="Security"
            color={theme.color.primary}
          />
        ),
      },
      {
        type: 'custom',
        element: (
          <HeaderIconButton
            icon={msSearch}
            accessibilityLabel="Search"
            color={theme.color.primary}
          />
        ),
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
