import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AcademicsHomeScreen } from '@/screens/academics/AcademicsHomeScreen';
import { AcademicCalendarScreen } from '@/screens/academics/AcademicCalendarScreen';
import { GradesScreen } from '@/screens/grades/GradesScreen';
import { LibraryScreen } from '@/screens/library/LibraryScreen';
import { academicDateScreens } from './academicDateRoutes';
import { searchScreens } from './searchRoutes';
import { useStackScreenOptions } from './screenOptions';
import type { AcademicsStackParamList } from './types';

const Stack = createNativeStackNavigator<AcademicsStackParamList>();

/**
 * The Academic tab. Its root used to be the library surface; the design canvas
 * makes it the Academics overview (artboard 04), with the library reachable
 * from the Me flow instead. `Library` stays registered so the existing screen
 * is not orphaned while that move is decided.
 */
export function LibraryStack() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="AcademicsHome"
        component={AcademicsHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AcademicCalendar"
        component={AcademicCalendarScreen}
        options={{ title: 'Academic calendar' }}
      />
      <Stack.Screen name="Grades" component={GradesScreen} options={{ title: 'Grade history' }} />
      <Stack.Screen name="Library" component={LibraryScreen} options={{ title: 'Library' }} />
      {searchScreens(Stack)}
      {academicDateScreens(Stack)}
    </Stack.Navigator>
  );
}
