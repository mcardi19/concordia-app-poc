import type { ViewStyle } from 'react-native';

/**
 * iOS continuous corner curve (squircle).
 * Pair with any `borderRadius` — no visual effect on Android yet.
 */
export const SQUIRCLE_CURVE = 'continuous' as const;

/** Squircle radius style fragment. */
export function radiusStyle(borderRadius: number): ViewStyle {
  return {
    borderRadius,
    borderCurve: SQUIRCLE_CURVE,
  };
}
