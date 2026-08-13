import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ScheduleAgendaView,
  ScheduleAllDayBanner,
  ScheduleDayTimeline,
  ScheduleHeader,
  ScheduleThreeDayView,
  ScheduleWeekStrip,
  scheduleTheme,
  type PlannerDay,
  type ScheduleViewMode,
} from '@/components/feature/schedule';
import {
  MOCK_ALL_DAY_ITEMS,
  MOCK_WEEK_EVENTS,
} from '@/components/feature/schedule/scheduleMockData';
import {
  DAY_HOUR_HEIGHT,
  PLANNER_HOUR_HEIGHT,
} from '@/components/feature/schedule/scheduleTheme';
import {
  getDayKey,
  getWeekDates,
  isSameDay,
  WEEK_ORDER_KEYS,
} from '@/components/feature/schedule/scheduleUtils';
import { useNow } from '@/hooks';
import { semanticSpacing } from '@/design-system/tokens';
import { useTabBarMinimizeScrollHandler } from '@/navigation/tabBarMinimize';
import { useTabBarContentPadding } from '@/navigation/tabBarInset';
import { formatWeekMonday } from '@/api/schedule';

/** The 3-day planner shows today plus the next two days. */
const PLANNER_SPAN = 3;
/** Hour the day/planner grids open on — full day still scrolls above/below. */
const FOCUS_HOUR = 8;

export function ScheduleScreen() {
  const tabBarPadding = useTabBarContentPadding();
  const onTabBarMinimizeScroll = useTabBarMinimizeScrollHandler();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const now = useNow();

  const [weekMonday] = useState(() => formatWeekMonday(new Date()));
  const weekDates = useMemo(() => getWeekDates(weekMonday), [weekMonday]);
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('day');

  const todayKey = getDayKey(now);
  const todayIndex = weekDates.findIndex((d) => isSameDay(d, now));
  const [selectedIndex, setSelectedIndex] = useState(() =>
    weekDates.findIndex((d) => isSameDay(d, new Date())),
  );
  const selectedDate = weekDates[selectedIndex] ?? weekDates[0];
  const selectedKey = WEEK_ORDER_KEYS[selectedIndex] ?? todayKey;
  const isViewingToday = isSameDay(selectedDate, now);
  const nowMinutes = isViewingToday ? now.getHours() * 60 + now.getMinutes() : undefined;

  const dayEvents = useMemo(
    () =>
      MOCK_WEEK_EVENTS.filter((e) => e.dayKey === selectedKey).sort(
        (a, b) => a.startMinutes - b.startMinutes,
      ),
    [selectedKey],
  );

  /** Planner window starts at the selected day and runs forward. */
  const plannerDays: PlannerDay[] = useMemo(() => {
    const start = Math.min(selectedIndex, WEEK_ORDER_KEYS.length - PLANNER_SPAN);
    return WEEK_ORDER_KEYS.slice(start, start + PLANNER_SPAN).map((dayKey, offset) => {
      const date = weekDates[start + offset];
      return {
        dayKey,
        letter: date
          ? date.toLocaleDateString('en-CA', { weekday: 'narrow' })
          : dayKey[0].toUpperCase(),
        dateLabel: date ? String(date.getDate()) : '',
        isToday: dayKey === todayKey,
      };
    });
  }, [selectedIndex, weekDates, todayKey]);

  const plannerEvents = useMemo(() => {
    const keys = new Set(plannerDays.map((d) => d.dayKey));
    return MOCK_WEEK_EVENTS.filter((e) => keys.has(e.dayKey));
  }, [plannerDays]);

  const showsAllDayBanner = viewMode === 'day' && isViewingToday;

  // Full-day grids start at midnight; land on the morning so classes are in view.
  useEffect(() => {
    if (viewMode !== 'day' && viewMode !== 'week') {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      return;
    }
    const hourHeight = viewMode === 'day' ? DAY_HOUR_HEIGHT : PLANNER_HOUR_HEIGHT;
    const y = FOCUS_HOUR * hourHeight;
    const id = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y, animated: false });
    });
    return () => cancelAnimationFrame(id);
  }, [viewMode, selectedIndex]);

  return (
    <View style={styles.root}>
      {/*
        Header + date strip are pinned: the design marks the masthead
        `position: sticky`, and the view switcher has to stay reachable
        however far the timetable is scrolled.
      */}
      <View style={[styles.pinned, { paddingTop: insets.top + 6 }]}>
        <ScheduleHeader
          selectedDate={selectedDate}
          todayDate={weekDates[todayIndex]}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onTodayPress={() => setSelectedIndex(todayIndex)}
          showAdd={viewMode !== 'week'}
        />
        <ScheduleWeekStrip
          weekDates={weekDates}
          selectedDate={selectedDate}
          events={MOCK_WEEK_EVENTS}
          onSelectDate={(date) => {
            const index = weekDates.findIndex(
              (d) => d.toDateString() === date.toDateString(),
            );
            if (index >= 0) {
              setSelectedIndex(index);
            }
          }}
        />
        {/* All-day stays under the strip so the timetable can scroll beneath it. */}
        {showsAllDayBanner ? (
          <View style={styles.allDayWrap}>
            <ScheduleAllDayBanner items={MOCK_ALL_DAY_ITEMS} />
          </View>
        ) : null}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroller}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarPadding }}
        scrollEventThrottle={16}
        onScroll={onTabBarMinimizeScroll}
        contentInsetAdjustmentBehavior="never"
      >
        {viewMode === 'agenda' ? (
          <ScheduleAgendaView
            events={dayEvents}
            weekDates={weekDates}
            allDayItems={isViewingToday ? MOCK_ALL_DAY_ITEMS : []}
            todayKey={todayKey}
          />
        ) : null}

        {viewMode === 'day' ? (
          <ScheduleDayTimeline
            events={dayEvents}
            nowMinutes={nowMinutes}
          />
        ) : null}

        {viewMode === 'week' ? (
          <ScheduleThreeDayView days={plannerDays} events={plannerEvents} />
        ) : null}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: scheduleTheme.pageBackground,
  },
  pinned: {
    backgroundColor: scheduleTheme.pageBackground,
    zIndex: 10,
  },
  /** Bounded height so the day/week grids can scroll past the first hours. */
  scroller: {
    flex: 1,
  },
  allDayWrap: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: scheduleTheme.mastheadBorder,
  },
});
