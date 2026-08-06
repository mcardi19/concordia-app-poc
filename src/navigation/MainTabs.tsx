import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TodayStack } from './TodayStack';
import { ScheduleStack } from './ScheduleStack';
import { CampusStack } from './CampusStack';
import { LibraryStack } from './LibraryStack';
import { MeStack } from './MeStack';
import { FloatingTabBar } from './FloatingTabBar';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen name="Today" component={TodayStack} options={{ title: 'Today' }} />
      <Tab.Screen name="Schedule" component={ScheduleStack} options={{ title: 'Schedule' }} />
      <Tab.Screen name="Campus" component={CampusStack} options={{ title: 'Campus' }} />
      <Tab.Screen name="Library" component={LibraryStack} options={{ title: 'Library' }} />
      <Tab.Screen name="Me" component={MeStack} options={{ title: 'Me' }} />
    </Tab.Navigator>
  );
}
