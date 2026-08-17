import React from 'react';
import { Animated, Text as RNText } from 'react-native';
import { HEADER_BAR_BUTTON_SIZE } from './HeaderIconButton';
import {
  COMPACT_HOME_FADE_END,
  COMPACT_HOME_FADE_START,
  LARGE_HOME_FADE_END,
} from './homeScrollTitle';

type ScrollY = Animated.Value | Animated.AnimatedInterpolation<number>;

export const LARGE_HOME_FADE_RANGE = [0, LARGE_HOME_FADE_END] as const;
export const COMPACT_HOME_FADE_RANGE = [
  COMPACT_HOME_FADE_START,
  COMPACT_HOME_FADE_END,
] as const;

/**
 * Large Home title — screen overlay.
 *
 * Opacity comes from `scrollY`, like the translate. It briefly took a
 * React-state opacity instead, to stop the fade sticking; that made every
 * scroll frame a re-render of the whole screen, and the sticking was really
 * the overlay being unmounted and remounted as it faded.
 */
export function HomeLargeTitle({
  color,
  scrollY,
}: {
  color: string;
  scrollY: ScrollY;
}) {
  const opacity = scrollY.interpolate({
    inputRange: [...LARGE_HOME_FADE_RANGE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const translateY = scrollY.interpolate({
    inputRange: [...LARGE_HOME_FADE_RANGE],
    outputRange: [0, -8],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        height: HEADER_BAR_BUTTON_SIZE,
        justifyContent: 'center',
        overflow: 'hidden',
        opacity,
        transform: [{ translateY }],
      }}
    >
      <RNText
        accessibilityRole="header"
        numberOfLines={1}
        style={{
          fontSize: 34,
          lineHeight: 40,
          fontWeight: '700',
          color,
          letterSpacing: 0,
          marginTop: -2,
        }}
      >
        Home
      </RNText>
    </Animated.View>
  );
}

/** Compact centred Home — lives in the native headerTitle. */
export function HomeCompactTitle({
  color,
  scrollY,
}: {
  color: string;
  scrollY: ScrollY;
}) {
  const opacity = scrollY.interpolate({
    inputRange: [...COMPACT_HOME_FADE_RANGE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const translateY = scrollY.interpolate({
    inputRange: [...COMPACT_HOME_FADE_RANGE],
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
