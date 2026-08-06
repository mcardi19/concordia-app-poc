import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { Screen } from '@/components/design-system';
import {
  ScheduleDayTimeline,
  ScheduleHeader,
  ScheduleWeekStrip,
  ScheduleWeekView,
  filterEventsForDay,
  getWeekDates,
  type ScheduleViewMode,
} from '@/components/feature/schedule';
import { EmptyState } from '@/components/feature';
import { MOCK_SCHEDULE_EVENTS } from '@/components/feature/schedule/scheduleMockData';
import { getDayKey, isSameDay } from '@/components/feature/schedule/scheduleUtils';
import type { ScheduleEvent } from '@/components/feature/schedule/scheduleTypes';
import { useFloatingTabBarScrollInset } from '@/navigation/FloatingTabBar';
import { formatWeekMonday } from '@/api/schedule';

function getMockEventsForDate(date: Date): ScheduleEvent[] {
  const dayKey = getDayKey(date);
  return MOCK_SCHEDULE_EVENTS.map((event, index) => ({
    ...event,
    id: `mock-${dayKey}-${index}`,
    dayKey,
  }));
}

export function ScheduleScreen() {
  const tabBarInset = useFloatingTabBarScrollInset();
  const [weekMonday] = useState(() => formatWeekMonday(new Date()));
  const weekDates = useMemo(() => getWeekDates(weekMonday), [weekMonday]);
  const [selectedDate, setSelectedDate] = useState(() => weekDates[4]);
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('day');

  useEffect(() => {
    const inWeek = weekDates.some((d) => isSameDay(d, selectedDate));
    if (!inWeek) {
      setSelectedDate(weekDates[4]);
    }
  }, [weekDates, selectedDate]);

  const allEvents = useMemo(() => getMockEventsForDate(selectedDate), [selectedDate]);

  const dayEvents = useMemo(
    () => filterEventsForDay(allEvents, selectedDate),
    [allEvents, selectedDate]
  );

  return (
    <Screen edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarInset }}
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

        {viewMode === 'day' ? (
          dayEvents.length === 0 ? (
            <EmptyState message="No classes scheduled for this day." />
          ) : (
            <ScheduleDayTimeline events={dayEvents} selectedDate={selectedDate} />
          )
        ) : (
          <ScheduleWeekView weekMondayYmd={weekMonday} events={allEvents} />
        )}
      </ScrollView>
    </Screen>
  );
}
