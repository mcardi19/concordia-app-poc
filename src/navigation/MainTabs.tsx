import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TodayStack } from './TodayStack';
import { ScheduleStack } from './ScheduleStack';
import { CampusStack } from './CampusStack';
import { LibraryStack } from './LibraryStack';
import { MeStack } from './MeStack';
import { MaterialSymbol, tabSymbols } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { primitiveIconSize } from '@/design-system/tokens/primitive';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICON_SIZE = primitiveIconSize.xl;

export function MainTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.color.primary,
        tabBarInactiveTintColor: theme.color.text.subtle,
        tabBarStyle: {
          backgroundColor: theme.color.background,
          borderTopColor: theme.color.borderSubtle,
          paddingTop: 4,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 0 : 8,
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayStack}
        options={{
          title: 'Today',
          tabBarIcon: ({ focused, color }) => (
            <MaterialSymbol
              icon={tabSymbols.today.outline}
              filled={tabSymbols.today.filled}
              active={focused}
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleStack}
        options={{
          title: 'Schedule',
          tabBarIcon: ({ focused, color }) => (
            <MaterialSymbol
              icon={tabSymbols.schedule.outline}
              filled={tabSymbols.schedule.filled}
              active={focused}
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Campus"
        component={CampusStack}
        options={{
          title: 'Campus',
          tabBarIcon: ({ focused, color }) => (
            <MaterialSymbol
              icon={tabSymbols.campus.outline}
              filled={tabSymbols.campus.filled}
              active={focused}
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryStack}
        options={{
          title: 'Library',
          tabBarIcon: ({ focused, color }) => (
            <MaterialSymbol
              icon={tabSymbols.library.outline}
              filled={tabSymbols.library.filled}
              active={focused}
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Me"
        component={MeStack}
        options={{
          title: 'Me',
          tabBarIcon: ({ focused, color }) => (
            <MaterialSymbol
              icon={tabSymbols.me.outline}
              filled={tabSymbols.me.filled}
              active={focused}
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
