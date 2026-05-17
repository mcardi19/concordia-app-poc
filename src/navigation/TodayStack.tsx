import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TodayScreen } from '@/screens/today/TodayScreen';
import { useStackContentStyle } from './screenOptions';
import type { TodayStackParamList } from './types';

const Stack = createNativeStackNavigator<TodayStackParamList>();

export function TodayStack() {
  const contentStyle = useStackContentStyle();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle }}>
      <Stack.Screen name="Today" component={TodayScreen} />
    </Stack.Navigator>
  );
}
