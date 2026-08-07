import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, type TextStyle } from 'react-native';
import { useTheme } from '@/design-system/theme';

export type TextVariant = 'heading1' | 'heading2' | 'heading3' | 'body' | 'bodySmall' | 'caption';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'subtle' | 'inverse' | 'brand' | 'link';
  allowFontScaling?: boolean;
}

function isGillFace(fontFamily: string | undefined): boolean {
  return typeof fontFamily === 'string' && fontFamily.startsWith('GillSansNova');
}

export function Text({
  variant = 'body',
  color = 'primary',
  allowFontScaling = true,
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
    fontSize: typography.fontSize,
    lineHeight: typography.fontSize * typography.lineHeight,
    letterSpacing: typography.letterSpacing,
    color: colorValue,
  };

  // Brand faces are weight-specific PostScript names — set family only.
  // Body/UI variants keep platform default + fontWeight.
  if (
    'fontFamily' in typography &&
    typeof typography.fontFamily === 'string' &&
    typography.fontFamily
  ) {
    baseStyle.fontFamily = typography.fontFamily;
  } else if ('fontWeight' in typography && typography.fontWeight) {
    baseStyle.fontWeight = typography.fontWeight;
  }

  const flattened = StyleSheet.flatten([baseStyle, style]) as TextStyle;
  // Avoid RN remapping a weight-specific Gill face via fontWeight.
  if (isGillFace(flattened.fontFamily) && flattened.fontWeight != null) {
    const { fontWeight: _ignored, ...withoutWeight } = flattened;
    return (
      <RNText allowFontScaling={allowFontScaling} style={withoutWeight} {...rest} />
    );
  }

  return (
    <RNText allowFontScaling={allowFontScaling} style={[baseStyle, style]} {...rest} />
  );
}
