import React from 'react';
import {
  Platform,
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  type TextStyle,
} from 'react-native';
import { useTheme } from '@/design-system/theme';
import type { RegisteredFontKey } from '@/design-system/fonts/fontMap';

export type TextVariant = 'heading1' | 'heading2' | 'heading3' | 'body' | 'bodySmall' | 'caption';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'subtle' | 'inverse' | 'brand' | 'link';
  allowFontScaling?: boolean;
  /**
   * Opt in to a registered brand face (Gill Sans Nova). When set it overrides
   * the platform UI font. Only the session card uses this for now.
   */
  brandFace?: RegisteredFontKey;
}

/**
 * Platform UI face only — SF Pro on iOS (`System`), Roboto on Android.
 * Never Inter, Gill Sans Nova, or other loaded families.
 */
const PLATFORM_UI_FONT = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: undefined,
});

export function Text({
  variant = 'body',
  color = 'primary',
  allowFontScaling = true,
  brandFace,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const typography = theme.typography[variant];
  const colorValue =
    color === 'primary'
      ? theme.color.text.primary
      : color === 'secondary'
        ? theme.color.text.secondary
        : color === 'subtle'
          ? theme.color.text.subtle
          : color === 'brand'
            ? theme.color.text.brand
            : color === 'link'
              ? theme.color.text.link
              : theme.color.text.inverse;

  const baseStyle: TextStyle = {
    fontFamily: PLATFORM_UI_FONT,
    fontSize: typography.fontSize,
    lineHeight: typography.fontSize * typography.lineHeight,
    letterSpacing: typography.letterSpacing,
    color: colorValue,
  };

  if ('fontWeight' in typography && typography.fontWeight) {
    baseStyle.fontWeight = typography.fontWeight;
  }

  const flattened = StyleSheet.flatten([baseStyle, style]) as TextStyle;
  if (brandFace) {
    // Explicit brand opt-in wins. The weight is baked into the face, so drop any
    // fontWeight to avoid faux-bold synthesis against a single-weight TTF.
    flattened.fontFamily = brandFace;
    delete flattened.fontWeight;
  } else {
    // Callers may pass a fontFamily (brand tokens, Figma Inter leftovers) — discard it.
    flattened.fontFamily = PLATFORM_UI_FONT;
  }

  return <RNText allowFontScaling={allowFontScaling} style={flattened} {...rest} />;
}
