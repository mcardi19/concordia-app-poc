import React from 'react';
import { Platform } from 'react-native';
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useTheme } from '@/design-system/theme';
import { TodayStack } from './TodayStack';
import { ScheduleStack } from './ScheduleStack';
import { CampusStack } from './CampusStack';
import { LibraryStack } from './LibraryStack';
import { NAV_TAB_INACTIVE } from './screenOptions';
import { useTabBarMinimizeStore } from './tabBarMinimize';
import { useTabBarHidden } from './tabBarVisibility';
import type { MainTabParamList } from './types';

const Tab = createNativeBottomTabNavigator<MainTabParamList>();

/* eslint-disable @typescript-eslint/no-require-imports -- Metro static image assets */
/**
 * Material Symbols Rounded filled glyphs as PNGs for native UITabBar / BottomNavigationView.
 * Exported at wght 300, opsz 20, 34pt with @2x/@3x variants.
 *
 * iOS 26 liquid glass ignores UITabBarAppearance icon colours, so inactive/active
 * colours are baked into the assets and loaded with tinted: false.
 */
const TAB_IMAGES = {
  Today: {
    inactive: require('../../assets/tabs/today-inactive.png'),
    active: require('../../assets/tabs/today-active.png'),
  },
  Schedule: {
    inactive: require('../../assets/tabs/schedule-inactive.png'),
    active: require('../../assets/tabs/schedule-active.png'),
  },
  Campus: {
    inactive: require('../../assets/tabs/campus-inactive.png'),
    active: require('../../assets/tabs/campus-active.png'),
  },
  Library: {
    inactive: require('../../assets/tabs/library-inactive.png'),
    active: require('../../assets/tabs/library-active.png'),
  },
} as const;

/**
 * The tab bar belongs to the five roots. Anything pushed on top of one — a
 * search screen, a meal plan, a course — is somewhere you go and come back
 * from, so the bar goes away and the header's back arrow is the way out.
 *
 * Expressed as the root each tab shows rather than a list of screens that
 * hide the bar: a new pushed screen then hides it by default instead of
 * having to be remembered here.
 *
 * Read off the tab's focused route instead of each screen toggling
 * `tabBarStyle` on focus — that route's blur fires when it pushes a child,
 * which would flash the bar back mid-transition.
 */
const TAB_ROOT_ROUTE: Record<keyof MainTabParamList, string> = {
  Today: 'Today',
  Schedule: 'Schedule',
  Campus: 'CampusHome',
  Library: 'AcademicsHome',
};

export function MainTabs() {
  const theme = useTheme();
  const minimizeBehavior = useTabBarMinimizeStore((s) => s.behavior);
  /** Screens covering the bar with their own bottom sheet — Campus's drawers. */
  const hiddenByScreen = useTabBarHidden();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const name = route.name as keyof MainTabParamList;
        const images = TAB_IMAGES[name];
        // Undefined until the stack navigates — it is still showing its root.
        const nested = getFocusedRouteNameFromRoute(route);
        const atRoot = nested == null || nested === TAB_ROOT_ROUTE[name];
        const hideBar = hiddenByScreen || !atRoot;
        return {
          headerShown: false,
          tabBarLabelVisibilityMode: 'labeled',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
          },
          tabBarActiveTintColor: theme.color.primary,
          // Labels still use this; icon colours are pre-baked (see TAB_IMAGES).
          tabBarInactiveTintColor: NAV_TAB_INACTIVE,
          // systemDefault keeps UIKit’s liquid glass. systemMaterial / backgroundColor disable it.
          tabBarBlurEffect: 'systemDefault',
          // iOS 26 only expands at offset 0; we toggle to `none` on scroll-up to force expand.
          tabBarMinimizeBehavior: Platform.OS === 'ios' ? minimizeBehavior : undefined,
          // Never set backgroundColor on iOS 26+ — that forces an opaque UITabBarAppearance.
          tabBarStyle: hideBar
            ? { display: 'none' }
            : Platform.select({
                ios: undefined,
                android: { backgroundColor: theme.color.background },
              }),
          // Same iconType for inactive + selected (RNScreens requires matching types).
          tabBarIcon: images
            ? ({ focused }: { focused: boolean }) => ({
                type: 'image' as const,
                source: focused ? images.active : images.inactive,
                tinted: false,
              })
            : undefined,
        };
      }}
    >
      <Tab.Screen name="Today" component={TodayStack} options={{ title: 'Today', tabBarLabel: 'Today' }} />
      <Tab.Screen name="Schedule" component={ScheduleStack} options={{ title: 'Schedule', tabBarLabel: 'Schedule' }} />
      <Tab.Screen name="Campus" component={CampusStack} options={{ title: 'Campus', tabBarLabel: 'Campus' }} />
      <Tab.Screen name="Library" component={LibraryStack} options={{ title: 'Academic', tabBarLabel: 'Academic' }} />
    </Tab.Navigator>
  );
}
