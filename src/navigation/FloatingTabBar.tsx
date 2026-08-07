import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, View, type LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialSymbol, tabSymbols } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { primitiveIconSize } from '@/design-system/tokens/primitive';
import type { MainTabParamList } from './types';

/** Page grey (#F7F7F8) at slight transparency so BlurView reads through. */
const TAB_BAR_SURFACE = 'rgba(247, 247, 248, 0.72)';
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
/** Gap between pill and home-indicator / safe-area bottom. */
const BOTTOM_GAP = 4;

type TabLayout = { x: number; width: number };

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

  const layoutsRef = useRef<Record<number, TabLayout>>({});
  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const didAnimateRef = useRef(false);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  const moveIndicatorTo = (index: number, animated: boolean) => {
    const layout = layoutsRef.current[index];
    if (!layout) return;

    if (!animated || !didAnimateRef.current) {
      indicatorX.setValue(layout.x);
      indicatorWidth.setValue(layout.width);
      didAnimateRef.current = true;
      setIndicatorVisible(true);
      return;
    }

    Animated.parallel([
      Animated.timing(indicatorX, {
        toValue: layout.x,
        duration: theme.motion.durationNormal,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(indicatorWidth, {
        toValue: layout.width,
        duration: theme.motion.durationNormal,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  };

  useEffect(() => {
    moveIndicatorTo(state.index, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- layouts + index drive the indicator
  }, [state.index]);

  const handleTabLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    layoutsRef.current[index] = { x, width };
    if (index === state.index) {
      moveIndicatorTo(index, false);
    }
  };

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
          backgroundColor: TAB_BAR_SURFACE,
          ...theme.shadow.high,
        }}
      >
        <View
          style={{
            borderRadius: theme.radius.full,
            borderWidth: 1,
            borderColor: theme.color.background,
            overflow: 'hidden',
            ...theme.shadow.low,
          }}
        >
          <BlurView
            intensity={Platform.OS === 'ios' ? 64 : 56}
            tint="light"
            style={{
              height: PILL_HEIGHT,
              backgroundColor: TAB_BAR_SURFACE,
            }}
            accessibilityRole="tablist"
          >
            <View
              style={{
                flex: 1,
                margin: BAR_PADDING,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {indicatorVisible ? (
                <Animated.View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    borderRadius: theme.radius.full,
                    backgroundColor: ACTIVE_PILL,
                    width: indicatorWidth,
                    transform: [{ translateX: indicatorX }],
                  }}
                />
              ) : null}

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
                    onLayout={handleTabLayout(index)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: focused }}
                    accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      paddingHorizontal: TAB_HORIZONTAL_PADDING,
                      borderRadius: theme.radius.full,
                      minWidth: theme.touchTargetMinSize,
                      zIndex: 1,
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
            </View>
          </BlurView>
        </View>
      </View>
    </View>
  );
}

/** Extra scroll inset so content clears the floating pill + home indicator. */
export function useFloatingTabBarScrollInset(): number {
  const insets = useSafeAreaInsets();
  return PILL_HEIGHT + insets.bottom + BOTTOM_GAP + 8;
}
