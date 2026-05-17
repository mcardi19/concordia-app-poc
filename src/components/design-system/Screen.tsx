import React from 'react';
import { View, ViewProps } from 'react-native';
import {
  SafeAreaView,
  type Edge,
} from 'react-native-safe-area-context';
import { getScreenHorizontalPaddingStyle } from '@/design-system/theme/screenLayout';
import { useTheme } from '@/design-system/theme';

export interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  /** If true, use SafeAreaView; otherwise plain View. */
  safe?: boolean;
  /** Apply standard horizontal screen inset (Today tab). */
  padded?: boolean;
  /** Safe area edges when `safe` is true. Tab roots often use `['top']`. */
  edges?: Edge[];
}

export function Screen({
  children,
  safe = true,
  padded = true,
  edges,
  style,
  ...rest
}: ScreenProps) {
  const theme = useTheme();
  const insetStyle = padded ? getScreenHorizontalPaddingStyle(theme) : undefined;
  const Wrapper = safe ? SafeAreaView : View;
  const safeAreaProps = safe && edges ? { edges } : {};

  return (
    <Wrapper
      style={[{ flex: 1, backgroundColor: theme.color.background }, style]}
      {...safeAreaProps}
      {...rest}
    >
      <View style={[{ flex: 1 }, insetStyle]}>{children}</View>
    </Wrapper>
  );
}
