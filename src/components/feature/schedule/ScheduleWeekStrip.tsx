import React, { useCallback, useMemo, useRef } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
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
};

const CIRCLE = 36;
/** A day at or above this many events gets the solid density dot. */
const BUSY_THRESHOLD = 3;

/**
 * Weeks either side of the anchor that can be paged to. A year in each
 * direction is far past any real use and still cheap — the list virtualises,
 * so only the visible page and its neighbours mount.
 */
const WEEK_RADIUS = 52;
const PAGE_COUNT = WEEK_RADIUS * 2 + 1;

/** Spring for the selection circle. Snappy, no overshoot worth seeing. */
const SELECT_SPRING = { damping: 15, stiffness: 260, mass: 0.6 } as const;

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

  /**
   * The circle scales up into its resting size as the day becomes selected,
   * so the fill reads as arriving rather than cutting in. Driven off the
   * boolean instead of a press handler — selection can also move by tapping
   * "today" in the header, and that should animate identically.
   */
  const circleStyle = useAnimatedStyle(
    () => ({ transform: [{ scale: withSpring(selected ? 1 : 0.82, SELECT_SPRING) }] }),
    [selected],
  );

  return (
    <Pressable
      onPress={onPress}
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
          color: scheduleTheme.timeSubText,
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
            fontSize: 17,
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
 * The selected day is a circle around the number only; the weekday letter stays
 * outside it, which keeps the row reading as a calendar strip rather than a
 * segmented control.
 */
export function ScheduleWeekStrip({ selectedDate, events, onSelectDate }: Props) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Date>>(null);

  /**
   * Anchored once, on the week the strip first showed. Re-deriving it from
   * `selectedDate` would shift every page index under the list mid-scroll.
   */
  const anchor = useRef(startOfWeek(selectedDate)).current;

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
