/**
 * Primitive design tokens – raw values, platform-agnostic.
 * Can be shared or synced with web token source (e.g. JSON).
 * Do not use these directly in components; use semantic tokens via theme.
 */

export const primitiveColors = {
  white: '#FFFFFF',
  black: '#000000',
  grey50: '#F8F9FA',
  grey100: '#F1F3F5',
  grey200: '#E9ECEF',
  grey300: '#DEE2E6',
  grey400: '#CED4DA',
  grey500: '#ADB5BD',
  grey600: '#868E96',
  grey700: '#495057',
  grey800: '#343A40',
  grey900: '#212529',
  blue500: '#0D6EFD',
  blue600: '#0A58CA',
  blue700: '#084298',
  red500: '#DC3545',
  red600: '#BB2D3B',
  green500: '#198754',
} as const;

export const primitiveSpacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const primitiveTypography = {
  fontSize12: 12,
  fontSize14: 14,
  fontSize16: 16,
  fontSize18: 18,
  fontSize20: 20,
  fontSize24: 24,
  fontSize32: 32,
  fontWeightRegular: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightSemibold: '600' as const,
  fontWeightBold: '700' as const,
};

export const primitiveRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const primitiveElevation = {
  none: 0,
  low: 2,
  medium: 4,
  high: 8,
} as const;

export const primitiveMotion = {
  durationFast: 150,
  durationNormal: 250,
  durationSlow: 400,
} as const;
