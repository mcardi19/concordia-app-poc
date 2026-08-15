import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CampusHomeScreen } from '@/screens/campus/CampusHomeScreen';
import {
  CAMPUS_SEARCH_TRANSITION_MS,
  CampusSearchScreen,
} from '@/screens/campus/CampusSearchScreen';
import { ShuttleScheduleScreen } from '@/screens/shuttle/ShuttleScheduleScreen';
import { ShuttleTrackerScreen } from '@/screens/shuttle/ShuttleTrackerScreen';
import { EventsScreen } from '@/screens/events/EventsScreen';
import { ServicesSearchScreen } from '@/screens/services/ServicesSearchScreen';
import { useStackScreenOptions } from './screenOptions';
import type { CampusStackParamList } from './types';

const Stack = createNativeStackNavigator<CampusStackParamList>();

export function CampusStack() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="CampusHome" component={CampusHomeScreen} options={{ headerShown: false }} />
      {/*
        Headerless like the app-wide Search screen: the field owns the top of
        the screen, and Cancel beside it is the way back to the map.

        Cross-faded rather than pushed. The search field is drawn at the same
        offset and size on both screens, so with nothing sliding, the map
        turns into the search page around a bar that never moves. A push would
        carry that bar off to the left and bring in a second copy of it.

        The duration is the screen's own — Cancel slides in against the second
        half of this fade, so the two are timed together.
      */}
      <Stack.Screen
        name="CampusSearch"
        component={CampusSearchScreen}
        options={{
          headerShown: false,
          animation: 'fade',
          animationDuration: CAMPUS_SEARCH_TRANSITION_MS,
        }}
      />
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
    </Stack.Navigator>
  );
}
