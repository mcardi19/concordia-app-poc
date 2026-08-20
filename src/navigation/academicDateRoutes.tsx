import React from 'react';
import type { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AcademicDateScreen } from '@/screens/schedule/AcademicDateScreen';
import type { AcademicDateRoutes } from './types';

/**
 * The academic-date detail screen, registered into a host stack.
 *
 * The same date is reachable from three places — the Schedule's all-day
 * stack, the Academics carousel, and the academic calendar — and each lives
 * in a different tab. Pushing onto the stack the user is already in keeps
 * their back path intact, so the screen is declared here once and spread into
 * each stack, the way `searchScreens` handles search.
 *
 * Returns a fragment of `Stack.Screen` elements rather than a component:
 * React Navigation reads its screen config off the navigator's direct
 * children, so these have to be spread in place, not nested in a wrapper.
 */
export function academicDateScreens<P extends AcademicDateRoutes>(
  Stack: ReturnType<typeof createNativeStackNavigator<P>>,
) {
  // Narrowed for the same reason as `searchScreens` — see the note there.
  const Screen = Stack.Screen as unknown as ReturnType<
    typeof createNativeStackNavigator<AcademicDateRoutes>
  >['Screen'];

  return (
    <Screen
      name="AcademicDate"
      component={AcademicDateScreen}
      options={{ title: 'Calendar event' }}
    />
  );
}
