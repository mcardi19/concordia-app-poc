/**
 * Concordia CDS typography primitives (16px root).
 * Source: wcms-aem/.../design-tokens/typography.less
 *
 * `fontFamily` values are Expo Font registration keys (see `fonts/fontMap.ts`).
 * Weight is encoded in the font file — do not pair these keys with fontWeight.
 */

import { fonts } from '@/design-system/fonts';

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
 * Registered Expo Font family keys (weight baked into each file).
 * POC: Inter for all roles (Gill Sans Nova temporarily unused).
 */
export const primitiveFontFamily = {
  body: fonts.interRegular,
  bodyMedium: fonts.interMedium,
  bodySemiBold: fonts.interSemiBold,
  bodyBold: fonts.interBold,
  brand: fonts.interBold,
  brandCondensed: fonts.interBold,
} as const;

/** @deprecated Prefer weight-specific `primitiveFontFamily` keys; kept for token docs. */
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
