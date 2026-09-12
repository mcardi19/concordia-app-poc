import React, { useCallback, useRef } from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { HEADER_BAR_BUTTON_SIZE } from './HeaderIconButton';
import {
  HOME_GREETING_COMPACT_DURATION,
  HOME_GREETING_DURATION,
  homeGreetingCollapsedForScroll,
} from './homeScrollTitle';

/*
  Progress 0 = large greeting at rest, 1 = compact header greeting settled.
  The compact pair still arrives as two beats: title over the first two thirds,
  subtitle over the last two thirds, overlapping in the middle.
*/
const LARGE_RANGE = [0, 0.55] as const;
const COMPACT_TITLE_RANGE = [0.12, 0.68] as const;
const COMPACT_SUBTITLE_RANGE = [0.38, 1] as const;

/** Points each compact line rises through as it fades in. */
const COMPACT_RISE = 10;

const LARGE_TITLE_SIZE = 34;
const LARGE_TITLE_LEADING = 40;
const LARGE_SUBTITLE_SIZE = 17;
const LARGE_SUBTITLE_LEADING = 22;
const LARGE_SUBTITLE_WEIGHT = '600';

const COMPACT_TITLE_SIZE = 21;
const COMPACT_TITLE_LEADING = 25;
const COMPACT_SUBTITLE_SIZE = 13;
const COMPACT_SUBTITLE_LEADING = 17;

/** Resting height of the two-line block — the overlay reserves this much. */
export const GREETING_BLOCK_HEIGHT = LARGE_TITLE_LEADING + LARGE_SUBTITLE_LEADING;

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
  dateLabel: string;
  color: string;
  subtitleColor: string;
  progress: SharedValue<number>;
};

/**
 * Scroll distance only trips collapse/expand. The morph itself is a timing
 * on this value (0 at top → 1 collapsed), so flick speed cannot scrub it.
 */
export function useHomeGreetingProgress() {
  const largeProgress = useSharedValue(0);
  const compactProgress = useSharedValue(0);
  const collapsedRef = useRef(false);

  const onScrollDistance = useCallback((distance: number) => {
    const next = homeGreetingCollapsedForScroll(distance, collapsedRef.current);
    if (next === collapsedRef.current) {
      return;
    }
    collapsedRef.current = next;
    const toValue = next ? 1 : 0;
    largeProgress.value = withTiming(toValue, {
      duration: HOME_GREETING_DURATION,
      easing: Easing.out(Easing.cubic),
    });
    compactProgress.value = withTiming(toValue, {
      duration: HOME_GREETING_COMPACT_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [compactProgress, largeProgress]);

  return {
    largeProgress,
    compactProgress,
    onGreetingScrollDistance: onScrollDistance,
  };
}

function useGreetingMotion(
  progress: SharedValue<number>,
  range: readonly [number, number],
  leaving: boolean,
) {
  return useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [...range],
      leaving ? [1, 0] : [0, 1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      progress.value,
      [...range],
      leaving ? [0, -8] : [COMPACT_RISE, 0],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });
}

function GreetingText({
  dateLabel,
  color,
  subtitleColor,
  titleSize,
  titleLeading,
  subtitleSize,
  subtitleLeading,
  subtitleWeight,
}: Omit<GreetingProps, 'progress'> & {
  titleSize: number;
  titleLeading: number;
  subtitleSize: number;
  subtitleLeading: number;
  subtitleWeight: '400' | '500' | '600' | '700';
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
        Today
      </RNText>
      <RNText
        numberOfLines={1}
        style={{
          fontSize: subtitleSize,
          lineHeight: subtitleLeading,
          fontWeight: subtitleWeight,
          color: subtitleColor,
        }}
      >
        {dateLabel}
      </RNText>
    </>
  );
}

/**
 * In-flow Home greeting: title + date, sitting in the page below the utility
 * header. Not scroll-driven — it travels with the content.
 */
export function HomeGreeting({
  dateLabel,
  color,
  subtitleColor,
}: Omit<GreetingProps, 'progress'>) {
  return (
    <GreetingText
      dateLabel={dateLabel}
      color={color}
      subtitleColor={subtitleColor}
      titleSize={LARGE_TITLE_SIZE}
      titleLeading={LARGE_TITLE_LEADING}
      subtitleSize={LARGE_SUBTITLE_SIZE}
      subtitleLeading={LARGE_SUBTITLE_LEADING}
      subtitleWeight={LARGE_SUBTITLE_WEIGHT}
    />
  );
}

/**
 * Resting greeting — fades out on the collapse timing, then travels with
 * the page. Progress, not scroll offset, drives the morph.
 */
export function HomeGreetingLarge({
  dateLabel,
  color,
  subtitleColor,
  progress,
}: GreetingProps) {
  const style = useGreetingMotion(progress, LARGE_RANGE, true);

  return (
    <Animated.View pointerEvents="none" style={[styles.layer, style]}>
      <GreetingText
        dateLabel={dateLabel}
        color={color}
        subtitleColor={subtitleColor}
        titleSize={LARGE_TITLE_SIZE}
        titleLeading={LARGE_TITLE_LEADING}
        subtitleSize={LARGE_SUBTITLE_SIZE}
        subtitleLeading={LARGE_SUBTITLE_LEADING}
        subtitleWeight={LARGE_SUBTITLE_WEIGHT}
      />
    </Animated.View>
  );
}

/**
 * Scrolled greeting — the same words, smaller, on the same left margin.
 *
 * A separate copy rather than the resting one scaled down. The fade windows
 * overlap on the same timed progress, so the large title is still leaving as
 * the compact one arrives — two opacities, not a live scale, but it reads
 * as one morph.
 *
 * Left-aligned, which is why this is a screen overlay rather than the
 * navigator's `headerTitle` — that slot is centred and cannot be moved.
 */
export function HomeGreetingCompact({
  dateLabel,
  color,
  subtitleColor,
  progress,
  inline = false,
}: GreetingProps & {
  /**
   * Sit in the Home header row, to the right of Emergency, instead of filling
   * a stacked overlay. Same fade; different layout.
   */
  inline?: boolean;
}) {
  const titleStyle = useGreetingMotion(progress, COMPACT_TITLE_RANGE, false);
  const subtitleStyle = useGreetingMotion(progress, COMPACT_SUBTITLE_RANGE, false);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
      style={inline ? styles.inline : styles.layer}
    >
      <Animated.Text
        numberOfLines={1}
        style={[
          {
            fontSize: COMPACT_TITLE_SIZE,
            lineHeight: COMPACT_TITLE_LEADING,
            fontWeight: '600',
            letterSpacing: -0.4,
            color,
          },
          titleStyle,
        ]}
      >
        Today
      </Animated.Text>
      <Animated.Text
        numberOfLines={1}
        style={[
          {
            fontSize: COMPACT_SUBTITLE_SIZE,
            lineHeight: COMPACT_SUBTITLE_LEADING,
            fontWeight: '400',
            color: subtitleColor,
          },
          subtitleStyle,
        ]}
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
    backgroundColor: 'transparent',
  },
  /** Header-row seat: fills the gap between Emergency and the trailing actions. */
  inline: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    // Extra air after Emergency — the row gap alone sat the title too close.
    marginLeft: 10,
  },
});
