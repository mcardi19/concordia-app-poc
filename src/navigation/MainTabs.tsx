import React from 'react';
import { Platform } from 'react-native';
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { useTheme } from '@/design-system/theme';
import { TodayStack } from './TodayStack';
import { ScheduleStack } from './ScheduleStack';
import { CampusStack } from './CampusStack';
import { LibraryStack } from './LibraryStack';
import { MeStack } from './MeStack';
import { NAV_TAB_INACTIVE } from './screenOptions';
import { useTabBarMinimizeStore } from './tabBarMinimize';
import type { MainTabParamList } from './types';

const Tab = createNativeBottomTabNavigator<MainTabParamList>();

/**
 * Material Symbols Rounded (weight 300) as template PNGs for native UITabBar / BottomNavigationView.
 * Assets are 30pt with @2x/@3x variants (a plain high-res PNG is treated as that many points and looks huge).
 */
const TAB_IMAGES = {
  Today: {
    outline: require('../../assets/tabs/today.png'),
    filled: require('../../assets/tabs/today-fill.png'),
  },
  Schedule: {
    outline: require('../../assets/tabs/schedule.png'),
    filled: require('../../assets/tabs/schedule-fill.png'),
  },
  Campus: {
    outline: require('../../assets/tabs/campus.png'),
    filled: require('../../assets/tabs/campus-fill.png'),
  },
  Library: {
    outline: require('../../assets/tabs/library.png'),
    filled: require('../../assets/tabs/library-fill.png'),
  },
  Me: {
    outline: require('../../assets/tabs/me.png'),
    filled: require('../../assets/tabs/me-fill.png'),
  },
} as const;

export function MainTabs() {
  const theme = useTheme();
  const minimizeBehavior = useTabBarMinimizeStore((s) => s.behavior);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const name = route.name as keyof MainTabParamList;
        const images = TAB_IMAGES[name];
        return {
          headerShown: false,
          tabBarLabelVisibilityMode: 'labeled',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
          },
          tabBarActiveTintColor: theme.color.primary,
          // Inactive tint is Android-only in the native API; iOS uses system secondary label.
          tabBarInactiveTintColor: NAV_TAB_INACTIVE,
          // systemDefault keeps UIKit’s liquid glass. systemMaterial / backgroundColor disable it.
          tabBarBlurEffect: 'systemDefault',
          // iOS 26 only expands at offset 0; we toggle to `none` on scroll-up to force expand.
          tabBarMinimizeBehavior: Platform.OS === 'ios' ? minimizeBehavior : undefined,
          // Never set backgroundColor on iOS 26+ — that forces an opaque UITabBarAppearance.
          tabBarStyle: Platform.select({
            ios: undefined,
            android: { backgroundColor: theme.color.background },
          }),
          tabBarIcon: ({ focused }: { focused: boolean }) => ({
            type: 'image' as const,
            source: focused ? images.filled : images.outline,
            tinted: true,
          }),
        };
      }}
    >
      <Tab.Screen name="Today" component={TodayStack} options={{ title: 'Home', tabBarLabel: 'Home' }} />
      <Tab.Screen name="Schedule" component={ScheduleStack} options={{ title: 'Schedule', tabBarLabel: 'Schedule' }} />
      <Tab.Screen name="Campus" component={CampusStack} options={{ title: 'Campus', tabBarLabel: 'Campus' }} />
      <Tab.Screen name="Library" component={LibraryStack} options={{ title: 'Academic', tabBarLabel: 'Academic' }} />
      <Tab.Screen name="Me" component={MeStack} options={{ title: 'Me', tabBarLabel: 'Me' }} />
    </Tab.Navigator>
  );
}
