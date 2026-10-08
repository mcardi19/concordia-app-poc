import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

type BlurViewProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: string;
  experimentalBlurMethod?: string;
  pointerEvents?: 'none' | 'auto' | 'box-none' | 'box-only';
};

export function BlurView({ children, style, pointerEvents }: BlurViewProps) {
  return (
    <View style={style} pointerEvents={pointerEvents}>
      {children}
    </View>
  );
}
