/**
 * Concordia CDS typography primitives (16px root).
 * Source: wcms-aem/.../design-tokens/typography.less
 *
 * Default roles use the platform UI font (SF Pro / Roboto).
 * Gill Sans Nova faces stay registered for explicit opt-in (e.g. Today session card).
 */

import { fonts } from '@/design-system/fonts/fontMap';

export const primitiveFontSize = {
  '025': 12,
  '050': 14,
  '075': 16,
  '100': 18,
  '125': 20,
  '150': 22,
  '175': 24,
  '200': 28,
  '250': 32,
  '300': 36,
  '350': 40,
  '400': 44,
  '450': 48,
  '500': 52,
  '550': 56,
  '600': 60,
  '650': 68,
  '700': 76,
  '750': 84,
  '800': 92,
  '850': 100,
  '900': 108,
  '950': 116,
  '1000': 124,
  '1100': 140,
  '1200': 156,
} as const;

export const primitiveLineHeight = {
  label: 1.4,
  body: 1.6,
  brandBody: 1.4,
  brandLead: 1.35,
  brandHeading: 1.1,
  brandDisplay: 1,
} as const;

export const primitiveLetterSpacing = {
  display: -0.32,
  heading: -0.16,
  lead: 0.16,
  body: -0.28,
} as const;

/**
 * Brand family keys — PostScript names registered via expo-font.
 * Condensed default matches web h1/h2 (weight 800 → Cn Heavy).
 */
export const primitiveFontFamily = {
  brand: fonts.brand,
  brandBook: fonts.brandBook,
  brandBookItalic: fonts.brandBookItalic,
  brandHeavy: fonts.brandHeavy,
  brandHeavyItalic: fonts.brandHeavyItalic,
  brandExtraBold: fonts.brandExtraBold,
  brandUltraBold: fonts.brandUltraBold,
  brandCondensed: fonts.brandCondensed,
  brandCondensedMedium: fonts.brandCondensedMedium,
  brandCondensedHeavy: fonts.brandCondensedHeavy,
  brandCondensedExtraBold: fonts.brandCondensedExtraBold,
  brandExtraCondensedBold: fonts.brandExtraCondensedBold,
} as const;

/**
 * Numeric CDS weights. Prefer selecting a Gill face via `primitiveFontFamily`
 * for brand type; use these weights only with the platform body font.
 */
export const primitiveFontWeight = {
  light: '100' as const,
  book: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
  bodyLight: '300' as const,
  bodyRegular: '400' as const,
  bodyMedium: '500' as const,
  bodySemiBold: '600' as const,
  bodyBold: '700' as const,
  bodyExtraBold: '800' as const,
};
