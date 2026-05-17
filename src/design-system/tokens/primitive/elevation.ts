/**
 * Concordia CDS elevation / shadow primitives for React Native.
 * Source: wcms-aem/.../design-tokens/elevation.less
 */

import { primitiveColors } from './colors';

export type ShadowPreset = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export const primitiveShadow = {
  sm: {
    shadowColor: primitiveColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: primitiveColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: primitiveColors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.13,
    shadowRadius: 24,
    elevation: 8,
  },
  xl: {
    shadowColor: primitiveColors.black,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.14,
    shadowRadius: 36,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#241F1F',
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 0.27,
    shadowRadius: 80,
    elevation: 16,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const satisfies Record<string, ShadowPreset>;

export const primitiveZIndex = {
  '0': 0,
  '10': 10,
  '20': 20,
  '30': 30,
  '40': 40,
  '50': 50,
} as const;
