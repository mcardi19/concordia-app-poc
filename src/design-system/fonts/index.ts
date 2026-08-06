import { useFonts } from 'expo-font';
import { FONT_FILES, REQUIRED_FONT_KEYS, type RegisteredFontKey } from './fontMap';

export type FontLoadResult = {
  loaded: boolean;
  error: Error | null;
  missingKeys: RegisteredFontKey[];
};

/**
 * Loads all registered Concordia font files.
 * Keep splash visible until `loaded` is true (or a hard error is surfaced).
 */
export function useConcordiaFonts(): FontLoadResult {
  const [loaded, error] = useFonts(FONT_FILES);

  const missingKeys: RegisteredFontKey[] = [];
  if (error) {
    // useFonts failed as a batch; treat all required keys as missing for diagnostics
    missingKeys.push(...REQUIRED_FONT_KEYS);
  }

  return { loaded, error: error ?? null, missingKeys };
}

export { FONT_FILES, REQUIRED_FONT_KEYS, fonts } from './fontMap';
export type { RegisteredFontKey } from './fontMap';
