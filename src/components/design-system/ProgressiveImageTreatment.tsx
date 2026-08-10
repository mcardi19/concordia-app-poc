import React from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export type ProgressiveImageTreatmentProps = {
  /**
   * Fraction of card height where the progressive blur begins (0–1).
   * Upper image stays sharp above this line.
   * @default 0.48
   */
  blurStart?: number;
  /** BlurView intensity at full strength. @default 0 (disabled while tuning expand perf). */
  blurIntensity?: number;
  /** Scales warm tint / contrast overlay alpha. @default 1 */
  overlayOpacity?: number;
  style?: StyleProp<ViewStyle>;
};

const absoluteFill: ViewStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const androidBlurMethod =
  Platform.OS === 'android' ? ('dimezisBlurView' as const) : undefined;

function rgba(r: number, g: number, b: number, a: number): string {
  const alpha = Math.max(0, Math.min(1, a));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type SoftBlurProps = {
  intensity: number;
  /** Fraction of parent height where this blur band begins (0–1). */
  start: number;
};

/**
 * Blur band from `start` to the bottom.
 * Uses clipped BlurViews instead of RNCMaskedView (broken under New Architecture).
 */
function SoftBlur({ intensity, start }: SoftBlurProps) {
  const topPercent = `${Math.round(Math.max(0, Math.min(1, start)) * 100)}%`;

  return (
    <View pointerEvents="none" style={[absoluteFill, { top: topPercent }]}>
      <BlurView
        intensity={intensity}
        tint="default"
        experimentalBlurMethod={androidBlurMethod}
        style={absoluteFill}
      />
    </View>
  );
}

/**
 * Absolute overlay stack for photo cards:
 * progressive blur → warm vertical tint → diagonal accent → soft contrast.
 * Does not affect layout; place above an image and below content.
 */
export function ProgressiveImageTreatment({
  blurStart = 0.48,
  blurIntensity = 0,
  overlayOpacity = 1,
  style,
}: ProgressiveImageTreatmentProps) {
  const start = Math.max(0, Math.min(0.85, blurStart));
  const strength = Math.max(0, overlayOpacity);
  const useBlur = blurIntensity > 0;
  const range = Math.max(0.05, 1 - start);
  const mid = Math.min(1, start + range * 0.35);
  const deep = Math.min(1, start + range * 0.65);

  return (
    <View pointerEvents="none" style={[absoluteFill, style]}>
      {useBlur ? (
        <>
          <SoftBlur
            intensity={Math.round(blurIntensity * 0.5)}
            start={start}
          />
          <SoftBlur
            intensity={Math.round(blurIntensity * 0.75)}
            start={mid}
          />
          <SoftBlur
            intensity={Math.min(100, blurIntensity)}
            start={deep}
          />
        </>
      ) : null}

      {/* Softens band edges while tinting the lower image */}
      <LinearGradient
        colors={[
          'transparent',
          rgba(168, 132, 98, 0.22 * strength),
          rgba(198, 102, 52, 0.42 * strength),
        ]}
        locations={[0.32, 0.66, 1]}
        style={absoluteFill}
      />

      {/* Diagonal: orange/red bottom-left → clear centre → yellow/olive bottom-right */}
      <LinearGradient
        colors={[
          rgba(214, 74, 42, 0.32 * strength),
          'transparent',
          rgba(168, 148, 58, 0.28 * strength),
        ]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0.32 }}
        style={absoluteFill}
      />

      {/* Soft warm contrast for white type */}
      <LinearGradient
        colors={[
          'transparent',
          rgba(42, 26, 18, 0.18 * strength),
          rgba(26, 14, 10, 0.4 * strength),
        ]}
        locations={[0.38, 0.7, 1]}
        style={absoluteFill}
      />
    </View>
  );
}
