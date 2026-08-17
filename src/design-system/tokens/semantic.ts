/**
 * Semantic design tokens – CDS roles mapped from primitives.
 * Components should consume these via theme, not primitives.
 */

import {
  primitiveColors,
  primitiveSpacing,
  primitiveFontSize,
  primitiveLineHeight,
  primitiveFontWeight,
  primitiveRadius,
  primitiveBorderWidth,
  primitiveShadow,
  primitiveMotion,
  primitiveButtonPadding,
} from './primitive';

export const semanticColors = {
  primary: primitiveColors.burgundy,
  primaryHover: primitiveColors.burgundyHover,
  primaryActive: primitiveColors.burgundyPressed,
  primaryDark: primitiveColors.burgundyDark,

  background: primitiveColors.white,
  backgroundSubtle: primitiveColors.black05,
  backgroundMuted: primitiveColors.black10,
  backgroundBrand: primitiveColors.burgundy,
  backgroundInverse: primitiveColors.black,

  text: {
    primary: primitiveColors.black,
    secondary: primitiveColors.black80,
    subtle: primitiveColors.black70,
    subtler: primitiveColors.black70,
    inverse: primitiveColors.white,
    inverseSubtle: primitiveColors.white90,
    brand: primitiveColors.burgundy,
    link: primitiveColors.blue,
    linkHover: primitiveColors.blueHover,
  },

  border: primitiveColors.black20,
  borderSubtle: primitiveColors.black10,
  borderSubtler: primitiveColors.black05,
  borderBrand: primitiveColors.burgundy,
  borderFocus: primitiveColors.blue,

  success: primitiveColors.green,
  warning: primitiveColors.yellow,
  error: primitiveColors.magenta,
  info: primitiveColors.blue,

  tintSuccess: primitiveColors.greenLight,
  tintWarning: primitiveColors.yellowLight,
  tintInfo: primitiveColors.darkBlueLight,
  tintMuted: primitiveColors.black10,
} as const;

export const semanticSpacing = {
  xs: primitiveSpacing['04'],
  sm: primitiveSpacing['08'],
  md: primitiveSpacing['16'],
  lg: primitiveSpacing['24'],
  xl: primitiveSpacing['32'],
  /** Horizontal inset for mobile screens (matches Today tab). */
  screenHorizontal: primitiveSpacing['16'],
  section: primitiveSpacing['40'],
  button: {
    paddingVertical: primitiveButtonPadding.mobileVertical,
    paddingHorizontal: primitiveButtonPadding.mobileHorizontal,
  },
} as const;

export const semanticTypography = {
  /** Display / headings — platform UI font (SF Pro / Roboto) for now. */
  heading1: {
    fontSize: primitiveFontSize['250'],
    lineHeight: primitiveLineHeight.brandHeading,
    letterSpacing: 0,
    fontWeight: primitiveFontWeight.bold,
  },
  heading2: {
    fontSize: primitiveFontSize['200'],
    lineHeight: primitiveLineHeight.brandHeading,
    letterSpacing: 0,
    fontWeight: primitiveFontWeight.bold,
  },
  heading3: {
    fontSize: primitiveFontSize['125'],
    lineHeight: primitiveLineHeight.brandLead,
    letterSpacing: 0,
    fontWeight: primitiveFontWeight.bold,
  },
  /** Interface / body — platform UI font (SF Pro / Roboto); weight via fontWeight only. */
  body: {
    fontSize: primitiveFontSize['075'],
    lineHeight: primitiveLineHeight.body,
    letterSpacing: primitiveFontSize['075'] * -0.0175,
    fontWeight: primitiveFontWeight.bodyRegular,
  },
  bodySmall: {
    fontSize: primitiveFontSize['050'],
    lineHeight: primitiveLineHeight.body,
    letterSpacing: primitiveFontSize['050'] * -0.0175,
    fontWeight: primitiveFontWeight.bodyRegular,
  },
  caption: {
    fontSize: primitiveFontSize['025'],
    lineHeight: primitiveLineHeight.label,
    letterSpacing: primitiveFontSize['025'] * -0.0175,
    fontWeight: primitiveFontWeight.bodyRegular,
  },
} as const;

export const semanticRadius = {
  /** CDS control / button radius (2px). */
  button: primitiveRadius['02'],
  sm: primitiveRadius.sm,
  md: primitiveRadius.md,
  lg: primitiveRadius.lg,
  xl: primitiveRadius.xl,
  full: primitiveRadius.full,
} as const;

export const semanticBorderWidth = {
  default: primitiveBorderWidth['01'],
  focus: primitiveBorderWidth['02'],
} as const;

export const semanticShadow = {
  low: primitiveShadow.sm,
  medium: primitiveShadow.md,
  high: primitiveShadow.lg,
} as const;

export const semanticMotion = {
  durationFast: primitiveMotion.durationFast,
  durationNormal: primitiveMotion.durationMedium,
  durationSlow: primitiveMotion.durationSlow,
} as const;

/** Minimum touch target size (iOS 44pt / Material 48dp). */
export const touchTargetMinSize = 48;

/**
 * Search field height, shared by the global search screen and the Campus map
 * field so the two read as the same control. Capsule-shaped at this height —
 * a small corner radius reads as a text box rather than a search field.
 */
export const searchFieldHeight = 52;

/**
 * Query and placeholder size in that field. Shared for the same reason as the
 * height: the map's field cross-fades into the search screen's, so a
 * difference here shows up as the text jumping mid-transition.
 *
 * Never below 16 — iOS zooms the page when a focused input is smaller.
 */
export const searchFieldFontSize = 18;
