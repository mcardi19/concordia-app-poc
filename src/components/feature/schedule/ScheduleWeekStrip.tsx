import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  withTiming,
  Easing,
  type SharedValue,
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { scheduleTheme } from './scheduleTheme';
import { getDayLetter, isSameDay } from './scheduleUtils';

type Props = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  /**
   * Fires when paging settles on a different week, passing that week's Sunday.
   * The screen decides what to do with it — which day to select and which
   * month to title — because both are date policy, not strip behaviour.
   */
  onVisibleWeekChange?: (weekStart: Date) => void;
  /** Days the timetable pager advances per swipe. */
  stepDays?: number;
  /** Pager offset in page units so day numbers can scale while you swipe. */
  scrollProgress?: SharedValue<number>;
  /** Month view: the strip grows into a full grid you page vertically. */
  expanded?: boolean;
  /** Fires when vertical paging settles on a different month. */
  onVisibleMonthChange?: (monthStart: Date) => void;
};

const CIRCLE = 40;

/**
 * Weeks either side of the anchor that can be paged to. A year in each
 * direction is far past any real use and still cheap — the list virtualises,
 * so only the visible page and its neighbours mount.
 */
const WEEK_RADIUS = 52;
const PAGE_COUNT = WEEK_RADIUS * 2 + 1;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/*
  Fixed metrics rather than measured ones: a paging list needs to know its page
  height before layout, and a month grid that changed height between a 5-row
  and a 6-row month would make paging jump.
*/
const DAY_ROW_HEIGHT = 48;
const WEEKDAY_HEADER_HEIGHT = 20;
/** Always six, so every month page is the same height. */
const MONTH_ROWS = 6;
const MONTH_PAGE_HEIGHT = MONTH_ROWS * DAY_ROW_HEIGHT;
/* The animated height is set on the padded root, so it has to carry the padding. */
const ROOT_VERTICAL_PADDING = 14 * 2;
const COLLAPSED_HEIGHT = 71 + ROOT_VERTICAL_PADDING;
const EXPANDED_HEIGHT = WEEKDAY_HEADER_HEIGHT + MONTH_PAGE_HEIGHT + ROOT_VERTICAL_PADDING;
/** Months either side of the anchor reachable by vertical paging. */
const MONTH_RADIUS = 24;
const MONTH_COUNT = MONTH_RADIUS * 2 + 1;

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = startOfMonth(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function monthsBetween(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

/** Spring for the press bounce on day circles. */
const PRESS_SPRING = { damping: 15, stiffness: 260, mass: 0.6 } as const;
const PULSE_SCALE = 0.88;

function utcDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function playNumberPulse(scale: SharedValue<number>) {
  scale.value = withSequence(
    withSpring(PULSE_SCALE, PRESS_SPRING),
    withSpring(1, PRESS_SPRING),
  );
}

/** Fill amount for a day circle while the timetable pager is in motion. */
function daySelectionFill(progress: number, dayOffset: number, stepDays: number): number {
  'worklet';
  const traveled = Math.min(1, Math.abs(progress));
  if (dayOffset === 0) {
    return interpolate(traveled, [0, 1], [1, 0], Extrapolation.CLAMP);
  }
  const incoming =
    (progress > 0 && dayOffset === stepDays) ||
    (progress < 0 && dayOffset === -stepDays);
  if (incoming) {
    return interpolate(traveled, [0, 1], [0, 1], Extrapolation.CLAMP);
  }
  return 0;
}

function dayOffsetFromStamp(cellStamp: number, selectedStamp: number): number {
  'worklet';
  return Math.round((cellStamp - selectedStamp) / 86_400_000);
}

function pagerNumberScale(progress: number, dayOffset: number, stepDays: number): number {
  'worklet';
  const traveled = Math.min(1, Math.abs(progress));
  if (dayOffset === 0) {
    return interpolate(traveled, [0, 1], [1, PULSE_SCALE], Extrapolation.CLAMP);
  }
  if (
    (progress > 0 && dayOffset === stepDays) ||
    (progress < 0 && dayOffset === -stepDays)
  ) {
    return interpolate(traveled, [0, 1], [PULSE_SCALE, 1], Extrapolation.CLAMP);
  }
  return 1;
}

function DayCell({
  date,
  selected,
  pulseId,
  stepDays,
  scrollProgress,
  selectedStamp,
  onPress,
  showLetter = true,
  muted = false,
}: {
  date: Date;
  selected: boolean;
  /** Bumps when the selected day changes, including from the timetable pager. */
  pulseId: number;
  stepDays: number;
  scrollProgress?: SharedValue<number>;
  selectedStamp: SharedValue<number>;
  onPress: () => void;
  /** The month grid labels its columns once at the top instead. */
  showLetter?: boolean;
  /** A day from the neighbouring month, filling out the grid. */
  muted?: boolean;
}) {
  const theme = useTheme();
  const primary = theme.color.primary;
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const pressScale = useSharedValue(1);
  const pressedRef = useRef(false);
  const cellStamp = utcDay(date);

  const fill = useDerivedValue(() => {
    const offset = dayOffsetFromStamp(cellStamp, selectedStamp.value);
    return daySelectionFill(scrollProgress?.value ?? 0, offset, stepDays);
  });

  /**
   * Selected and unselected circles share one resting size. Press still
   * springs down so the tap reads as a response. Timetable swipes drive the
   * same squash — and the fill — on the outgoing and incoming day numbers.
   */
  const circleStyle = useAnimatedStyle(() => {
    const progress = scrollProgress?.value ?? 0;
    const offset = dayOffsetFromStamp(cellStamp, selectedStamp.value);
    return {
      backgroundColor: interpolateColor(fill.value, [0, 1], [`${primary}00`, primary]),
      transform: [{ scale: pressScale.value * pagerNumberScale(progress, offset, stepDays) }],
    };
  });

  const idleNumberStyle = useAnimatedStyle(() => ({ opacity: 1 - fill.value }));
  const selectedNumberStyle = useAnimatedStyle(() => ({ opacity: fill.value }));

  useEffect(() => {
    if (!selected || pulseId === 0) return;
    if (pressedRef.current) {
      pressedRef.current = false;
      return;
    }
    playNumberPulse(pressScale);
  }, [pulseId, selected, pressScale]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressedRef.current = true;
        pressScale.value = withSpring(PULSE_SCALE, PRESS_SPRING);
      }}
      onPressOut={() => {
        pressScale.value = withSpring(1, PRESS_SPRING);
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={date.toLocaleDateString('en-CA', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })}
      style={[styles.day, muted ? styles.dayMuted : null]}
    >
      {showLetter ? (
        <Text
          variant="caption"
          style={{
            fontSize: 12,
            fontWeight: '600',
            letterSpacing: 0.2,
            color: isWeekend ? scheduleTheme.timeSubText : scheduleTheme.headingText,
          }}
        >
          {getDayLetter(date)}
        </Text>
      ) : null}

      <Animated.View style={[styles.circle, showLetter ? null : styles.circleFlush, circleStyle]}>
        <Animated.Text style={[styles.dayNum, styles.dayNumIdle, idleNumberStyle]}>
          {date.getDate()}
        </Animated.Text>
        <Animated.Text style={[styles.dayNum, styles.dayNumSelected, selectedNumberStyle]}>
          {date.getDate()}
        </Animated.Text>
      </Animated.View>

    </Pressable>
  );
}

/**
 * Week date picker, paged. Swiping moves week by week; the chevrons it used to
 * carry are gone, which is what lets the seven days span the full content
 * width. Paging is the strip's own state — moving to another week previews it
 * without changing the selected day, the way a calendar behaves.
 *
 * The selected day is a filled circle around the number only; the weekday letter
 * stays outside it, which keeps the row reading as a calendar strip rather than a
 * segmented control. Selected and unselected circles share one size; press
 * springs briefly for tap feedback.
 */
export function ScheduleWeekStrip({
  selectedDate,
  onSelectDate,
  onVisibleWeekChange,
  expanded = false,
  onVisibleMonthChange,
  stepDays = 1,
  scrollProgress,
}: Props) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Date>>(null);

  /**
   * Anchored once, on the week the strip first showed. Re-deriving it from
   * `selectedDate` would shift every page index under the list mid-scroll.
   */
  const anchor = useRef(startOfWeek(selectedDate)).current;
  const visibleIndex = useRef(WEEK_RADIUS);
  const skipFirstPulse = useRef(true);
  const skipPagerPulse = useRef(false);
  const [pulseId, setPulseId] = useState(0);
  const selectedStamp = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;

  const weeks = useMemo(
    () => Array.from({ length: PAGE_COUNT }, (_, i) => addDays(anchor, (i - WEEK_RADIUS) * 7)),
    [anchor],
  );

  /*
    Follow the selection when it moves from outside — the header's "today"
    control, or a deep link. Paging already sets `visibleIndex` before it
    reports the change, so a page-driven selection matches here and no scroll
    is issued; this only fires for changes the strip did not cause.
  */
  const selectedIndex =
    WEEK_RADIUS +
    Math.round((startOfWeek(selectedDate).getTime() - anchor.getTime()) / WEEK_MS);

  const selectedStampSv = useSharedValue(utcDay(selectedDate));

  useEffect(() => {
    if (skipFirstPulse.current) {
      skipFirstPulse.current = false;
      return;
    }
    if (skipPagerPulse.current) {
      skipPagerPulse.current = false;
      return;
    }
    setPulseId((id) => id + 1);
  }, [selectedStamp]);

  /*
    Commit the new selected day and drop pager progress in the same layout
    pass so the fill does not snap back to the outgoing day.
  */
  useLayoutEffect(() => {
    if (scrollProgress && Math.abs(scrollProgress.value) > 0.05) {
      skipPagerPulse.current = true;
    }
    selectedStampSv.value = utcDay(selectedDate);
    if (scrollProgress) {
      scrollProgress.value = 0;
    }
  }, [scrollProgress, selectedDate, selectedStampSv]);

  const renderWeek = useCallback(
    ({ item }: ListRenderItemInfo<Date>) => (
      <View style={[styles.page, { width }]}>
        {Array.from({ length: 7 }, (_, i) => {
          const date = addDays(item, i);
          return (
            <DayCell
              key={date.toISOString()}
              date={date}
              selected={isSameDay(date, selectedDate)}
              pulseId={pulseId}
              stepDays={stepDays}
              scrollProgress={scrollProgress}
              selectedStamp={selectedStampSv}
              onPress={() => onSelectDate(date)}
            />
          );
        })}
      </View>
    ),
    [width, selectedDate, onSelectDate, pulseId, stepDays, scrollProgress, selectedStampSv],
  );

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      /*
        Ignore strip paging while the timetable pager is in motion — a
        residual offset must not be treated as a week change.
      */
      if (scrollProgress && Math.abs(scrollProgress.value) > 0.05) return;
      const index = Math.round(event.nativeEvent.contentOffset.x / width);
      if (index === visibleIndex.current) return;
      visibleIndex.current = index;
      const week = weeks[index];
      if (week) onVisibleWeekChange?.(week);
    },
    [width, weeks, onVisibleWeekChange, scrollProgress],
  );

  useEffect(() => {
    if (selectedIndex === visibleIndex.current) return;
    if (selectedIndex < 0 || selectedIndex >= PAGE_COUNT) return;
    visibleIndex.current = selectedIndex;
    listRef.current?.scrollToIndex({ index: selectedIndex, animated: true });
  }, [selectedIndex]);

  const getItemLayout = useCallback(
    (_: ArrayLike<Date> | null | undefined, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  );

  /*
    Month view. Anchored on its own first-render month for the same reason the
    week pager is: re-deriving the anchor from the selection would shift every
    page index under a list mid-scroll.
  */
  const monthAnchor = useRef(startOfMonth(selectedDate)).current;
  const months = useMemo(
    () => Array.from({ length: MONTH_COUNT }, (_, i) => addMonths(monthAnchor, i - MONTH_RADIUS)),
    [monthAnchor],
  );
  const monthIndex = MONTH_RADIUS + monthsBetween(monthAnchor, selectedDate);
  const visibleMonthIndex = useRef(monthIndex);

  const renderMonth = useCallback(
    ({ item }: ListRenderItemInfo<Date>) => {
      const gridStart = startOfWeek(item);
      return (
        <View style={{ height: MONTH_PAGE_HEIGHT }}>
          {Array.from({ length: MONTH_ROWS }, (_, row) => (
            <View key={row} style={[styles.page, styles.monthRow]}>
              {Array.from({ length: 7 }, (_, col) => {
                const date = addDays(gridStart, row * 7 + col);
                return (
                  <DayCell
                    key={date.toISOString()}
                    date={date}
                    selected={isSameDay(date, selectedDate)}
                    pulseId={pulseId}
                    stepDays={stepDays}
                    selectedStamp={selectedStampSv}
                    onPress={() => onSelectDate(date)}
                    showLetter={false}
                    muted={date.getMonth() !== item.getMonth()}
                  />
                );
              })}
            </View>
          ))}
        </View>
      );
    },
    [selectedDate, onSelectDate, pulseId, stepDays, selectedStampSv],
  );

  const getMonthLayout = useCallback(
    (_: ArrayLike<Date> | null | undefined, index: number) => ({
      length: MONTH_PAGE_HEIGHT,
      offset: MONTH_PAGE_HEIGHT * index,
      index,
    }),
    [],
  );

  const onMonthScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.y / MONTH_PAGE_HEIGHT);
      if (index === visibleMonthIndex.current) return;
      visibleMonthIndex.current = index;
      const month = months[index];
      if (month) onVisibleMonthChange?.(month);
    },
    [months, onVisibleMonthChange],
  );

  /*
    The container grows into the grid rather than swapping height instantly,
    so the timetable below slides down with it.
  */
  const heightStyle = useAnimatedStyle(() => ({
    height: withTiming(expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    }),
  }));

  if (expanded) {
    return (
      <Animated.View style={[styles.root, heightStyle]}>
        <View style={[styles.page, styles.weekdayHeader]}>
          {WEEKDAY_LETTERS.map((letter, i) => (
            <Text
              key={`${letter}-${i}`}
              variant="caption"
              style={[
                styles.weekdayLetter,
                {
                  color:
                    i === 0 || i === 6
                      ? scheduleTheme.timeSubText
                      : scheduleTheme.headingText,
                },
              ]}
            >
              {letter}
            </Text>
          ))}
        </View>

        <FlatList
          data={months}
          renderItem={renderMonth}
          keyExtractor={(item) => item.toISOString()}
          getItemLayout={getMonthLayout}
          initialScrollIndex={monthIndex}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={onMonthScrollEnd}
          windowSize={3}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.root, heightStyle]}>
      <FlatList
        ref={listRef}
        data={weeks}
        renderItem={renderWeek}
        keyExtractor={(item) => item.toISOString()}
        getItemLayout={getItemLayout}
        initialScrollIndex={WEEK_RADIUS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        directionalLockEnabled
        alwaysBounceVertical={false}
        overScrollMode="never"
        onMomentumScrollEnd={onMomentumScrollEnd}
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingVertical: 14,
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: scheduleTheme.mastheadBorder,
  },
  dayNum: {
    fontSize: 17,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
  },
  dayNumIdle: {
    fontWeight: '500',
    color: scheduleTheme.headingText,
  },
  dayNumSelected: {
    position: 'absolute',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  page: {
    flexDirection: 'row',
    /* Days span the full content width now that the arrows are gone. */
    paddingHorizontal: semanticSpacing.screenHorizontal,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  /** Spill days from the neighbouring month, present but recessive. */
  dayMuted: {
    opacity: 0.32,
  },
  monthRow: {
    height: DAY_ROW_HEIGHT,
  },
  weekdayHeader: {
    height: WEEKDAY_HEADER_HEIGHT,
    flexDirection: 'row',
  },
  weekdayLetter: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  /** No weekday letter above it in the month grid, so it does not need the gap. */
  circleFlush: {
    marginTop: 0,
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
});
