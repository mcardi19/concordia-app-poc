import React, { useMemo, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import { meTheme } from '@/screens/me/meTheme';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Outer layout — flex, width, margins. Carries the shadow and the radius. */
  style?: StyleProp<ViewStyle>;
  /** Padding and inner layout for the surface itself. */
  contentStyle?: StyleProp<ViewStyle>;
  radius?: number;
};

/**
 * The shared Me-tab card surface: liquid glass where the platform has it
 * (iOS 26+), a flat white card everywhere else.
 *
 * Two constraints the flat cards did not have. The shadow lives on the outer
 * Pressable because the glass sets `overflow: hidden` and would clip it. Press
 * feedback is a scale rather than the usual opacity dip — opacity on a parent
 * flattens the native effect into a plain translucent fill.
 */
export function MeGlassCard({
  children,
  onPress,
  accessibilityLabel,
  style,
  contentStyle,
  radius = 8,
}: Props) {
  const glass = useMemo(() => canUseLiquidGlass(), []);
  const interactive = onPress != null;

  const surface = glass ? (
    <GlassView
      isInteractive={interactive}
      glassEffectStyle="regular"
      colorScheme="light"
      tintColor={meTheme.cardGlassTint}
      style={[styles.surface, { borderRadius: radius }, contentStyle]}
    >
      {children}
    </GlassView>
  ) : (
    <View style={[styles.surface, styles.fallback, { borderRadius: radius }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <Pressable
      disabled={!interactive}
      onPress={onPress}
      accessibilityRole={interactive ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.shadow,
        { borderRadius: radius },
        style,
        interactive && pressed ? styles.pressed : null,
      ]}
    >
      {surface}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderCurve: 'continuous',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  surface: {
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  /** Only applied when liquid glass is unavailable. */
  fallback: {
    backgroundColor: meTheme.cardBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: meTheme.cardBorder,
  },
});
