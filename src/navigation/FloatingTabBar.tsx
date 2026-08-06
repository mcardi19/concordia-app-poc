import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialSymbol, tabSymbols } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { primitiveIconSize } from '@/design-system/tokens/primitive';
import type { MainTabParamList } from './types';

/** Figma Tab Navigation — Main tab nav: 0 4 14 / 8%. */
const TAB_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  android: { elevation: 8 },
  default: {},
});

/** Figma inactive tab icon fill (#8A8070). */
const ICON_INACTIVE = '#8A8070';
/** Figma brand / active icon fill. */
const ICON_ACTIVE = '#912238';
/** Figma brand-tint-05 active item background. */
const ACTIVE_PILL = 'rgba(145, 34, 56, 0.05)';

const ICON_SIZE = primitiveIconSize.xl;
const TAB_HORIZONTAL_PADDING = 20;
const BAR_PADDING = 4;
/** Outer pill height (Figma Tab Navigation). */
const PILL_HEIGHT = 64;
const TAB_ITEM_HEIGHT = PILL_HEIGHT - BAR_PADDING * 2;
/** Gap between pill and home-indicator / safe-area bottom (Figma: 16). */
const BOTTOM_GAP = 16;

const TAB_ICONS = {
  Today: tabSymbols.today,
  Schedule: tabSymbols.schedule,
  Campus: tabSymbols.campus,
  Library: tabSymbols.library,
  Me: tabSymbols.me,
} as const satisfies Record<keyof MainTabParamList, (typeof tabSymbols)[keyof typeof tabSymbols]>;

const TAB_LABELS: Record<keyof MainTabParamList, string> = {
  Today: 'Today',
  Schedule: 'Schedule',
  Campus: 'Campus',
  Library: 'Library',
  Me: 'Me',
};

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomOffset = insets.bottom + BOTTOM_GAP;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        paddingBottom: bottomOffset,
      }}
    >
      <View
        style={{
          borderRadius: theme.radius.full,
          ...TAB_SHADOW,
        }}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 24 : 40}
          tint="light"
          // Figma: BACKGROUND_BLUR radius 5 + white fill
          experimentalBlurMethod="dimezisBlurView"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: PILL_HEIGHT,
            borderRadius: theme.radius.full,
            overflow: 'hidden',
            padding: BAR_PADDING,
            backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.72)' : '#FFFFFF',
            ...Platform.select({
              android: { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.04)' },
              default: {},
            }),
          }}
          accessibilityRole="tablist"
        >
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const { options } = descriptors[route.key];
            const routeName = route.name as keyof MainTabParamList;
            const icons = TAB_ICONS[routeName];
            const label = options.title ?? TAB_LABELS[routeName] ?? route.name;
            const color = focused ? ICON_ACTIVE : ICON_INACTIVE;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: TAB_ITEM_HEIGHT,
                  paddingHorizontal: TAB_HORIZONTAL_PADDING,
                  borderRadius: theme.radius.full,
                  backgroundColor: focused ? ACTIVE_PILL : 'transparent',
                  minWidth: theme.touchTargetMinSize,
                }}
              >
                {icons ? (
                  <MaterialSymbol
                    icon={icons.outline}
                    filled={icons.filled}
                    active={focused}
                    size={ICON_SIZE}
                    color={color}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}

/** Extra scroll inset so content clears the floating pill + home indicator. */
export function useFloatingTabBarScrollInset(): number {
  const insets = useSafeAreaInsets();
  return PILL_HEIGHT + insets.bottom + BOTTOM_GAP + 8;
}
