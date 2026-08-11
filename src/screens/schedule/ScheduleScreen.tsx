import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import { MaterialSymbol, msAdd } from '@/components/icons';
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
  MOCK_NOW_MINUTES,
  MOCK_WEEK_EVENTS,
} from '@/components/feature/schedule/scheduleMockData';
import {
  DAY_HOUR_HEIGHT,
  PLANNER_HOUR_HEIGHT,
} from '@/components/feature/schedule/scheduleTheme';
import { getWeekDates, WEEK_ORDER_KEYS } from '@/components/feature/schedule/scheduleUtils';
import { semanticSpacing } from '@/design-system/tokens';
import { useTabBarMinimizeScrollHandler } from '@/navigation/tabBarMinimize';
import { useTabBarContentPadding } from '@/navigation/tabBarInset';
import { useTheme } from '@/design-system/theme';
import { formatWeekMonday } from '@/api/schedule';

/** Friday is "today" in the design data. */
const TODAY_KEY = 'fri';
/** The 3-day planner shows today plus the next two days. */
const PLANNER_SPAN = 3;
/** Hour the day/planner grids open on — full day still scrolls above/below. */
const FOCUS_HOUR = 8;

export function ScheduleScreen() {
  const theme = useTheme();
  const tabBarPadding = useTabBarContentPadding();
  const onTabBarMinimizeScroll = useTabBarMinimizeScrollHandler();
  const glass = useMemo(() => canUseLiquidGlass(), []);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [weekMonday] = useState(() => formatWeekMonday(new Date()));
  const weekDates = useMemo(() => getWeekDates(weekMonday), [weekMonday]);
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('day');

  const todayIndex = WEEK_ORDER_KEYS.indexOf(TODAY_KEY);
  const [selectedIndex, setSelectedIndex] = useState(todayIndex);
  const selectedDate = weekDates[selectedIndex] ?? weekDates[0];
  const selectedKey = WEEK_ORDER_KEYS[selectedIndex] ?? TODAY_KEY;

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
        isToday: dayKey === TODAY_KEY,
      };
    });
  }, [selectedIndex, weekDates]);

  const plannerEvents = useMemo(() => {
    const keys = new Set(plannerDays.map((d) => d.dayKey));
    return MOCK_WEEK_EVENTS.filter((e) => keys.has(e.dayKey));
  }, [plannerDays]);

  const showsAllDayBanner = viewMode === 'day' && selectedKey === TODAY_KEY;

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
            allDayItems={selectedKey === TODAY_KEY ? MOCK_ALL_DAY_ITEMS : []}
            todayKey={TODAY_KEY}
          />
        ) : null}

        {viewMode === 'day' ? (
          <ScheduleDayTimeline
            events={dayEvents}
            nowMinutes={selectedKey === TODAY_KEY ? MOCK_NOW_MINUTES : undefined}
          />
        ) : null}

        {viewMode === 'week' ? (
          <ScheduleThreeDayView days={plannerDays} events={plannerEvents} />
        ) : null}
      </ScrollView>

      {/* Add event — present on agenda and day, not on the planner. */}
      {viewMode !== 'week' ? (
        <View
          style={[
            styles.fabWrap,
            styles.fabShadow,
            { bottom: tabBarPadding - 8, shadowColor: theme.color.primary },
          ]}
        >
          {glass ? (
            <GlassView
              isInteractive
              glassEffectStyle="regular"
              colorScheme="light"
              style={styles.fab}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add event"
                style={styles.fabFill}
              >
                <MaterialSymbol icon={msAdd} size={24} color={theme.color.primary} />
              </Pressable>
            </GlassView>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add event"
              style={[styles.fab, styles.fabFallback]}
            >
              <MaterialSymbol icon={msAdd} size={24} color={theme.color.primary} />
            </Pressable>
          )}
        </View>
      ) : null}
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
  fabWrap: {
    position: 'absolute',
    right: semanticSpacing.screenHorizontal,
  },
  /** Outer wrapper so the shadow isn't clipped by the glass `overflow: hidden`. */
  fabShadow: {
    borderRadius: 28,
    borderCurve: 'continuous',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 10,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderCurve: 'continuous',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabFill: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Only applied when liquid glass is unavailable. */
  fabFallback: {
    backgroundColor: scheduleTheme.fabFill,
  },
});
