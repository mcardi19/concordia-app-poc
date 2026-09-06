import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TodayScreen } from '@/screens/today/TodayScreen';
import { CampusTodayScreen } from '@/screens/campusToday/CampusTodayScreen';
import { EmergencyScreen } from '@/screens/today/EmergencyScreen';
import { searchScreens } from './searchRoutes';
import { CURTAIN_HEADER, useStackScreenOptions } from './screenOptions';
import type { TodayStackParamList } from './types';

const Stack = createNativeStackNavigator<TodayStackParamList>();

export function TodayStack() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {/*
        The Home top chrome — Emergency, the search field, Notifications and
        Profile — is rendered by the screen (`HomeHeaderBar`) rather than the
        navigator, so the search field can be the dominant full-width element.
      */}
      <Stack.Screen name="Today" component={TodayScreen} options={{ headerShown: false }} />
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
