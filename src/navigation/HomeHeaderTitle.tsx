import React from 'react';
import { Animated, Text as RNText, View } from 'react-native';
import type { NativeStackHeaderItem } from '@react-navigation/native-stack';
import { HEADER_BAR_BUTTON_SIZE } from './HeaderIconButton';

type ScrollY = Animated.Value;

/** Compact title arrives after large Home is removed. */
const COMPACT_APPEAR_RANGE = [4, 20] as const;

/** Large Home in the native header — same row as the trailing actions. */
export function HomeLargeTitle({ color }: { color: string }) {
  return (
    <View
      style={{
        height: HEADER_BAR_BUTTON_SIZE,
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <RNText
        accessibilityRole="header"
        numberOfLines={1}
        style={{
          fontSize: 34,
          lineHeight: 40,
          fontWeight: '600',
          color,
          letterSpacing: 0.4,
          marginTop: -2,
        }}
      >
        Home
      </RNText>
    </View>
  );
}

export function buildHomeExpandedLeftItems(color: string): NativeStackHeaderItem[] {
  return [
    {
      type: 'custom',
      hidesSharedBackground: true,
      element: <HomeLargeTitle color={color} />,
    },
  ];
}

/** Compact centred Home — fades in once large Home is gone. */
export function HomeCompactTitle({ color, scrollY }: { color: string; scrollY: ScrollY }) {
  const opacity = scrollY.interpolate({
    inputRange: [...COMPACT_APPEAR_RANGE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const translateY = scrollY.interpolate({
    inputRange: [...COMPACT_APPEAR_RANGE],
    outputRange: [6, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.Text
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
      style={{
        fontSize: 17,
        lineHeight: 22,
        fontWeight: '600',
        color,
        opacity,
        transform: [{ translateY }],
      }}
    >
      Home
    </Animated.Text>
  );
}
