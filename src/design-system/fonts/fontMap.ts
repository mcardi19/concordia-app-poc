/**
 * Expo Font registration map.
 * Keys are the exact `fontFamily` strings used in styles.
 * Only files present in `assets/fonts/` are registered.
 *
 * Metro requires `require()` for static font assets.
 */
/* eslint-disable @typescript-eslint/no-require-imports */

export const FONT_FILES = {
  Inter_400Regular: require('../../../assets/fonts/Inter-Regular.ttf'),
  Inter_500Medium: require('../../../assets/fonts/Inter-Medium.ttf'),
  Inter_600SemiBold: require('../../../assets/fonts/Inter-SemiBold.ttf'),
  Inter_700Bold: require('../../../assets/fonts/Inter-Bold.ttf'),
} as const;

export type RegisteredFontKey = keyof typeof FONT_FILES;

export const REQUIRED_FONT_KEYS = Object.keys(FONT_FILES) as RegisteredFontKey[];

/** Registered family keys for design-system consumption. */
export const fonts = {
  interRegular: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',
  /** @deprecated POC uses Inter for all type; alias kept for call-site compatibility. */
  gillSansNovaBold: 'Inter_700Bold',
} as const satisfies Record<string, RegisteredFontKey>;
