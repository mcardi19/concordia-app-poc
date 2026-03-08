import React from 'react';
import { View, ViewProps, Platform } from 'react-native';
import { useTheme } from '@/design-system/theme';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  /** Elevation level for shadow (Android) and shadow* (iOS). */
  elevation?: 'low' | 'medium' | 'high';
}

export function Card({ children, elevation = 'low', style, ...rest }: CardProps) {
  const theme = useTheme();
  const shadow = theme.elevation[elevation];

  const shadowStyle =
    Platform.OS === 'ios'
      ? {
          shadowColor: theme.color.text.primary,
          shadowOffset: { width: 0, height: shadow },
          shadowOpacity: 0.1,
          shadowRadius: shadow * 1.5,
        }
      : {
          elevation: shadow,
        };

  return (
    <View
      style={[
        {
          backgroundColor: theme.color.background,
          borderRadius: theme.radius.md,
          padding: theme.spacing.lg,
          ...shadowStyle,
        },
        style,
      ]}
      accessibilityRole="none"
      {...rest}
    >
      {children}
    </View>
  );
}
