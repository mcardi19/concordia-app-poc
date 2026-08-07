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
 * Font bootstrap hook — registers every Gill Sans Nova face in `FONT_FILES`.
 */
export function useConcordiaFonts(): FontLoadResult {
  const [loaded, error] = useFonts(FONT_FILES);
  const brandFontsReady = areBrandFontsReady(loaded, error ?? null);

  return {
    loaded,
    error: error ?? null,
    missingKeys: brandFontsReady ? [] : REQUIRED_FONT_KEYS,
    brandFontsReady,
  };
}

export { FONT_FILES, REQUIRED_FONT_KEYS, fonts, brandFaceForWeight } from './fontMap';
export type { RegisteredFontKey } from './fontMap';
