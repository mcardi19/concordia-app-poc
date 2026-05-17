/**
 * Concordia CDS border primitives.
 * Source: wcms-aem/.../design-tokens/borders.less
 */

export const primitiveBorderWidth = {
  '00': 0,
  '01': 1,
  '02': 2,
  '04': 4,
  '06': 6,
  '08': 8,
} as const;

export const primitiveRadius = {
  '00': 0,
  '02': 2,
  '04': 4,
  '08': 8,
  '12': 12,
  '16': 16,
  '24': 24,
  '9999': 9999,
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;
