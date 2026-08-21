import React from 'react';
import { StyleSheet, View } from 'react-native';
import { scheduleTheme } from './scheduleTheme';

type Props = {
  /** Match the parent's corner radius so the fill does not square off. */
  radius?: number;
};

/**
 * Fill for a schedule event block.
 *
 * Opaque. It used to be liquid glass tinted with the course colour, which
 * looked right over the campus map but not here: the timeline draws hour
 * rules the full width of the grid, and a translucent block let every rule
 * it covered show straight through, so a two-hour class read as though it
 * had lines ruled across it.
 *
 * Rendered as an absolute fill behind the block's existing children rather
 * than wrapping them: the day-timeline blocks are absolutely positioned by
 * `top`/`height`, so reparenting them into a background view would break
 * their placement.
 */
export function ScheduleSurfaceFill({ radius = 8 }: Props) {
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: scheduleTheme.eventFill,
          borderRadius: radius,
          borderCurve: 'continuous',
        },
      ]}
    />
  );
}
