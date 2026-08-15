import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '@/components/design-system';
import {
  DAY_HOUR_END,
  DAY_HOUR_START,
  RAIL_WIDTH,
  scheduleTheme,
} from './scheduleTheme';

const HOURS = Array.from(
  { length: DAY_HOUR_END - DAY_HOUR_START + 1 },
  (_, i) => i + DAY_HOUR_START,
);

function hourLabel(hour: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${hour >= 12 ? 'PM' : 'AM'}`;
}

type Props = {
  hourHeight: number;
  /** Nudge labels to sit on the hour line (3-day uses a slight lift). */
  labelOffset?: number;
  labelSize?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Hour labels for the day / 3-day grids. Rendered beside the pager so a
 * horizontal swipe moves events without taking the time rail with it.
 */
export function ScheduleHourRail({
  hourHeight,
  labelOffset = 0,
  labelSize = 12,
  style,
}: Props) {
  const gridHeight = HOURS.length * hourHeight;

  return (
    <View style={[styles.rail, { height: gridHeight, backgroundColor: scheduleTheme.pageBackground }, style]} pointerEvents="none">
      {HOURS.map((hour, index) => (
        <Text
          key={hour}
          variant="caption"
          style={[
            styles.label,
            {
              top: index * hourHeight + labelOffset,
              fontSize: labelSize,
              color: scheduleTheme.railLabel,
            },
          ]}
        >
          {hourLabel(hour)}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: RAIL_WIDTH,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    right: 4,
    width: 42,
    textAlign: 'right',
    letterSpacing: 0.2,
  },
});
