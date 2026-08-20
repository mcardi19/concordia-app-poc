import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AcademicDateScreen } from '@/screens/schedule/AcademicDateScreen';
import { ScheduleScreen } from '@/screens/schedule/ScheduleScreen';
import { useStackScreenOptions } from './screenOptions';
import type { ScheduleStackParamList } from './types';

const Stack = createNativeStackNavigator<ScheduleStackParamList>();

export function ScheduleStack() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Schedule" component={ScheduleScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="AcademicDate"
        component={AcademicDateScreen}
        options={{ title: 'Calendar event' }}
      />
    </Stack.Navigator>
  );
}
