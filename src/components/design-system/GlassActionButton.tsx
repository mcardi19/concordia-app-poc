import React, { useMemo } from 'react';
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';

export type GlassActionButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: React.ReactNode;
  /**
   * Layout / shape for the control. Padding should live here so the glass
   * fills the full capsule (including horizontal inset around the label).
   */
  style?: StyleProp<ViewStyle>;
  /** Used when liquid glass is unavailable (Android, older iOS). */
  fallbackBackgroundColor?: string;
  accessibilityLabel: string;
  /** When false, skip the press scale (avoids a pop during expand handoff). */
  pressScaleEnabled?: boolean;
};

function canUseLiquidGlass(): boolean {
  try {
    return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}

/**
 * Circular or pill action control with native iOS liquid glass when available.
 * Avoids parent opacity (breaks UIVisualEffectView); press uses a slight scale.
 */
export function GlassActionButton({
  children,
  style,
  fallbackBackgroundColor = 'rgba(0,0,0,0.35)',
  accessibilityLabel,
  disabled,
  pressScaleEnabled = true,
  ...pressableProps
}: GlassActionButtonProps) {
  const useGlass = useMemo(() => canUseLiquidGlass(), []);

  const surfaceStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [
        {
          transform: [
            {
              scale:
                pressScaleEnabled && pressed && !disabled ? 0.94 : 1,
            },
          ],
        },
      ]}
      {...pressableProps}
    >
      {useGlass ? (
        <GlassView isInteractive glassEffectStyle="regular" style={[surfaceStyle, style]}>
          {children}
        </GlassView>
      ) : (
        <View style={[surfaceStyle, { backgroundColor: fallbackBackgroundColor }, style]}>
          {children}
        </View>
      )}
    </Pressable>
  );
}
