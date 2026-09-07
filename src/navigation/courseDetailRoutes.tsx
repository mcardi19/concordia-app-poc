import React from 'react';
import type { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CourseDetailScreen } from '@/screens/schedule/CourseDetailScreen';
import { CURTAIN_HEADER } from './screenOptions';
import type { CourseDetailRoutes } from './types';

/**
 * Course detail, registered into a host stack.
 *
 * The same page is reachable from the Schedule timetable and from Academics
 * "My courses". Pushing onto the stack the user is already in keeps their
 * back path intact, so the screen is declared here once and spread into each
 * stack, the way `academicDateScreens` handles calendar events.
 */
export function courseDetailScreens<P extends CourseDetailRoutes>(
  Stack: ReturnType<typeof createNativeStackNavigator<P>>,
) {
  const Screen = Stack.Screen as unknown as ReturnType<
    typeof createNativeStackNavigator<CourseDetailRoutes>
  >['Screen'];

  return (
    <Screen
      name="CourseDetail"
      component={CourseDetailScreen}
      options={{ title: '', ...CURTAIN_HEADER }}
    />
  );
}
