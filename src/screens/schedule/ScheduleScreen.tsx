import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { Screen, Text } from '@/components/design-system';
import {
  ScheduleDayTimeline,
  ScheduleHeader,
  ScheduleWeekStrip,
  ScheduleWeekView,
  filterEventsForDay,
  getWeekDates,
  mapSisClassToEvent,
  type ScheduleViewMode,
} from '@/components/feature/schedule';
import { LoadingState, ErrorState, EmptyState } from '@/components/feature';
import { MOCK_SCHEDULE_EVENTS } from '@/components/feature/schedule/scheduleMockData';
import { getDayKey, isSameDay } from '@/components/feature/schedule/scheduleUtils';
import { useTheme } from '@/design-system/theme';
import { useSchedule } from '@/hooks/useSchedule';
import { formatWeekMonday } from '@/api/schedule';

function getFallbackEvents(weekDates: Date[]) {
  const today = new Date();
  const anchor = weekDates.find((d) => isSameDay(d, today)) ?? weekDates[4];
  const dayKey = getDayKey(anchor);
  return MOCK_SCHEDULE_EVENTS.map((event, index) => ({
    ...event,
    id: `mock-${dayKey}-${index}`,
    dayKey,
  }));
}

export function ScheduleScreen() {
  const theme = useTheme();
  const [weekMonday] = useState(() => formatWeekMonday(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('day');

  const { data, isLoading, isError, refetch } = useSchedule(weekMonday);
  const weekDates = useMemo(() => getWeekDates(weekMonday), [weekMonday]);

  useEffect(() => {
    const inWeek = weekDates.some((d) => isSameDay(d, selectedDate));
    if (!inWeek) {
      const today = new Date();
      const match = weekDates.find((d) => isSameDay(d, today));
      setSelectedDate(match ?? weekDates[0]);
    }
  }, [weekDates, selectedDate]);

  const allEvents = useMemo(() => {
    const classes = data?.scheduleList ?? [];
    if (classes.length > 0) {
      return classes.map(mapSisClassToEvent);
    }
    return getFallbackEvents(weekDates);
  }, [data?.scheduleList, weekDates]);

  const dayEvents = useMemo(
    () => filterEventsForDay(allEvents, selectedDate),
    [allEvents, selectedDate]
  );

  const usingMock = !(data?.scheduleList?.length ?? 0);
  const showEmptyDay = !isLoading && !isError && dayEvents.length === 0 && !usingMock;

  return (
    <Screen edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
      >
        <ScheduleHeader
          selectedDate={selectedDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <ScheduleWeekStrip
          weekDates={weekDates}
          selectedDate={selectedDate}
          events={allEvents}
          onSelectDate={setSelectedDate}
        />

        {isLoading ? <LoadingState /> : null}
        {isError ? (
          <ErrorState
            message="Could not load your schedule. Sign in with a valid student token to use live data."
            onRetry={() => refetch()}
          />
        ) : null}

        {!isLoading && !isError && viewMode === 'day' ? (
          <>
            {showEmptyDay ? (
              <EmptyState message="No classes scheduled for this day." />
            ) : (
              <ScheduleDayTimeline events={dayEvents} selectedDate={selectedDate} />
            )}
          </>
        ) : null}

        {!isLoading && !isError && viewMode === 'week' ? (
          <ScheduleWeekView weekMondayYmd={weekMonday} events={allEvents} />
        ) : null}

        {!isLoading && !isError && usingMock ? (
          <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing.lg, textAlign: 'center' }}>
            Showing sample schedule — connect SIS for live classes.
          </Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
