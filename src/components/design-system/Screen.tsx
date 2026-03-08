import React from 'react';
import { View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/design-system/theme';

export interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  /** If true, use SafeAreaView; otherwise plain View with optional padding. */
  safe?: boolean;
  /** Apply section padding from theme. */
  padded?: boolean;
}

export function Screen({ children, safe = true, padded = true, style, ...rest }: ScreenProps) {
  const theme = useTheme();
  const padding = padded ? theme.spacing.section : 0;

  const Wrapper = safe ? SafeAreaView : View;

  return (
    <Wrapper style={[{ flex: 1, padding }, style]} {...rest}>
      {children}
    </Wrapper>
  );
}
