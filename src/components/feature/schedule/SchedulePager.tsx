import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

type Props = {
  selectedDate: Date;
  /** Days advanced by one page — 1 for agenda/day, 3 for the 3-day planner. */
  stepDays: number;
  onChangeDate: (date: Date) => void;
  renderPage: (date: Date) => React.ReactNode;
  /** Pager offset in page units: -1 previous, 0 current, 1 next. */
  scrollProgress?: SharedValue<number>;
  /** Page width. Defaults to the window width. */
  pageWidth?: number;
  /** When false, the pager sizes to its pages instead of filling leftover height. */
  fill?: boolean;
};

const CENTER = 1;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Horizontal pager for the timetable. Three windows — previous, current, next —
 * so a swipe can show the neighbouring increment, then the window recenters on
 * the new date without rebuilding a long list of days.
 */
export function SchedulePager({
  selectedDate,
  stepDays,
  onChangeDate,
  renderPage,
  scrollProgress,
  pageWidth,
  fill = true,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const width = pageWidth && pageWidth > 0 ? pageWidth : windowWidth;
  const scrollRef = useRef<Animated.ScrollView>(null);
  const suppressSettle = useRef(false);
  const selectedRef = useRef(selectedDate);
  selectedRef.current = selectedDate;
  const widthSv = useSharedValue(width);
  const suppressProgress = useSharedValue(0);
  widthSv.value = width;

  const pages = useMemo(
    () => [
      addDays(selectedDate, -stepDays),
      startOfDay(selectedDate),
      addDays(selectedDate, stepDays),
    ],
    [selectedDate, stepDays],
  );

  const resetToCenter = useCallback(() => {
    suppressSettle.current = true;
    suppressProgress.value = 1;
    if (scrollProgress) {
      scrollProgress.value = 0;
    }
    scrollRef.current?.scrollTo({ x: width, y: 0, animated: false });
    const id = requestAnimationFrame(() => {
      suppressProgress.value = 0;
      suppressSettle.current = false;
    });
    return () => cancelAnimationFrame(id);
  }, [scrollProgress, suppressProgress, width]);

  useLayoutEffect(() => {
    return resetToCenter();
  }, [resetToCenter, selectedDate, stepDays]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const page = widthSv.value;
      if (!scrollProgress || page <= 0) return;
      if (suppressProgress.value) {
        scrollProgress.value = 0;
        return;
      }
      scrollProgress.value = event.contentOffset.x / page - CENTER;
    },
  });

  const settle = useCallback(
    (offsetX: number) => {
      if (suppressSettle.current || width <= 0) return;
      const index = Math.round(offsetX / width);
      if (index === CENTER) return;
      /*
        Keep progress at ±1 until `selectedDate` commits. Zeroing here would
        snap the week-strip fill back to the outgoing day before the incoming
        day becomes selected.
      */
      onChangeDate(addDays(selectedRef.current, (index - CENTER) * stepDays));
    },
    [width, stepDays, onChangeDate],
  );

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      settle(event.nativeEvent.contentOffset.x);
    },
    [settle],
  );

  const onScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if ((event.nativeEvent.velocity?.x ?? 0) !== 0) return;
      settle(event.nativeEvent.contentOffset.x);
    },
    [settle],
  );

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={fill ? styles.list : styles.listHug}
      contentOffset={{ x: width, y: 0 }}
      horizontal
      pagingEnabled
      disableIntervalMomentum
      showsHorizontalScrollIndicator={false}
      directionalLockEnabled
      alwaysBounceVertical={false}
      overScrollMode="never"
      onScroll={onScroll}
      scrollEventThrottle={16}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onScrollEndDrag={onScrollEndDrag}
    >
      {pages.map((date) => (
        <View
          key={date.toISOString()}
          style={[styles.page, { width }, fill ? styles.pageFill : null]}
        >
          {renderPage(date)}
        </View>
      ))}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listHug: {
    flexGrow: 0,
  },
  page: {},
  pageFill: {
    flex: 1,
  },
});
