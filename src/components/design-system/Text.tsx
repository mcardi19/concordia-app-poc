import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@/design-system/theme';

export type TextVariant = 'heading1' | 'heading2' | 'heading3' | 'body' | 'bodySmall' | 'caption';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'subtle' | 'inverse';
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
          : theme.color.text.inverse;

  return (
    <RNText
      allowFontScaling={allowFontScaling}
      style={[
        {
          fontSize: typography.fontSize,
          fontWeight: typography.fontWeight,
          color: colorValue,
        },
        style,
      ]}
      {...rest}
    />
  );
}
