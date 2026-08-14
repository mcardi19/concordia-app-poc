import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import { MaterialSymbol, msSearch } from '@/components/icons';
import { HEADER_BAR_BUTTON_SIZE, HEADER_ICON_SIZE } from './HeaderIconButton';

/**
 * Search action for the burgundy hero surfaces (Academic, Me), which draw
 * their own chrome instead of a native header.
 *
 * Dark scheme with a dark tint, matching `MeHeaderChrome`: forced light UI
 * resolves `auto` glass to near-white on the burgundy and would swallow the
 * white glyph, and the tint keeps the capsule readable once the page scrolls
 * and the glass starts sampling the light body underneath.
 */
const GLASS_SCHEME = 'dark' as const;
const GLASS_TINT = 'rgba(63, 15, 26, 0.72)';
/** Only used where liquid glass is unavailable — same value as `meTheme.heroChrome`. */
const FALLBACK_FILL = 'rgba(255, 255, 255, 0.14)';

type Props = {
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function HeroSearchButton({ onPress, accessibilityLabel = 'Search' }: Props) {
  const glass = useMemo(() => canUseLiquidGlass(), []);

  const hit = (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.hit, { opacity: pressed ? 0.55 : 1 }]}
    >
      <MaterialSymbol icon={msSearch} size={HEADER_ICON_SIZE} color="#FFFFFF" />
    </Pressable>
  );

  if (!glass) {
    return <View style={[styles.round, styles.fallback]}>{hit}</View>;
  }

  return (
    <GlassView
      isInteractive
      glassEffectStyle="regular"
      colorScheme={GLASS_SCHEME}
      tintColor={GLASS_TINT}
      style={styles.round}
    >
      {hit}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  round: {
    width: HEADER_BAR_BUTTON_SIZE,
    height: HEADER_BAR_BUTTON_SIZE,
    borderRadius: HEADER_BAR_BUTTON_SIZE / 2,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: FALLBACK_FILL,
  },
  hit: {
    width: HEADER_BAR_BUTTON_SIZE,
    height: HEADER_BAR_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
