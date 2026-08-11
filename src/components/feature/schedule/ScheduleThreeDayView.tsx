import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import {
  DAY_HOUR_END,
  DAY_HOUR_START,
  PLANNER_HOUR_HEIGHT,
  RAIL_WIDTH,
  scheduleTheme,
} from './scheduleTheme';
import type { ScheduleEvent } from './scheduleTypes';

export type PlannerDay = {
  dayKey: string;
  /** Single-letter column head. */
  letter: string;
  dateLabel: string;
  isToday: boolean;
};

type Props = {
  days: PlannerDay[];
  events: ScheduleEvent[];
  onSelectEvent?: (event: ScheduleEvent) => void;
};

const HOURS = Array.from(
  { length: DAY_HOUR_END - DAY_HOUR_START + 1 },
  (_, i) => i + DAY_HOUR_START,
);

const topFor = (minutes: number) =>
  (minutes / 60 - DAY_HOUR_START) * PLANNER_HOUR_HEIGHT;

function hourLabel(hour: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${hour >= 12 ? 'PM' : 'AM'}`;
}

/**
 * 02b · 3-Day — the planning view. Deliberately has no "now" rule: this is for
 * looking ahead, and a live marker pulls attention back to the present.
 * Blocks carry only a code and (when tall enough) a room.
 */
export function ScheduleThreeDayView({ days, events, onSelectEvent }: Props) {
  const theme = useTheme();
  const gridHeight = HOURS.length * PLANNER_HOUR_HEIGHT;

  const totals = React.useMemo(() => {
    const classes = events.filter((e) => e.kind !== 'study');
    const minutes = events.reduce(
      (sum, e) => sum + (e.endMinutes - e.startMinutes),
      0,
    );
    const busyDays = new Set(events.map((e) => e.dayKey)).size;
    return {
      classes: String(classes.length),
      hours: (minutes / 60).toFixed(1).replace(/\.0$/, ''),
      free: `${Math.max(0, days.length - busyDays)} days`,
    };
  }, [events, days.length]);

  return (
    <View>
      <View style={styles.gridWrap}>
        {/* Column heads */}
        <View style={styles.headRow}>
          <View style={styles.headSpacer} />
          {days.map((day) => (
            <View key={day.dayKey} style={styles.headCell}>
              <Text
                variant="caption"
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  letterSpacing: 0.2,
                  color: day.isToday ? theme.color.primary : scheduleTheme.timeSubText,
                }}
              >
                {day.letter}
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  fontSize: 14,
                  fontWeight: day.isToday ? '700' : '500',
                  color: day.isToday ? theme.color.primary : scheduleTheme.headingText,
                  marginTop: 2,
                }}
              >
                {day.dateLabel}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.body}>
          {/* Hour rail */}
          <View style={[styles.rail, { height: gridHeight }]}>
            {HOURS.map((hour, index) => (
              <Text
                key={hour}
                variant="caption"
                style={[
                  styles.hourLabel,
                  { top: index * PLANNER_HOUR_HEIGHT - 5, color: scheduleTheme.railLabel },
                ]}
              >
                {hourLabel(hour)}
              </Text>
            ))}
          </View>

          {/* Day columns */}
          <View style={[styles.columns, { height: gridHeight }]}>
            {HOURS.map((hour, index) => (
              <View
                key={`line-${hour}`}
                pointerEvents="none"
                style={[styles.hourLine, { top: index * PLANNER_HOUR_HEIGHT }]}
              />
            ))}

            {days.map((day) => {
              const dayEvents = events.filter((e) => e.dayKey === day.dayKey);
              return (
                <View
                  key={day.dayKey}
                  style={[
                    styles.column,
                    day.isToday
                      ? { backgroundColor: `${theme.color.primary}0A` }
                      : null,
                  ]}
                >
                  {dayEvents.map((event) => {
                    const top = topFor(event.startMinutes);
                    const height = topFor(event.endMinutes) - top;
                    return (
                      <Pressable
                        key={event.id}
                        onPress={() => onSelectEvent?.(event)}
                        accessibilityRole="button"
                        accessibilityLabel={`${event.courseCode}, ${event.room ?? ''}`}
                        style={[
                          styles.block,
                          {
                            top: top + 1,
                            height: Math.max(0, height - 2),
                            borderColor: `${theme.color.primary}26`,
                            borderLeftColor: theme.color.primary,
                          },
                        ]}
                      >
                        <Text
                          variant="caption"
                          numberOfLines={1}
                          style={{
                            fontSize: 8.5,
                            fontWeight: '700',
                            letterSpacing: 0.2,
                            lineHeight: 10,
                            color: theme.color.primary,
                          }}
                        >
                          {event.courseCode}
                        </Text>
                        {/* Room only fits once the block clears ~22pt. */}
                        {height > 22 ? (
                          <Text
                            variant="caption"
                            numberOfLines={1}
                            style={{
                              fontSize: 7.5,
                              lineHeight: 9,
                              color: scheduleTheme.timeSubText,
                              marginTop: 1,
                            }}
                          >
                            {event.room}
                          </Text>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Footer summary */}
      <View style={styles.summaryWrap}>
        <View style={styles.summary}>
          {[
            { label: 'Classes', value: totals.classes },
            { label: 'Hours', value: totals.hours },
            { label: 'Conflicts', value: '0' },
            { label: 'Free time', value: totals.free },
          ].map((stat) => (
            <View key={stat.label} style={styles.summaryCell}>
              <Text
                variant="caption"
                style={{
                  fontSize: 9,
                  fontWeight: '600',
                  letterSpacing: 0.3,
                  color: scheduleTheme.timeSubText,
                  textTransform: 'uppercase',
                }}
              >
                {stat.label}
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  letterSpacing: -0.7,
                  color: scheduleTheme.headingText,
                  marginTop: 3,
                }}
              >
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridWrap: {
    paddingTop: 14,
    paddingHorizontal: semanticSpacing.screenHorizontal,
  },
  headRow: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  headSpacer: {
    width: RAIL_WIDTH,
  },
  headCell: {
    flex: 1,
    alignItems: 'center',
  },
  body: {
    flexDirection: 'row',
  },
  rail: {
    width: RAIL_WIDTH,
    position: 'relative',
  },
  hourLabel: {
    position: 'absolute',
    right: 6,
    width: 42,
    textAlign: 'right',
    fontSize: 11,
  },
  columns: {
    flex: 1,
    position: 'relative',
    flexDirection: 'row',
    gap: 2,
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: scheduleTheme.railLine,
  },
  column: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
    borderRadius: 6,
    borderCurve: 'continuous',
  },
  block: {
    position: 'absolute',
    left: 1,
    right: 1,
    paddingHorizontal: 4,
    paddingVertical: 3,
    backgroundColor: scheduleTheme.allDayFill,
    borderRadius: 4,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 2,
    overflow: 'hidden',
  },
  summaryWrap: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 20,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
    backgroundColor: scheduleTheme.cardBackground,
    borderRadius: 8,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: scheduleTheme.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summaryCell: {
    alignItems: 'center',
  },
});
