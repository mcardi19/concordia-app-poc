/**
 * Theme type and theme objects built from semantic tokens.
 * Light (and optionally dark) theme; consumed via useTheme().
 */

import {
  semanticColors,
  semanticSpacing,
  semanticTypography,
  semanticRadius,
  semanticElevation,
  semanticMotion,
  touchTargetMinSize,
} from '@/design-system/tokens';

export type Theme = {
  color: typeof semanticColors;
  spacing: typeof semanticSpacing;
  typography: typeof semanticTypography;
  radius: typeof semanticRadius;
  elevation: typeof semanticElevation;
  motion: typeof semanticMotion;
  touchTargetMinSize: number;
};

export const lightTheme: Theme = {
  color: semanticColors,
  spacing: semanticSpacing,
  typography: semanticTypography,
  radius: semanticRadius,
  elevation: semanticElevation,
  motion: semanticMotion,
  touchTargetMinSize,
};
