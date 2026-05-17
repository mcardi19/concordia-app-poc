/**
 * Concordia CDS size primitives.
 * Source: wcms-aem/.../design-tokens/sizes.less
 */

export const primitiveThumbnailSize = {
  xs: 32,
  sm: 80,
  md: 96,
  lg: 128,
  xl: 160,
  '2xl': 192,
  '3xl': 224,
  '4xl': 256,
  '5xl': 288,
} as const;

/** Icon sizes at 16px base (em equivalents from web tokens). */
export const primitiveIconSize = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
} as const;
