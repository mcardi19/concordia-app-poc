import React from 'react';
import { Platform } from 'react-native';
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useTheme } from '@/design-system/theme';
import { TodayStack } from './TodayStack';
import { ScheduleStack } from './ScheduleStack';
import { CampusStack } from './CampusStack';
import { LibraryStack } from './LibraryStack';
import { MeStack } from './MeStack';
import { meNotificationCount } from '@/screens/me/accountData';
import { NAV_TAB_INACTIVE } from './screenOptions';
import { useTabBarMinimizeStore } from './tabBarMinimize';
import type { MainTabParamList } from './types';

const Tab = createNativeBottomTabNavigator<MainTabParamList>();

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
  Me: {
    inactive: require('../../assets/tabs/me-inactive.png'),
    active: require('../../assets/tabs/me-active.png'),
  },
} as const;

/**
 * Search is pushed into a tab's stack rather than being a tab, so it reads as
 * a screen you come in to and back out of — the bar goes away while it is up.
 *
 * Read off the tab's focused route instead of the screen toggling
 * `tabBarStyle` on focus: that route's blur fires when it pushes
 * SearchCategory, which would flash the bar back mid-transition.
 */
const BAR_FREE_ROUTES = new Set(['Search', 'SearchCategory']);

export function MainTabs() {
  const theme = useTheme();
  const minimizeBehavior = useTabBarMinimizeStore((s) => s.behavior);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const name = route.name as keyof MainTabParamList;
        const images = TAB_IMAGES[name];
        const nested = getFocusedRouteNameFromRoute(route);
        const hideBar = nested != null && BAR_FREE_ROUTES.has(nested);
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
      <Tab.Screen name="Today" component={TodayStack} options={{ title: 'Home', tabBarLabel: 'Home' }} />
      <Tab.Screen name="Schedule" component={ScheduleStack} options={{ title: 'Schedule', tabBarLabel: 'Schedule' }} />
      <Tab.Screen name="Campus" component={CampusStack} options={{ title: 'Campus', tabBarLabel: 'Campus' }} />
      <Tab.Screen name="Library" component={LibraryStack} options={{ title: 'Academic', tabBarLabel: 'Academic' }} />
      <Tab.Screen
        name="Me"
        component={MeStack}
        options={{
          title: 'Me',
          tabBarLabel: 'Me',
          tabBarBadge: meNotificationCount > 0 ? meNotificationCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
}
