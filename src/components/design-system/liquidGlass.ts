import {
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';

/**
 * Whether native liquid glass can be used (iOS 26+). Callers must render a
 * fallback surface when this is false — Android and older iOS get nothing.
 *
 * Guarded because the availability checks throw on runtimes where the native
 * module is missing entirely.
 */
export function canUseLiquidGlass(): boolean {
  try {
    return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}
