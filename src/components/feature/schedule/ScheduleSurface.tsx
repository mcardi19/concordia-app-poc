import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import { scheduleTheme } from './scheduleTheme';

type Props = {
  /** Match the parent's corner radius so the fill does not square off. */
  radius?: number;
};

/**
 * Liquid-glass fill for a schedule event block, or the flat tint off iOS 26.
 *
 * Rendered as an absolute fill behind the block's existing children rather
 * than wrapping them: the day-timeline blocks are absolutely positioned by
 * `top`/`height`, so reparenting them into a glass view would break their
 * placement on the rail.
 *
 * The glass is tinted with the course fill rather than left clear — that pink
 * is what marks a block as a class, and plain glass over the white timeline
 * would erase the distinction.
 */
export function ScheduleSurfaceFill({ radius = 8 }: Props) {
  const glass = useMemo(() => canUseLiquidGlass(), []);

  if (!glass) {
    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: scheduleTheme.allDayFill,
            borderRadius: radius,
            borderCurve: 'continuous',
          },
        ]}
      />
    );
  }

  return (
    <GlassView
      pointerEvents="none"
      isInteractive={false}
      glassEffectStyle="regular"
      colorScheme="light"
      tintColor={SCHEDULE_GLASS_TINT}
      style={[
        StyleSheet.absoluteFillObject,
        { borderRadius: radius, borderCurve: 'continuous' },
      ]}
    />
  );
}

/**
 * The flat fill is opaque `#F6EEF0`; at partial alpha the same hue reads as a
 * course block while still letting the glass refract what is behind it.
 */
const SCHEDULE_GLASS_TINT = 'rgba(246, 238, 240, 0.55)';
