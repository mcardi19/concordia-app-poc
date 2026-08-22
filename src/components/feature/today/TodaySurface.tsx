import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import { useTodaySurfaces } from './todaySurfaces';

type Props = {
  /** Match the parent's corner radius so the fill does not square off. */
  radius: number;
};

/**
 * Liquid-glass fill for the Today cards, or the flat hairline card off iOS 26.
 *
 * Rendered as an absolute fill *behind* a card's existing children rather than
 * wrapping them: these cards already own their radius, `overflow: hidden` and
 * layout, and reparenting the content into a glass view would have moved the
 * image clipping around. Siblings declared after it paint on top, so nothing
 * else about the card changes.
 */
export function TodaySurfaceFill({ radius }: Props) {
  const glass = useMemo(() => canUseLiquidGlass(), []);
  const { todayHairlineCard } = useTodaySurfaces();

  if (!glass) {
    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          todayHairlineCard,
          { borderRadius: radius, borderCurve: 'continuous' },
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
      style={[
        StyleSheet.absoluteFillObject,
        { borderRadius: radius, borderCurve: 'continuous' },
      ]}
    />
  );
}
