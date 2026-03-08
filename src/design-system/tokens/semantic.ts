/**
 * Semantic design tokens – meaningful names mapped from primitives.
 * Components should consume these via theme, not primitives.
 * Naming: category.subcategory.variant
 */

import {
  primitiveColors,
  primitiveSpacing,
  primitiveTypography,
  primitiveRadius,
  primitiveElevation,
  primitiveMotion,
} from './primitive';

export const semanticColors = {
  // Brand / primary
  primary: primitiveColors.blue500,
  primaryHover: primitiveColors.blue600,
  primaryActive: primitiveColors.blue700,
  // Backgrounds
  background: primitiveColors.white,
  backgroundSubtle: primitiveColors.grey50,
  backgroundMuted: primitiveColors.grey100,
  // Text
  text: {
    primary: primitiveColors.grey900,
    secondary: primitiveColors.grey700,
    subtle: primitiveColors.grey600,
    inverse: primitiveColors.white,
  },
  // Borders
  border: primitiveColors.grey300,
  borderSubtle: primitiveColors.grey200,
  // Feedback
  success: primitiveColors.green500,
  error: primitiveColors.red500,
  errorHover: primitiveColors.red600,
} as const;

export const semanticSpacing = {
  xs: primitiveSpacing[1],
  sm: primitiveSpacing[2],
  md: primitiveSpacing[4],
  lg: primitiveSpacing[6],
  xl: primitiveSpacing[8],
  section: primitiveSpacing[10],
} as const;

export const semanticTypography = {
  heading1: {
    fontSize: primitiveTypography.fontSize32,
    fontWeight: primitiveTypography.fontWeightBold,
  },
  heading2: {
    fontSize: primitiveTypography.fontSize24,
    fontWeight: primitiveTypography.fontWeightBold,
  },
  heading3: {
    fontSize: primitiveTypography.fontSize20,
    fontWeight: primitiveTypography.fontWeightSemibold,
  },
  body: {
    fontSize: primitiveTypography.fontSize16,
    fontWeight: primitiveTypography.fontWeightRegular,
  },
  bodySmall: {
    fontSize: primitiveTypography.fontSize14,
    fontWeight: primitiveTypography.fontWeightRegular,
  },
  caption: {
    fontSize: primitiveTypography.fontSize12,
    fontWeight: primitiveTypography.fontWeightRegular,
  },
} as const;

export const semanticRadius = {
  sm: primitiveRadius.sm,
  md: primitiveRadius.md,
  lg: primitiveRadius.lg,
  full: primitiveRadius.full,
} as const;

export const semanticElevation = {
  low: primitiveElevation.low,
  medium: primitiveElevation.medium,
  high: primitiveElevation.high,
} as const;

export const semanticMotion = {
  durationFast: primitiveMotion.durationFast,
  durationNormal: primitiveMotion.durationNormal,
  durationSlow: primitiveMotion.durationSlow,
} as const;

/** Minimum touch target size (iOS 44pt / Material 48dp). We use 48 for both. */
export const touchTargetMinSize = 48;
