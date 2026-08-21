import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PLANNER_GRID_TOP,
  PLANNER_HEAD_HEIGHT,
  ScheduleAgendaView,
  ScheduleAllDayBanner,
  ScheduleDayTimeline,
  ScheduleHeader,
  ScheduleHourRail,
  SchedulePager,
  ScheduleThreeDayView,
  ScheduleWeekStrip,
  dayTimelineTopFor,
  formatClock,
  scheduleTheme,
  type PlannerDay,
  type ScheduleViewMode,
} from '@/components/feature/schedule';
import { MOCK_WEEK_EVENTS } from '@/components/feature/schedule/scheduleMockData';
import {
  DAY_HOUR_HEIGHT,
  GRID_INSET,
  HOUR_LINE_OFFSET,
  PLANNER_HOUR_HEIGHT,
  RAIL_WIDTH,
} from '@/components/feature/schedule/scheduleTheme';
import {
  getDayKey,
  getWeekDates,
  isSameDay,
} from '@/components/feature/schedule/scheduleUtils';
import { useNow } from '@/hooks';
import { allDayItemsFor } from './academicAllDay';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { useTabBarMinimizeScrollHandler } from '@/navigation/tabBarMinimize';
import { HEADER_CHROME_TOP_GAP } from '@/navigation/HeaderIconButton';
import { useTabBarContentPadding } from '@/navigation/tabBarInset';
import type { ScheduleStackScreenProps } from '@/navigation/types';
import { formatWeekMonday } from '@/api/schedule';

/** Wednesday — decides which month a week spanning a boundary is titled by. */
const MIDWEEK_OFFSET = 3;

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

const PLANNER_SPAN = 3;
/** Hour the day/planner grids open on — full day still scrolls above/below. */
const FOCUS_HOUR = 8;
/** Matches `ScheduleDayTimeline` padding above the hour grid. */
const DAY_GRID_TOP = 18;
/** One rule per hour of the day, drawn by the row rather than by a page. */
const HOUR_INDEXES = Array.from({ length: 24 }, (_, i) => i);

/**
 * "Friday August 21, 2026" — assembled rather than taken from a locale
 * pattern, which puts a comma after the weekday.
 */
function formatFullDate(date: Date): string {
  const weekday = date.toLocaleDateString('en-CA', { weekday: 'long' });
  const month = date.toLocaleDateString('en-CA', { month: 'long' });
  return `${weekday} ${month} ${date.getDate()}, ${date.getFullYear()}`;
}
/** Height of the "now" clock pill, so it can be centred on the rule. */
const NOW_CLOCK_HEIGHT = 20;
/** Thickness of the now rule — the pill centres on its middle, not its top. */
const NOW_RULE_HEIGHT = 1.5;

function plannerDaysFrom(start: Date, today: Date): PlannerDay[] {
  return Array.from({ length: PLANNER_SPAN }, (_, offset) => {
    const date = addDays(start, offset);
    return {
      dayKey: getDayKey(date),
      letter: date.toLocaleDateString('en-CA', { weekday: 'narrow' }),
      dateLabel: String(date.getDate()),
      isToday: isSameDay(date, today),
    };
  });
}

type PageProps = {
  date: Date;
  viewMode: ScheduleViewMode;
  now: Date;
  tabBarPadding: number;
  /** Timeline pages sit beside a pinned hour rail and scroll with the parent. */
  embedTimeline?: boolean;
};

function SchedulePage({
  date,
  viewMode,
  now,
  tabBarPadding,
  embedTimeline = false,
}: PageProps) {
  const scrollRef = useRef<ScrollView>(null);
  const onScroll = useTabBarMinimizeScrollHandler();
  const dayKey = getDayKey(date);
  const isViewingToday = isSameDay(date, now);
  const nowMinutes = isViewingToday ? now.getHours() * 60 + now.getMinutes() : undefined;

  const dayEvents = useMemo(
    () =>
      MOCK_WEEK_EVENTS.filter((event) => event.dayKey === dayKey).sort(
        (a, b) => a.startMinutes - b.startMinutes,
      ),
    [dayKey],
  );

  const plannerDays = useMemo(() => plannerDaysFrom(date, now), [date, now]);
  const plannerEvents = useMemo(() => {
    const keys = new Set(plannerDays.map((day) => day.dayKey));
    return MOCK_WEEK_EVENTS.filter((event) => keys.has(event.dayKey));
  }, [plannerDays]);

  useEffect(() => {
    if (embedTimeline) return;
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
  }, [viewMode, date, embedTimeline]);

  const body = (
    <>
      {viewMode === 'agenda' ? (
        <ScheduleAgendaView
          date={date}
          events={dayEvents}
          allDayItems={allDayItemsFor(date)}
          todayKey={getDayKey(now)}
          nowMinutes={nowMinutes}
        />
      ) : null}

      {viewMode === 'day' ? (
        <ScheduleDayTimeline
          events={dayEvents}
          nowMinutes={nowMinutes}
          hideRail={embedTimeline}
        />
      ) : null}

      {viewMode === 'week' ? (
        <ScheduleThreeDayView
          days={plannerDays}
          events={plannerEvents}
          hideRail={embedTimeline}
        />
      ) : null}
    </>
  );

  if (embedTimeline) {
    return body;
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroller}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarPadding }}
      scrollEventThrottle={16}
      onScroll={onScroll}
      contentInsetAdjustmentBehavior="never"
      nestedScrollEnabled
      directionalLockEnabled
    >
      {body}
    </ScrollView>
  );
}

export function ScheduleScreen({ navigation }: ScheduleStackScreenProps<'Schedule'>) {
  const theme = useTheme();
  const tabBarPadding = useTabBarContentPadding();
  const onTabBarMinimize = useTabBarMinimizeScrollHandler();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const pagerProgress = useSharedValue(0);
  const timelineScrollRef = useRef<ScrollView>(null);
  const [pagerWidth, setPagerWidth] = useState(0);

  const [viewMode, setViewMode] = useState<ScheduleViewMode>('day');

  /*
    The selected day is a date, not an index into a fixed week — the strip
    pages across weeks now, so a selection can land outside whichever week was
    current at mount.
  */
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  /** Month the header shows — the week being looked at, not the day selected. */
  const [visibleWeek, setVisibleWeek] = useState(() => new Date());
  const weekDates = useMemo(
    () => getWeekDates(formatWeekMonday(selectedDate)),
    [selectedDate],
  );

  const todayIndex = weekDates.findIndex((d) => isSameDay(d, now));
  const isViewingToday = isSameDay(selectedDate, now);
  /*
    Academic dates are a property of the day, not of today — paging to a
    Thanksgiving three weeks out should show the closure sitting on it.
  */
  const allDayItems = useMemo(() => allDayItemsFor(selectedDate), [selectedDate]);
  const showsAllDayBanner = viewMode === 'day' && allDayItems.length > 0;
  const isTimeline = viewMode === 'day' || viewMode === 'week';
  const stepDays = viewMode === 'week' ? PLANNER_SPAN : 1;
  const hourHeight = viewMode === 'day' ? DAY_HOUR_HEIGHT : PLANNER_HOUR_HEIGHT;
  const railTop =
    viewMode === 'week' ? PLANNER_GRID_TOP + PLANNER_HEAD_HEIGHT : DAY_GRID_TOP;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  /*
    Hour rules belong to the row, not to a page: like the now rule, one drawn
    inside the pager stops at the page edge instead of the screen edge. The
    3-day view keeps its own — its rules divide columns rather than crossing
    the whole width.
  */
  const showsHourRules = viewMode === 'day';
  const showsNowRule = viewMode === 'day' && isViewingToday;

  const onTimelineScroll = onTabBarMinimize;

  /*
    Open the grid on the focus hour when the rail geometry changes — not when
    the selected day does. Paging must keep the same hours on screen.
  */
  useEffect(() => {
    if (!isTimeline) return;
    const y = railTop + FOCUS_HOUR * hourHeight;
    const id = requestAnimationFrame(() => {
      timelineScrollRef.current?.scrollTo({ y, animated: false });
    });
    return () => cancelAnimationFrame(id);
  }, [isTimeline, hourHeight, railTop]);

  const goToDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setVisibleWeek(date);
  }, []);

  const renderPage = useCallback(
    (date: Date) => (
      <SchedulePage
        date={date}
        viewMode={viewMode}
        now={now}
        tabBarPadding={tabBarPadding}
        embedTimeline={isTimeline}
      />
    ),
    [viewMode, now, tabBarPadding, isTimeline],
  );

  return (
    <View style={styles.root}>
      {/*
        Header + date strip are pinned: the design marks the masthead
        `position: sticky`, and the view switcher has to stay reachable
        however far the timetable is scrolled.
      */}
      <View style={[styles.pinned, { paddingTop: insets.top + HEADER_CHROME_TOP_GAP }]}>
        <ScheduleHeader
          selectedDate={selectedDate}
          monthDate={visibleWeek}
          todayDate={weekDates[todayIndex]}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onTodayPress={() => {
            goToDate(new Date());
          }}
          showAdd={viewMode !== 'week'}
        />
        <ScheduleWeekStrip
          selectedDate={selectedDate}
          onSelectDate={goToDate}
          stepDays={stepDays}
          scrollProgress={pagerProgress}
          onVisibleWeekChange={(weekStart) => {
            /*
              Paging keeps you on the same weekday: land on Thursday, page
              forward, and you are on the next Thursday rather than back at
              Sunday. The title tracks the midweek day instead, so a week
              straddling a month boundary is titled by the month holding most
              of it — which is not necessarily the selected day's month.
            */
            setSelectedDate((prev) => addDays(weekStart, prev.getDay()));
            setVisibleWeek(addDays(weekStart, MIDWEEK_OFFSET));
          }}
        />
        {/*
          The strip sizes to what the day actually has: the date alone on a
          day with no academic entries, date plus card on a day with them. It
          used to hold a card's worth of height either way so the grid below
          would not shift when paging between the two, but reserving space for
          something absent is a worse trade than the shift.
        */}
        {viewMode === 'day' ? (
          <View
            style={[
              styles.allDayWrap,
              showsAllDayBanner ? null : styles.allDayWrapEmpty,
            ]}
          >
            {/*
              The full date, spelled out. The masthead above gives the month
              and the strip circles the number, but neither says which day of
              the week you are looking at once you have paged away from today.
              It is not part of the all-day card, so it stays legible on a day
              that has no academic dates at all.
            */}
            <Text
              variant="body"
              style={[
                styles.allDayDate,
                showsAllDayBanner ? styles.allDayDateSpaced : null,
              ]}
            >
              {formatFullDate(selectedDate)}
            </Text>
            {showsAllDayBanner ? (
              <ScheduleAllDayBanner
                items={allDayItems}
                showGutterLabel
                onSelect={(item) => navigation.navigate('AcademicDate', { id: item.id })}
              />
            ) : null}
          </View>
        ) : null}
      </View>

      {isTimeline ? (
        <ScrollView
          ref={timelineScrollRef}
          style={styles.scroller}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: tabBarPadding }}
          scrollEventThrottle={16}
          onScroll={onTimelineScroll}
          contentInsetAdjustmentBehavior="never"
          directionalLockEnabled
        >
          <View style={styles.timelineRow}>
            {/*
              The now rule lives here, not in the timeline, because the grid
              sits inside the horizontal pager and the pager clips to a page.
              Drawn against the row it reaches across the hour rail and every
              column — it is a line across the whole day, not one column —
              but stops at the screen margins like the rest of the tab.
            */}
            {showsHourRules
              ? HOUR_INDEXES.map((index) => (
                  <View
                    key={`hour-${index}`}
                    pointerEvents="none"
                    style={[
                      styles.hourRule,
                      { top: railTop + index * DAY_HOUR_HEIGHT + HOUR_LINE_OFFSET },
                    ]}
                  />
                ))
              : null}
            {showsNowRule ? (
              <>
                <View
                  pointerEvents="none"
                  style={[
                    styles.nowRule,
                    {
                      top: railTop + dayTimelineTopFor(nowMinutes),
                      backgroundColor: theme.color.primary,
                    },
                  ]}
                />
                {/*
                  The clock reads in the gutter, on the hour label it replaces:
                  same column, same right edge, so "now" simply takes over that
                  slot instead of covering an event.
                */}
                <View
                  pointerEvents="none"
                  style={[
                    styles.nowClock,
                    {
                      top:
                        railTop +
                        dayTimelineTopFor(nowMinutes) +
                        NOW_RULE_HEIGHT / 2 -
                        NOW_CLOCK_HEIGHT / 2,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.nowClockPill,
                      {
                        backgroundColor: theme.color.primary,
                        shadowColor: theme.color.primary,
                      },
                    ]}
                  >
                    <Text
                      variant="caption"
                      style={[styles.nowClockText, { color: theme.color.text.inverse }]}
                    >
                      {formatClock(nowMinutes)}
                    </Text>
                  </View>
                </View>
              </>
            ) : null}
            <View>
              <View style={{ height: railTop }} />
              <ScheduleHourRail
                hourHeight={hourHeight}
                labelOffset={viewMode === 'week' ? -5 : 0}
                labelSize={viewMode === 'week' ? 11 : 12}
              />
            </View>
            <View
              style={styles.timelinePager}
              onLayout={(event) => {
                const next = event.nativeEvent.layout.width;
                setPagerWidth((current) => (current === next ? current : next));
              }}
            >
              {pagerWidth > 0 ? (
                <SchedulePager
                  key={viewMode}
                  selectedDate={selectedDate}
                  stepDays={stepDays}
                  onChangeDate={goToDate}
                  renderPage={renderPage}
                  scrollProgress={pagerProgress}
                  pageWidth={pagerWidth}
                  fill={false}
                />
              ) : null}
            </View>
          </View>
        </ScrollView>
      ) : (
        <SchedulePager
          key={viewMode}
          selectedDate={selectedDate}
          stepDays={stepDays}
          onChangeDate={goToDate}
          renderPage={renderPage}
          scrollProgress={pagerProgress}
        />
      )}
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
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: semanticSpacing.screenHorizontal,
  },
  timelinePager: {
    flex: 1,
    minWidth: 0,
  },
  /*
    Absolute children sit against the row's border box, not its content box,
    so the screen inset is spelled out here — the rule stops on the app's
    margins instead of bleeding to the display edges.
  */
  /*
    Left edge lines up with a block's, right edge runs off the screen: the
    grid is bounded by the screen inset but the hour it marks is not.
  */
  hourRule: {
    position: 'absolute',
    left: semanticSpacing.screenHorizontal + RAIL_WIDTH + GRID_INSET,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: scheduleTheme.railLine,
  },
  /*
    Starts where the gutter ends, which is where the clock pill ends: the two
    read as one continuous marker. Running it to the screen margin instead
    would leave a stub of rule showing beside the pill.

    It does run out to the screen edge on the right, though — unlike a block,
    "now" is not bounded by the day's column. It is the one thing on this
    grid that keeps going.
  */
  nowRule: {
    position: 'absolute',
    left: semanticSpacing.screenHorizontal + RAIL_WIDTH,
    right: 0,
    height: NOW_RULE_HEIGHT,
    zIndex: 3,
  },
  /*
    The hour rail's column. The pill hangs off its right edge, where the rule
    begins, so the two meet with no rule showing to the pill's left.
  */
  nowClock: {
    position: 'absolute',
    left: semanticSpacing.screenHorizontal,
    width: RAIL_WIDTH,
    height: NOW_CLOCK_HEIGHT,
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 4,
  },
  /*
    Sized and centred rather than padded: padding leaves the digits sitting
    low in the pill, because a text box reserves room for descenders the
    time never uses.
  */
  nowClockPill: {
    paddingHorizontal: 6,
    height: NOW_CLOCK_HEIGHT,
    justifyContent: 'center',
    borderRadius: 999,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.33,
    shadowRadius: 6,
    elevation: 2,
  },
  nowClockText: {
    fontSize: 11.5,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
    includeFontPadding: false,
    /*
      Digits carry no descender, so the text box centres its own line box
      while the ink lands high. Half a point puts the numerals, rather than
      the box around them, on the capsule's centre line.
    */
    transform: [{ translateY: 0.5 }],
    // Lining figures, so the capsule does not twitch as the minute ticks.
    fontVariant: ['tabular-nums'],
  },
  allDayDate: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: scheduleTheme.headingText,
  },
  /** Only when a card follows — otherwise the wrap's own padding closes it. */
  allDayDateSpaced: {
    marginBottom: 10,
  },
  allDayWrap: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 10,
    // With a card, its gutter row carries the space below; without one,
    // `allDayWrapEmpty` does, so the date is not left against the rule.
    paddingBottom: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: scheduleTheme.mastheadBorder,
  },
  allDayWrapEmpty: {
    paddingBottom: 10,
  },
});
