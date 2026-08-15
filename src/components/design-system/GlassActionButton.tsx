import React, { useMemo } from 'react';
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

export type GlassActionButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: React.ReactNode;
  /**
   * Layout / shape for the control. Padding should live here so the glass
   * fills the full capsule (including horizontal inset around the label).
   */
  style?: StyleProp<ViewStyle>;
  /** Used when liquid glass is unavailable (Android, older iOS, Expo Go). */
  fallbackBackgroundColor?: string;
  accessibilityLabel: string;
  /** When false, skip the press scale (avoids a pop during expand handoff). */
  pressScaleEnabled?: boolean;
};

type GlassModule = {
  GlassView: React.ComponentType<{
    isInteractive?: boolean;
    glassEffectStyle?: string;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
  }>;
  isLiquidGlassAvailable: () => boolean;
  isGlassEffectAPIAvailable: () => boolean;
};

function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

function loadGlassModule(): GlassModule | null {
  // Expo Go does not ship a safe ExpoGlassEffect native view; importing
  // expo-glass-effect on iOS can crash before any availability check runs.
  if (isExpoGo()) {
    return null;
  }
  try {
    // Lazy require so Expo Go never evaluates GlassView.ios.js.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-glass-effect') as GlassModule;
  } catch {
    return null;
  }
}

function canUseLiquidGlass(glass: GlassModule | null): boolean {
  if (!glass) {
    return false;
  }
  try {
    return glass.isLiquidGlassAvailable() && glass.isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}

/**
 * Circular or pill action control with native iOS liquid glass when available.
 * Avoids parent opacity (breaks UIVisualEffectView); press uses a slight scale.
 * Falls back to a translucent View in Expo Go / unsupported runtimes.
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
  const glass = useMemo(() => loadGlassModule(), []);
  const useGlass = useMemo(() => canUseLiquidGlass(glass), [glass]);
  const GlassView = glass?.GlassView;

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
      {useGlass && GlassView ? (
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
