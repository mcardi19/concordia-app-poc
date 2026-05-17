import React from 'react';
import { View, ViewProps } from 'react-native';
import { getCardSurfaceStyle, type CardElevation } from '@/design-system/theme/cardSurface';
import { useTheme } from '@/design-system/theme';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  /** Shadow level; border is always applied. */
  elevation?: Exclude<CardElevation, 'none'>;
}

export function Card({ children, elevation = 'low', style, ...rest }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        getCardSurfaceStyle(theme, elevation, { padding: theme.spacing.lg }),
        style,
      ]}
      accessibilityRole="none"
      {...rest}
    >
      {children}
    </View>
  );
}
