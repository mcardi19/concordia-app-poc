import { useFonts } from 'expo-font';
import { FONT_FILES, REQUIRED_FONT_KEYS, type RegisteredFontKey } from './fontMap';

export type FontLoadResult = {
  loaded: boolean;
  error: Error | null;
  missingKeys: RegisteredFontKey[];
  /** True once all Gill Sans Nova faces have registered with Expo. */
  brandFontsReady: boolean;
};

/**
 * Whether brand faces are registered. Safe to call after the root
 * `useConcordiaFonts()` hook has reported `loaded`.
 */
export function areBrandFontsReady(loaded: boolean, error: Error | null): boolean {
  return loaded && error == null && REQUIRED_FONT_KEYS.length > 0;
}

/**
 * Font bootstrap hook.
 *
 * Loads all Gill Sans Nova faces with Expo so brand type can be opted into per
 * component. Only the session card uses the brand font for now; every other UI
 * surface stays on the platform font (SF Pro on iOS, Roboto on Android).
 * Keep the splash visible until `loaded` is true or a hard error surfaces.
 */
export function useConcordiaFonts(): FontLoadResult {
  const [loaded, error] = useFonts(FONT_FILES);

  const missingKeys: RegisteredFontKey[] = [];
  if (error) {
    // useFonts fails as a batch; treat all required keys as missing for diagnostics.
    missingKeys.push(...REQUIRED_FONT_KEYS);
  }

  return {
    loaded,
    error: error ?? null,
    missingKeys,
    brandFontsReady: areBrandFontsReady(loaded, error ?? null),
  };
}

export { FONT_FILES, REQUIRED_FONT_KEYS, fonts, brandFaceForWeight } from './fontMap';
export type { RegisteredFontKey } from './fontMap';
