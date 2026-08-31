import React from 'react';
import { Animated, StyleSheet, Text as RNText } from 'react-native';
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

/*
  The compact greeting arrives as two beats rather than one: the title runs
  over the first two thirds of the range and the subtitle over the last two
  thirds, so they overlap in the middle. Reading the same window twice with
  different bounds is what staggers them — the subtitle is still moving after
  the title has settled.
*/
const COMPACT_SPAN = COMPACT_HOME_FADE_END - COMPACT_HOME_FADE_START;
const COMPACT_TITLE_RANGE = [
  COMPACT_HOME_FADE_START,
  COMPACT_HOME_FADE_START + COMPACT_SPAN * 0.66,
] as const;
const COMPACT_SUBTITLE_RANGE = [
  COMPACT_HOME_FADE_START + COMPACT_SPAN * 0.34,
  COMPACT_HOME_FADE_END,
] as const;

/** Points each compact line rises through as it fades in. */
const COMPACT_RISE = 10;

const LARGE_TITLE_SIZE = 28;
const LARGE_TITLE_LEADING = 33;
const LARGE_SUBTITLE_SIZE = 14;
const LARGE_SUBTITLE_LEADING = 18;

const COMPACT_TITLE_SIZE = 21;
const COMPACT_TITLE_LEADING = 25;
const COMPACT_SUBTITLE_SIZE = 13;
const COMPACT_SUBTITLE_LEADING = 17;

/** Resting height of the two-line block — the overlay reserves this much. */
export const GREETING_BLOCK_HEIGHT = LARGE_TITLE_LEADING + LARGE_SUBTITLE_LEADING + 2;

/**
 * How far to lift the greeting so it centres on the action buttons.
 *
 * Both start at the same top edge, but the two-line greeting is taller than a
 * 44pt button, so sharing a top leaves its centre sitting below theirs — read
 * on screen as dead space above the title. Derived rather than a literal, so
 * it stays right if the type scale moves.
 */
export const GREETING_BUTTON_OFFSET =
  (GREETING_BLOCK_HEIGHT - HEADER_BAR_BUTTON_SIZE) / 2;

type GreetingProps = {
  name: string;
  dateLabel: string;
  color: string;
  subtitleColor: string;
  scrollY: ScrollY;
};

function GreetingText({
  name,
  dateLabel,
  color,
  subtitleColor,
  titleSize,
  titleLeading,
  subtitleSize,
  subtitleLeading,
}: Omit<GreetingProps, 'scrollY'> & {
  titleSize: number;
  titleLeading: number;
  subtitleSize: number;
  subtitleLeading: number;
}) {
  return (
    <>
      <RNText
        accessibilityRole="header"
        numberOfLines={1}
        style={{
          fontSize: titleSize,
          lineHeight: titleLeading,
          fontWeight: '700',
          letterSpacing: -0.4,
          color,
        }}
      >
        {`Hey ${name}`}
      </RNText>
      <RNText
        numberOfLines={1}
        style={{
          fontSize: subtitleSize,
          lineHeight: subtitleLeading,
          fontWeight: '400',
          color: subtitleColor,
        }}
      >
        {dateLabel}
      </RNText>
    </>
  );
}

/**
 * Resting greeting — fades out over the first few points of scroll.
 *
 * Opacity comes from `scrollY`, like the translate. It briefly took a
 * React-state opacity instead, to stop the fade sticking; that made every
 * scroll frame a re-render of the whole screen, and the sticking was really
 * the overlay being unmounted and remounted as it faded.
 */
export function HomeGreetingLarge({
  name,
  dateLabel,
  color,
  subtitleColor,
  scrollY,
}: GreetingProps) {
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
      style={[styles.layer, { opacity, transform: [{ translateY }] }]}
    >
      <GreetingText
        name={name}
        dateLabel={dateLabel}
        color={color}
        subtitleColor={subtitleColor}
        titleSize={LARGE_TITLE_SIZE}
        titleLeading={LARGE_TITLE_LEADING}
        subtitleSize={LARGE_SUBTITLE_SIZE}
        subtitleLeading={LARGE_SUBTITLE_LEADING}
      />
    </Animated.View>
  );
}

/**
 * Scrolled greeting — the same words, smaller, on the same left margin.
 *
 * A separate copy rather than the resting one scaled down: the two fade
 * ranges do not meet, so the greeting goes away entirely and comes back
 * small, instead of shrinking continuously under your finger.
 *
 * Left-aligned, which is why this is a screen overlay rather than the
 * navigator's `headerTitle` — that slot is centred and cannot be moved.
 */
export function HomeGreetingCompact({
  name,
  dateLabel,
  color,
  subtitleColor,
  scrollY,
}: GreetingProps) {
  const titleOpacity = scrollY.interpolate({
    inputRange: [...COMPACT_TITLE_RANGE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const titleTranslate = scrollY.interpolate({
    inputRange: [...COMPACT_TITLE_RANGE],
    outputRange: [COMPACT_RISE, 0],
    extrapolate: 'clamp',
  });
  const subtitleOpacity = scrollY.interpolate({
    inputRange: [...COMPACT_SUBTITLE_RANGE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const subtitleTranslate = scrollY.interpolate({
    inputRange: [...COMPACT_SUBTITLE_RANGE],
    outputRange: [COMPACT_RISE, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
      style={styles.layer}
    >
      <Animated.Text
        numberOfLines={1}
        style={{
          fontSize: COMPACT_TITLE_SIZE,
          lineHeight: COMPACT_TITLE_LEADING,
          fontWeight: '600',
          letterSpacing: -0.4,
          color,
          opacity: titleOpacity,
          transform: [{ translateY: titleTranslate }],
        }}
      >
        {`Hey ${name}`}
      </Animated.Text>
      <Animated.Text
        numberOfLines={1}
        style={{
          fontSize: COMPACT_SUBTITLE_SIZE,
          lineHeight: COMPACT_SUBTITLE_LEADING,
          fontWeight: '400',
          color: subtitleColor,
          opacity: subtitleOpacity,
          transform: [{ translateY: subtitleTranslate }],
        }}
      >
        {dateLabel}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  /* Both states stack on one origin so the left margin never shifts. */
  layer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
});
