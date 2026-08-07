import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, type TextStyle } from 'react-native';
import { useTheme } from '@/design-system/theme';

export type TextVariant = 'heading1' | 'heading2' | 'heading3' | 'body' | 'bodySmall' | 'caption';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'subtle' | 'inverse' | 'brand' | 'link';
  allowFontScaling?: boolean;
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

  // Platform UI font only (SF Pro / Roboto). Ignore token/style fontFamily for now.
  if ('fontWeight' in typography && typography.fontWeight) {
    baseStyle.fontWeight = typography.fontWeight;
  }

  const flattened = StyleSheet.flatten([baseStyle, style]) as TextStyle;
  if (flattened.fontFamily != null) {
    const { fontFamily: _ignored, ...withoutFamily } = flattened;
    return (
      <RNText allowFontScaling={allowFontScaling} style={withoutFamily} {...rest} />
    );
  }

  return (
    <RNText allowFontScaling={allowFontScaling} style={[baseStyle, style]} {...rest} />
  );
}
