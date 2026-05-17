import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import { ScheduleEventBlock } from './ScheduleEventBlock';
import type { ScheduleEvent } from './scheduleTypes';
import {
  filterEventsForDay,
  formatDayHeading,
  getDayKey,
  getEventStatus,
  getWeekDates,
} from './scheduleUtils';

type Props = {
  weekMondayYmd: string;
  events: ScheduleEvent[];
  now?: Date;
};

const DAY_NAMES: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export function ScheduleWeekView({ weekMondayYmd, events, now = new Date() }: Props) {
  const theme = useTheme();
  const weekDates = getWeekDates(weekMondayYmd);

  return (
    <View>
      {weekDates.map((date) => {
        const dayEvents = filterEventsForDay(events, date);
        if (dayEvents.length === 0) return null;

        const heading = formatDayHeading(date);
        return (
          <View key={date.toISOString()} style={{ marginBottom: theme.spacing.lg }}>
            <Text variant="bodySmall" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
              {DAY_NAMES[getDayKey(date)] ?? heading.main}
            </Text>
            {dayEvents.map((event) => {
              const status = getEventStatus(event, now, date);
              return (
                <View key={event.id} style={{ marginBottom: theme.spacing.sm }}>
                  <ScheduleEventBlock
                    event={event}
                    status={status}
                    height={72}
                  />
                </View>
              );
            })}
          </View>
        );
      })}
      {weekDates.every((d) => filterEventsForDay(events, d).length === 0) ? (
        <Text variant="body" color="secondary">
          No classes this week.
        </Text>
      ) : null}
    </View>
  );
}
