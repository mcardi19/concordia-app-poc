import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CampusHomeScreen } from '@/screens/campus/CampusHomeScreen';
import { ShuttleScheduleScreen } from '@/screens/shuttle/ShuttleScheduleScreen';
import { ShuttleTrackerScreen } from '@/screens/shuttle/ShuttleTrackerScreen';
import { EventsScreen } from '@/screens/events/EventsScreen';
import { ServicesSearchScreen } from '@/screens/services/ServicesSearchScreen';
import { meScreens } from './meRoutes';
import { useStackScreenOptions } from './screenOptions';
import type { CampusStackParamList } from './types';

const Stack = createNativeStackNavigator<CampusStackParamList>();

export function CampusStack() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="CampusHome" component={CampusHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="ShuttleSchedule"
        component={ShuttleScheduleScreen}
        options={{ title: 'Shuttle schedule' }}
      />
      <Stack.Screen
        name="ShuttleTracker"
        component={ShuttleTrackerScreen}
        options={{ title: 'Shuttle tracker' }}
      />
      <Stack.Screen name="Events" component={EventsScreen} options={{ title: 'Featured events' }} />
      <Stack.Screen
        name="ServicesSearch"
        component={ServicesSearchScreen}
        options={{ title: 'Services search' }}
      />
      {meScreens(Stack)}
    </Stack.Navigator>
  );
}
