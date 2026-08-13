import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import {
  DAY_HOUR_END,
  DAY_HOUR_HEIGHT,
  DAY_HOUR_START,
  RAIL_WIDTH,
  scheduleTheme,
} from './scheduleTheme';
import { ScheduleSurfaceFill } from './ScheduleSurface';
import type { ScheduleEvent } from './scheduleTypes';
import { formatClock } from './scheduleUtils';
import { semanticSpacing } from '@/design-system/tokens';

type Props = {
  events: ScheduleEvent[];
  /** Minutes from midnight for the "now" rule. Omit to hide it. */
  nowMinutes?: number;
  onSelectEvent?: (event: ScheduleEvent) => void;
};

const HOURS = Array.from(
  { length: DAY_HOUR_END - DAY_HOUR_START + 1 },
  (_, i) => i + DAY_HOUR_START,
);

const topFor = (minutes: number) =>
  (minutes / 60 - DAY_HOUR_START) * DAY_HOUR_HEIGHT;

function hourLabel(hour: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${hour >= 12 ? 'PM' : 'AM'}`;
}

/**
 * 02 · Day — the live single-day timeline. Blocks are absolutely positioned
 * against a fixed hour grid, so an event's height encodes its real duration
 * and overlapping blocks stay visually truthful.
 */
export function ScheduleDayTimeline({ events, nowMinutes, onSelectEvent }: Props) {
  const theme = useTheme();
  const gridHeight = HOURS.length * DAY_HOUR_HEIGHT;
  const nowTop = nowMinutes != null ? topFor(nowMinutes) : null;

  return (
    <View style={styles.root}>
      <View style={[styles.rail, { height: gridHeight }]}>
        {HOURS.map((hour, index) => (
          <Text
            key={hour}
            variant="caption"
            style={[
              styles.hourLabel,
              { top: index * DAY_HOUR_HEIGHT, color: scheduleTheme.railLabel },
            ]}
          >
            {hourLabel(hour)}
          </Text>
        ))}

        {HOURS.map((hour, index) => (
          <View
            key={`line-${hour}`}
            style={[styles.hourLine, { top: index * DAY_HOUR_HEIGHT + 4 }]}
          />
        ))}

        <View style={[styles.grid, { height: gridHeight }]}>
          {events.map((event) => {
            const top = topFor(event.startMinutes);
            const height = topFor(event.endMinutes) - top;
            const isNow =
              nowMinutes != null &&
              nowMinutes >= event.startMinutes &&
              nowMinutes < event.endMinutes;
            return (
              <Pressable
                key={event.id}
                onPress={() => onSelectEvent?.(event)}
                accessibilityRole="button"
                accessibilityLabel={`${event.courseCode}, ${event.title}, ${formatClock(event.startMinutes, true)}`}
                style={[
                  styles.block,
                  {
                    top,
                    height,
                    opacity: event.done ? 0.55 : 1,
                    borderColor: `${theme.color.primary}26`,
                    justifyContent: height > 60 ? 'flex-start' : 'center',
                    zIndex: isNow ? 2 : 1,
                  },
                  isNow
                    ? {
                        shadowColor: theme.color.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.13,
                        shadowRadius: 14,
                        elevation: 3,
                      }
                    : styles.blockShadow,
                ]}
              >
                <ScheduleSurfaceFill />

                <View
                  style={[
                    styles.blockRail,
                    { backgroundColor: theme.color.primary },
                  ]}
                />

                <View style={styles.blockHeader}>
                  <Text
                    variant="caption"
                    numberOfLines={1}
                    style={{
                      fontSize: 10,
                      fontWeight: '600',
                      letterSpacing: 0.2,
                      color: theme.color.primary,
                      opacity: isNow ? 1 : 0.85,
                      flex: 1,
                    }}
                  >
                    {isNow ? 'NOW · ' : ''}
                    {event.courseCode}
                    {event.done ? ' · done' : ''}
                  </Text>
                  <Text
                    variant="caption"
                    style={{ fontSize: 10, opacity: 0.7, color: scheduleTheme.headingText }}
                  >
                    {formatClock(event.startMinutes)}–{formatClock(event.endMinutes)}
                  </Text>
                </View>

                {/* Progressive disclosure — a 45-minute block has no room for this. */}
                {height > 48 ? (
                  <Text
                    variant="bodySmall"
                    numberOfLines={2}
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: scheduleTheme.headingText,
                      marginTop: 4,
                    }}
                  >
                    {event.title}
                  </Text>
                ) : null}

                {height > 70 ? (
                  <Text
                    variant="caption"
                    numberOfLines={1}
                    style={{
                      fontSize: 11,
                      color: scheduleTheme.headingText,
                      opacity: isNow ? 0.85 : 0.65,
                      marginTop: 3,
                    }}
                  >
                    {event.room}
                    {event.professor ? ` · ${event.professor}` : ''}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}

          {nowTop != null ? (
            <View
              pointerEvents="none"
              style={[styles.nowRule, { top: nowTop, backgroundColor: theme.color.primary }]}
            >
              <View style={[styles.nowDot, { backgroundColor: theme.color.primary }]} />
              <View
                style={[
                  styles.nowPill,
                  {
                    backgroundColor: theme.color.primary,
                    shadowColor: theme.color.primary,
                  },
                ]}
              >
                <Text
                  variant="caption"
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: theme.color.text.inverse,
                  }}
                >
                  {formatClock(nowMinutes ?? 0)}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 18,
    // Last hour label sits on the bottom edge of the rail.
    paddingBottom: 24,
  },
  rail: {
    position: 'relative',
    paddingLeft: RAIL_WIDTH,
  },
  hourLabel: {
    position: 'absolute',
    left: 0,
    width: 42,
    textAlign: 'right',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  hourLine: {
    position: 'absolute',
    left: RAIL_WIDTH,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: scheduleTheme.railLine,
  },
  grid: {
    position: 'relative',
    marginLeft: 8,
  },
  block: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 12,
    borderRadius: 8,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  blockShadow: {
    shadowColor: '#3C2814',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  blockRail: {
    position: 'absolute',
    left: 7,
    top: 8,
    bottom: 8,
    width: 2,
    borderRadius: 2,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  nowRule: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    zIndex: 3,
  },
  nowDot: {
    position: 'absolute',
    left: -8,
    top: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nowPill: {
    position: 'absolute',
    right: '100%',
    top: -9,
    marginRight: 12,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.33,
    shadowRadius: 6,
    elevation: 2,
  },
});
