import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

type GlassViewProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  isInteractive?: boolean;
  glassEffectStyle?: string;
  colorScheme?: string;
  tintColor?: string;
  pointerEvents?: 'none' | 'auto' | 'box-none' | 'box-only';
};

export function GlassView({ children, style, pointerEvents }: GlassViewProps) {
  return (
    <View style={style} pointerEvents={pointerEvents}>
      {children}
    </View>
  );
}

export function isLiquidGlassAvailable() {
  return false;
}

export function isGlassEffectAPIAvailable() {
  return false;
}

export type GlassColorScheme = 'light' | 'dark' | 'auto';
