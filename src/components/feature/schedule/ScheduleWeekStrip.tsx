import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { MaterialSymbol, msChevronLeft, msChevronRight } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { scheduleTheme } from './scheduleTheme';
import { getDayLetter, isSameDay } from './scheduleUtils';
import type { ScheduleEvent } from './scheduleTypes';
import { semanticSpacing } from '@/design-system/tokens';

type Props = {
  weekDates: Date[];
  selectedDate: Date;
  events: ScheduleEvent[];
  onSelectDate: (date: Date) => void;
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
};

const CIRCLE = 36;
/** A day at or above this many events gets the solid density dot. */
const BUSY_THRESHOLD = 3;

/**
 * Week date picker. The selected day is a circle around the number only —
 * the weekday letter stays outside it, which is what keeps the row reading as a
 * calendar strip rather than a segmented control.
 */
export function ScheduleWeekStrip({
  weekDates,
  selectedDate,
  events,
  onSelectDate,
  onPreviousWeek,
  onNextWeek,
}: Props) {
  const theme = useTheme();

  return (
    <View style={styles.root}>
      <Pressable
        onPress={onPreviousWeek}
        accessibilityRole="button"
        accessibilityLabel="Previous week"
        hitSlop={8}
        style={styles.arrow}
      >
        <MaterialSymbol icon={msChevronLeft} size={16} color={scheduleTheme.railLabel} />
      </Pressable>

      <View style={styles.days}>
        {weekDates.map((date) => {
          const selected = isSameDay(date, selectedDate);
          const dayKey = dayKeyOf(date);
          const count = events.filter((e) => e.dayKey === dayKey).length;
          const busy = count >= BUSY_THRESHOLD;

          return (
            <Pressable
              key={date.toISOString()}
              onPress={() => onSelectDate(date)}
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

              <View
                style={[
                  styles.circle,
                  selected ? { backgroundColor: theme.color.primary } : null,
                ]}
              >
                <Text
                  variant="bodySmall"
                  style={{
                    fontSize: 17,
                    fontWeight: selected ? '700' : '500',
                    color: selected
                      ? theme.color.text.inverse
                      : scheduleTheme.headingText,
                  }}
                >
                  {date.getDate()}
                </Text>
              </View>

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
        })}
      </View>

      <Pressable
        onPress={onNextWeek}
        accessibilityRole="button"
        accessibilityLabel="Next week"
        hitSlop={8}
        style={styles.arrow}
      >
        <MaterialSymbol icon={msChevronRight} size={16} color={scheduleTheme.railLabel} />
      </Pressable>
    </View>
  );
}

/** Lowercase three-letter key matching ScheduleEvent.dayKey. */
function dayKeyOf(date: Date): string {
  return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: scheduleTheme.mastheadBorder,
  },
  arrow: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  days: {
    flex: 1,
    flexDirection: 'row',
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
