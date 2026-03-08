import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import { useTheme } from '@/design-system/theme';
import { MIN_TOUCH_TARGET_SIZE } from '@/accessibility';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: string | React.ReactNode;
  variant?: ButtonVariant;
  accessibilityLabel?: string;
}

export function Button({
  children,
  variant = 'primary',
  accessibilityLabel,
  style,
  ...pressableProps
}: ButtonProps) {
  const theme = useTheme();

  const backgroundColor =
    variant === 'primary'
      ? theme.color.primary
      : variant === 'secondary'
        ? theme.color.backgroundMuted
        : 'transparent';
  const textColor = variant === 'primary' ? theme.color.text.inverse : theme.color.text.primary;

  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radius.md,
          minHeight: MIN_TOUCH_TARGET_SIZE,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: pressed ? 0.9 : 1,
        },
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (typeof children === 'string' ? children : undefined)}
      {...pressableProps}
    >
      {typeof children === 'string' ? (
        <Text variant="body" style={{ color: textColor, fontWeight: '600' }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
