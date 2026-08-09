import React from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export type ProgressiveImageTreatmentProps = {
  /**
   * Fraction of card height where the progressive blur begins (0–1).
   * Upper image stays sharp above this line.
   * @default 0.48
   */
  blurStart?: number;
  /** BlurView intensity at full strength. @default 80 */
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
  /** Mask alpha stops — transparent = no blur, black = full blur. */
  colors: [string, string, ...string[]];
  locations: [number, number, ...number[]];
};

/**
 * Single BlurView softly revealed by a vertical gradient mask.
 * Avoids hard-clipped BlurBand stacks that read as visible stripes.
 */
function SoftBlur({ intensity, colors, locations }: SoftBlurProps) {
  return (
    <MaskedView
      style={absoluteFill}
      maskElement={
        <LinearGradient
          colors={colors}
          locations={locations}
          style={absoluteFill}
        />
      }
    >
      <BlurView
        intensity={intensity}
        tint="default"
        experimentalBlurMethod={androidBlurMethod}
        style={absoluteFill}
      />
    </MaskedView>
  );
}

/**
 * Absolute overlay stack for photo cards:
 * soft progressive blur → warm vertical tint → diagonal accent → soft contrast.
 * Does not affect layout; place above an image and below content.
 */
export function ProgressiveImageTreatment({
  blurStart = 0.48,
  blurIntensity = 80,
  overlayOpacity = 1,
  style,
}: ProgressiveImageTreatmentProps) {
  const start = Math.max(0, Math.min(0.85, blurStart));
  const strength = Math.max(0, overlayOpacity);
  const useBlur = blurIntensity > 0;
  const range = Math.max(0.05, 1 - start);
  const mid = Math.min(1, start + range * 0.4);
  const deep = Math.min(1, start + range * 0.72);

  return (
    <View pointerEvents="none" style={[absoluteFill, style]}>
      {useBlur ? (
        <>
          {/* Light haze that eases in from blurStart */}
          <SoftBlur
            intensity={Math.round(blurIntensity * 0.55)}
            colors={['transparent', 'rgba(0,0,0,0.45)', '#000000']}
            locations={[start, mid, 1]}
          />
          {/* Stronger blur only in the lower third */}
          <SoftBlur
            intensity={Math.min(100, blurIntensity)}
            colors={['transparent', 'rgba(0,0,0,0.55)', '#000000']}
            locations={[mid, deep, 1]}
          />
        </>
      ) : null}

      {/* Softens the blur ramp while tinting the lower image */}
      <LinearGradient
        colors={[
          'transparent',
          rgba(168, 132, 98, 0.2 * strength),
          rgba(198, 102, 52, 0.4 * strength),
        ]}
        locations={[0.32, 0.66, 1]}
        style={absoluteFill}
      />

      {/* Diagonal: orange/red bottom-left → clear centre → yellow/olive bottom-right */}
      <LinearGradient
        colors={[
          rgba(214, 74, 42, 0.3 * strength),
          'transparent',
          rgba(168, 148, 58, 0.26 * strength),
        ]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0.32 }}
        style={absoluteFill}
      />

      {/* Soft warm contrast for white type — keeps image faintly visible */}
      <LinearGradient
        colors={[
          'transparent',
          rgba(42, 26, 18, 0.16 * strength),
          rgba(26, 14, 10, 0.36 * strength),
        ]}
        locations={[0.38, 0.7, 1]}
        style={absoluteFill}
      />
    </View>
  );
}
