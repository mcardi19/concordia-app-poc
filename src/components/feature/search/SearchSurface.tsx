import React, { useMemo, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import { searchTheme } from '@/screens/search/searchTheme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
};

/**
 * Grouped-card surface for the search screens: liquid glass on iOS 26, the
 * flat hairline card everywhere else.
 *
 * Wraps its children rather than sitting behind them as an absolute fill —
 * unlike the timeline blocks these cards are ordinary flow layout, so the
 * glass can own the radius and clip the row dividers to it.
 */
export function SearchSurface({ children, style, radius = 12 }: Props) {
  const glass = useMemo(() => canUseLiquidGlass(), []);

  if (!glass) {
    return (
      <View style={[styles.surface, styles.fallback, { borderRadius: radius }, style]}>
        {children}
      </View>
    );
  }

  return (
    <GlassView
      isInteractive={false}
      glassEffectStyle="regular"
      colorScheme="light"
      style={[styles.surface, { borderRadius: radius }, style]}
    >
      {children}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  /** Only applied when liquid glass is unavailable. */
  fallback: {
    backgroundColor: searchTheme.cardBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: searchTheme.cardBorder,
  },
});
