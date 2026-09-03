/**
 * Expo Font registration map for Gill Sans Nova.
 *
 * Source: licensed desktop TTFs (Monotype). The web CDS loads the same family
 * via Adobe Fonts (Typekit kit ewy3egs) — font binaries are not in wcms-aem.
 *
 * Keys match PostScript names so `fontFamily` resolves 1:1 on iOS/Android.
 * React Native does not synthesise weights — pick the face, omit fontWeight.
 */
/* eslint-disable @typescript-eslint/no-require-imports */

export const FONT_FILES = {
  'GillSansNova-Book': require('../../../assets/fonts/GillSansNova-Book.ttf'),
  'GillSansNova-BookItalic': require('../../../assets/fonts/GillSansNova-BookItalic.ttf'),
  'GillSansNova-SemiBold': require('../../../assets/fonts/GillSansNova-SemiBold.ttf'),
  'GillSansNova-Heavy': require('../../../assets/fonts/GillSansNova-Heavy.ttf'),
  'GillSansNova-HeavyItalic': require('../../../assets/fonts/GillSansNova-HeavyItalic.ttf'),
  'GillSansNova-ExtraBold': require('../../../assets/fonts/GillSansNova-ExtraBold.ttf'),
  'GillSansNova-UltraBold': require('../../../assets/fonts/GillSansNova-UltraBold.ttf'),
  'GillSansNova-CnMedium': require('../../../assets/fonts/GillSansNova-CnMedium.ttf'),
  'GillSansNova-CnMediumIt': require('../../../assets/fonts/GillSansNova-CnMediumIt.ttf'),
  'GillSansNova-CnHeavy': require('../../../assets/fonts/GillSansNova-CnHeavy.ttf'),
  'GillSansNova-CnHeavyIt': require('../../../assets/fonts/GillSansNova-CnHeavyIt.ttf'),
  'GillSansNova-CnExtraBold': require('../../../assets/fonts/GillSansNova-CnExtraBold.ttf'),
  'GillSansNova-ExtraCondBold': require('../../../assets/fonts/GillSansNova-ExtraCondBold.ttf'),
} as const;

export type RegisteredFontKey = keyof typeof FONT_FILES;

export const REQUIRED_FONT_KEYS = Object.keys(FONT_FILES) as RegisteredFontKey[];

/**
 * Design-system aliases for registered faces.
 * Mirrors CDS `--cds-font-family-brand` / `--cds-font-family-brand-condensed`
 * plus every licensed weight we ship.
 */
export const fonts = {
  /** Default roman (Book / 400). */
  brand: 'GillSansNova-Book',
  brandBook: 'GillSansNova-Book',
  brandBookItalic: 'GillSansNova-BookItalic',
  /**
   * The roman middleweight. Closes the gap this map used to document: before
   * it arrived the only step below Heavy was Book, so anything wanting 500–700
   * fell back to 400 or jumped to 800.
   */
  brandSemiBold: 'GillSansNova-SemiBold',
  /** OS/2 800 — maps to CDS `--cds-font-weight-extra-bold` (800). */
  brandHeavy: 'GillSansNova-Heavy',
  brandHeavyItalic: 'GillSansNova-HeavyItalic',
  /** Named ExtraBold; OS/2 900. */
  brandExtraBold: 'GillSansNova-ExtraBold',
  brandUltraBold: 'GillSansNova-UltraBold',
  /** Condensed family (CDS brand-condensed). */
  brandCondensed: 'GillSansNova-CnHeavy',
  brandCondensedMedium: 'GillSansNova-CnMedium',
  brandCondensedMediumItalic: 'GillSansNova-CnMediumIt',
  brandCondensedHeavy: 'GillSansNova-CnHeavy',
  brandCondensedHeavyItalic: 'GillSansNova-CnHeavyIt',
  brandCondensedExtraBold: 'GillSansNova-CnExtraBold',
  brandExtraCondensedBold: 'GillSansNova-ExtraCondBold',
} as const satisfies Record<string, RegisteredFontKey>;

/**
 * Map CDS numeric brand weights to the closest registered roman face.
 *
 * 500–700 now resolve to the real SemiBold rather than rounding out to Book or
 * Heavy. 100–300 still round up to Book: there is no light roman shipped.
 */
export const brandFaceForWeight: Record<string, RegisteredFontKey> = {
  '100': fonts.brandBook,
  '200': fonts.brandBook,
  '300': fonts.brandBook,
  '400': fonts.brandBook,
  '500': fonts.brandSemiBold,
  '600': fonts.brandSemiBold,
  '700': fonts.brandSemiBold,
  '800': fonts.brandHeavy,
  '900': fonts.brandExtraBold,
};
