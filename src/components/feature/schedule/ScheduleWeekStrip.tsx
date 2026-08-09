import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import { dayHasEvents, getDayLetter, isSameDay } from './scheduleUtils';
import type { ScheduleEvent } from './scheduleTypes';

type Props = {
  weekDates: Date[];
  selectedDate: Date;
  events: ScheduleEvent[];
  onSelectDate: (date: Date) => void;
};

export function ScheduleWeekStrip({ weekDates, selectedDate, events, onSelectDate }: Props) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
      }}
    >
      {weekDates.map((date) => {
        const selected = isSameDay(date, selectedDate);
        const hasEvents = dayHasEvents(events, date);

        return (
          <Pressable
            key={date.toISOString()}
            onPress={() => onSelectDate(date)}
            style={({ pressed }) => ({
              alignItems: 'center',
              minWidth: 40,
              paddingVertical: theme.spacing.xs,
              paddingHorizontal: 6,
              borderRadius: theme.radius.lg,
              borderCurve: 'continuous',
              backgroundColor: selected ? theme.color.primary : 'transparent',
              opacity: pressed ? 0.85 : 1,
            })}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text
              variant="caption"
              style={{
                fontWeight: '600',
                color: selected ? theme.color.text.inverse : theme.color.text.subtle,
                marginBottom: 4,
              }}
            >
              {getDayLetter(date)}
            </Text>
            <Text
              variant="bodySmall"
              style={{
                fontWeight: selected ? '700' : '500',
                color: selected ? theme.color.text.inverse : theme.color.text.primary,
              }}
            >
              {date.getDate()}
            </Text>
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                borderCurve: 'continuous',
                marginTop: 6,
                backgroundColor: hasEvents
                  ? selected
                    ? theme.color.text.inverse
                    : theme.color.text.subtle
                  : 'transparent',
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
