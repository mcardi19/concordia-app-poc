/**
 * Theme type and theme objects built from semantic tokens.
 */

import {
  semanticColors,
  semanticColorsDark,
  semanticSpacing,
  semanticTypography,
  semanticRadius,
  semanticBorderWidth,
  semanticShadow,
  semanticMotion,
  touchTargetMinSize,
} from '@/design-system/tokens';
import { primitiveFontFamily } from '@/design-system/tokens/primitive';

/** Widens a `const`-literal token object's string leaves to `string`, so a
 *  differently-valued sibling (e.g. `semanticColorsDark`) still satisfies it. */
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };

export type Theme = {
  color: Widen<typeof semanticColors>;
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

/** Everything but `color` is scheme-independent, so this only overrides that. */
export const darkTheme: Theme = {
  ...lightTheme,
  color: semanticColorsDark,
};
