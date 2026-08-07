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
 * Brand (Gill Sans Nova) registration is deferred — all UI type uses the
 * platform font (SF Pro on iOS, Roboto on Android) for now.
 */
export function useConcordiaFonts(): FontLoadResult {
  return {
    loaded: true,
    error: null,
    missingKeys: [],
    brandFontsReady: false,
  };
}

export { FONT_FILES, REQUIRED_FONT_KEYS, fonts, brandFaceForWeight } from './fontMap';
export type { RegisteredFontKey } from './fontMap';
