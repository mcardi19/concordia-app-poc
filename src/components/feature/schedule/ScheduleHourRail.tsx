import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '@/components/design-system';
import { splitHourLabel } from './scheduleUtils';
import {
  DAY_HOUR_END,
  DAY_HOUR_START,
  RAIL_LABEL_WEIGHT,
  RAIL_WIDTH,
  scheduleTheme,
} from './scheduleTheme';

const HOURS = Array.from(
  { length: DAY_HOUR_END - DAY_HOUR_START + 1 },
  (_, i) => i + DAY_HOUR_START,
);

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
          {splitHourLabel(hour).value}
          <Text style={styles.meridiem}> {splitHourLabel(hour).meridiem}</Text>
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
    fontWeight: RAIL_LABEL_WEIGHT,
  },
  /** Set back from the number: lighter ink, and not carrying its weight. */
  meridiem: {
    fontWeight: '400',
    color: scheduleTheme.railMeridiem,
  },
});
