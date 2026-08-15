import React, { useMemo, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { useTheme } from '@/design-system/theme';
import { canUseLiquidGlass } from './liquidGlass';

/**
 * The capsule used by Today's pinned chips and the Campus map's amenity rail.
 *
 * Liquid glass with the flat fallback. The shadow belongs on the pressable
 * outside it — glass sets `overflow: hidden` and would clip it — and press
 * feedback should be a scale rather than an opacity dip, which flattens the
 * effect.
 *
 * Surface only: callers compose their own contents, but should lay them out
 * with `glassPillStyles.content` so the two rails stay the same pill.
 */
export function GlassPillSurface({
  radius,
  tintColor,
  children,
  style,
}: {
  radius: number;
  /** Fill for a selected pill. Tints the glass, or replaces the flat fill. */
  tintColor?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const glass = useMemo(() => canUseLiquidGlass(), []);

  if (!glass) {
    return (
      <View
        style={[
          glassPillStyles.surface,
          { borderRadius: radius, backgroundColor: tintColor ?? theme.color.background },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <GlassView
      isInteractive
      glassEffectStyle="regular"
      colorScheme="light"
      tintColor={tintColor}
      style={[glassPillStyles.surface, { borderRadius: radius }, style]}
    >
      {children}
    </GlassView>
  );
}

/** Icon size that balances the 17pt label. */
export const GLASS_PILL_ICON_SIZE = 18;

/** Pressed scale — paired with a soft shadow on the pressable. */
export const GLASS_PILL_PRESSED_SCALE = 0.975;

export const glassPillStyles = StyleSheet.create({
  surface: {
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    // Asymmetric: the icon's own bearing makes an even inset look right-heavy.
    paddingLeft: 12.5,
    paddingRight: 16,
    paddingVertical: 10,
  },
  label: {
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 17 * 1.2,
  },
  /**
   * One step down, for rails that have more pills to get through than Today's
   * pinned row — the capsule and its insets are unchanged, so the two still
   * read as the same control.
   */
  labelCompact: {
    fontWeight: '500',
    fontSize: 15.5,
    lineHeight: 15.5 * 1.2,
  },
});
