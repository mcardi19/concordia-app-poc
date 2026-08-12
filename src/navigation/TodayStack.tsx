import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TodayScreen } from '@/screens/today/TodayScreen';
import { meScreens } from './meRoutes';
import { useStackScreenOptions } from './screenOptions';
import { TodayHeaderActions } from './TodayHeaderActions';
import type { TodayStackParamList } from './types';

const Stack = createNativeStackNavigator<TodayStackParamList>();

export function TodayStack() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Today"
        component={TodayScreen}
        options={{
          title: '',
          /*
            The security + search pair used to be native bar-button items, so
            each kept its own liquid-glass capsule. The profile action carries
            live state — the user's initials and the notification badge — which
            a template PNG cannot express, so this row is now React views on
            both platforms. Cost of that: no native glass capsule behind these
            two buttons on iOS.
          */
          headerRight: () => <TodayHeaderActions />,
          ...(Platform.OS === 'ios'
            ? {
                headerTransparent: true,
                headerShadowVisible: false,
                headerStyle: undefined,
                headerLargeTitleEnabled: false,
                headerTitle: '',
              }
            : {
                title: 'Home',
              }),
        }}
      />
      {meScreens(Stack)}
    </Stack.Navigator>
  );
}
