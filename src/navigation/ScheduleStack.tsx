import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CourseDetailScreen } from '@/screens/schedule/CourseDetailScreen';
import { ScheduleScreen } from '@/screens/schedule/ScheduleScreen';
import { academicDateScreens } from './academicDateRoutes';
import { CURTAIN_HEADER, useStackScreenOptions } from './screenOptions';
import type { ScheduleStackParamList } from './types';

const Stack = createNativeStackNavigator<ScheduleStackParamList>();

export function ScheduleStack() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Schedule" component={ScheduleScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{ title: '', ...CURTAIN_HEADER }}
      />
      {academicDateScreens(Stack)}
    </Stack.Navigator>
  );
}
