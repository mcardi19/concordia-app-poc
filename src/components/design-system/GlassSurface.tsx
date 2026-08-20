import React, { useMemo } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';
import { canUseLiquidGlass } from './liquidGlass';

/**
 * A card's glass tint. Heavier than a sheet's: a card is a small panel of
 * fine print, and at a sheet's tint whatever sits behind runs through the
 * text.
 */
export const CARD_GLASS_TINT = 'rgba(255,255,255,0.82)';
/** Sheets are large enough that what shows through reads as texture. */
export const SHEET_GLASS_TINT = 'rgba(255,255,255,0.55)';

export const CARD_BLUR_INTENSITY = 96;
export const SHEET_BLUR_INTENSITY = 72;

type Props = {
  /** Corner geometry, matched to the parent so the fill does not square off. */
  corner: ViewStyle;
  tint: string;
  /** `expo-blur` strength for the pre-iOS-26 path. */
  intensity: number;
  /** Flat colour for platforms with neither glass nor blur. */
  fallback: string;
};

/**
 * Absolute-fill glass with the three-tier fallback every glass surface in the
 * app needs: liquid glass on iOS 26, a chrome blur on older iOS, a
 * near-opaque fill anywhere else.
 *
 * It only paints — layout stays on the sibling content. Cards position
 * themselves in all sorts of ways (absolutely against a timeline, inside a
 * scroll block), and reparenting their children into a glass view to get a
 * background would break placement.
 */
export function GlassSurface({ corner, tint, intensity, fallback }: Props) {
  const useGlass = useMemo(() => canUseLiquidGlass(), []);

  if (useGlass) {
    return (
      <GlassView
        pointerEvents="none"
        isInteractive={false}
        glassEffectStyle="regular"
        colorScheme="light"
        tintColor={tint}
        style={[StyleSheet.absoluteFillObject, corner]}
      />
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        pointerEvents="none"
        intensity={intensity}
        tint="systemChromeMaterialLight"
        style={[StyleSheet.absoluteFillObject, corner]}
      />
    );
  }

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, { backgroundColor: fallback }, corner]}
    />
  );
}

/** For cards floating clear of every edge, so all four corners are rounded. */
export function CardGlass({ radius }: { radius: number }) {
  return (
    <GlassSurface
      corner={{ borderRadius: radius, borderCurve: 'continuous' }}
      tint={CARD_GLASS_TINT}
      intensity={CARD_BLUR_INTENSITY}
      fallback="rgba(255,255,255,0.97)"
    />
  );
}

/** For sheets rising off the bottom edge — only the top corners are visible. */
export function SheetGlass({ radius }: { radius: number }) {
  return (
    <GlassSurface
      corner={{
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
        borderCurve: 'continuous',
      }}
      tint={SHEET_GLASS_TINT}
      intensity={SHEET_BLUR_INTENSITY}
      fallback="rgba(255,255,255,0.94)"
    />
  );
}
