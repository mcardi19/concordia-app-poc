import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { scheduleTheme } from './scheduleTheme';
import { getDayLetter, isSameDay } from './scheduleUtils';
import type { ScheduleEvent } from './scheduleTypes';

type Props = {
  selectedDate: Date;
  events: ScheduleEvent[];
  onSelectDate: (date: Date) => void;
  /**
   * Fires when paging settles on a different week, passing that week's Sunday.
   * The screen decides what to do with it — which day to select and which
   * month to title — because both are date policy, not strip behaviour.
   */
  onVisibleWeekChange?: (weekStart: Date) => void;
};

const CIRCLE = 40;
/** A day at or above this many events gets the solid density dot. */
const BUSY_THRESHOLD = 3;

/**
 * Weeks either side of the anchor that can be paged to. A year in each
 * direction is far past any real use and still cheap — the list virtualises,
 * so only the visible page and its neighbours mount.
 */
const WEEK_RADIUS = 52;
const PAGE_COUNT = WEEK_RADIUS * 2 + 1;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Spring for the press bounce on day circles. */
const PRESS_SPRING = { damping: 15, stiffness: 260, mass: 0.6 } as const;

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

/** Lowercase three-letter key matching ScheduleEvent.dayKey. */
function dayKeyOf(date: Date): string {
  return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
}

function DayCell({
  date,
  selected,
  count,
  onPress,
}: {
  date: Date;
  selected: boolean;
  count: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const busy = count >= BUSY_THRESHOLD;
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const scale = useSharedValue(1);

  /**
   * Selected and unselected circles share one resting size. Press still
   * springs down so the tap reads as a response without leaving the
   * current day larger than its neighbours.
   */
  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.88, PRESS_SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, PRESS_SPRING);
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={date.toLocaleDateString('en-CA', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })}
      style={styles.day}
    >
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

      <Animated.View
        style={[
          styles.circle,
          selected ? { backgroundColor: theme.color.primary } : null,
          circleStyle,
        ]}
      >
        <Text
          variant="bodySmall"
          style={{
            fontSize: 19,
            fontWeight: selected ? '700' : '500',
            color: selected ? theme.color.text.inverse : scheduleTheme.headingText,
          }}
        >
          {date.getDate()}
        </Text>
      </Animated.View>

      <View
        style={[
          styles.dot,
          {
            backgroundColor:
              count === 0
                ? 'transparent'
                : busy
                  ? theme.color.primary
                  : `${theme.color.primary}55`,
          },
        ]}
      />
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
  events,
  onSelectDate,
  onVisibleWeekChange,
}: Props) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Date>>(null);

  /**
   * Anchored once, on the week the strip first showed. Re-deriving it from
   * `selectedDate` would shift every page index under the list mid-scroll.
   */
  const anchor = useRef(startOfWeek(selectedDate)).current;
  const visibleIndex = useRef(WEEK_RADIUS);

  const weeks = useMemo(
    () => Array.from({ length: PAGE_COUNT }, (_, i) => addDays(anchor, (i - WEEK_RADIUS) * 7)),
    [anchor],
  );

  const countsByDayKey = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const event of events) {
      counts[event.dayKey] = (counts[event.dayKey] ?? 0) + 1;
    }
    return counts;
  }, [events]);

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
              count={countsByDayKey[dayKeyOf(date)] ?? 0}
              onPress={() => onSelectDate(date)}
            />
          );
        })}
      </View>
    ),
    [width, selectedDate, countsByDayKey, onSelectDate],
  );

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / width);
      if (index === visibleIndex.current) return;
      visibleIndex.current = index;
      const week = weeks[index];
      if (week) onVisibleWeekChange?.(week);
    },
    [width, weeks, onVisibleWeekChange],
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

  return (
    <View style={styles.root}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: scheduleTheme.mastheadBorder,
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
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
  },
});
