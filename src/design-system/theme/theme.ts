/**
 * Theme type and theme objects built from semantic tokens.
 */

import {
  semanticColors,
  semanticSpacing,
  semanticTypography,
  semanticRadius,
  semanticBorderWidth,
  semanticShadow,
  semanticMotion,
  touchTargetMinSize,
} from '@/design-system/tokens';
import { primitiveFontFamily } from '@/design-system/tokens/primitive';

export type Theme = {
  color: typeof semanticColors;
  spacing: typeof semanticSpacing;
  typography: typeof semanticTypography;
  radius: typeof semanticRadius;
  borderWidth: typeof semanticBorderWidth;
  shadow: typeof semanticShadow;
  motion: typeof semanticMotion;
  fontFamily: typeof primitiveFontFamily;
  touchTargetMinSize: number;
};

export const lightTheme: Theme = {
  color: semanticColors,
  spacing: semanticSpacing,
  typography: semanticTypography,
  radius: semanticRadius,
  borderWidth: semanticBorderWidth,
  shadow: semanticShadow,
  motion: semanticMotion,
  fontFamily: primitiveFontFamily,
  touchTargetMinSize,
};
