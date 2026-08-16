import React, { useMemo } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * How far content scrolls before the curtain is fully drawn. Short on purpose:
 * it should arrive as soon as anything passes under the chrome, not gradually.
 */
export const CURTAIN_FADE_IN = [0, 20] as const;

/**
 * How far the fade runs past the chrome it sits behind. Generous — a short
 * ramp reads as a band with an edge, which is the thing the curtain exists to
 * avoid.
 */
export const CURTAIN_FADE_DEPTH = 56;

/**
 * Seven stops rather than two. A straight solid-to-transparent ramp leaves a
 * visible band where the midpoint crosses text; weighting the falloff toward
 * the top keeps the fade reading as depth instead of a gradient.
 */
const STOPS = [1, 0.96, 0.82, 0.55, 0.28, 0.1, 0] as const;
const LOCATIONS = [0, 0.22, 0.4, 0.58, 0.74, 0.88, 1] as const;

/**
 * Progressive blur, approximated by stacking.
 *
 * There is no variable-radius blur on this stack: `BlurView` takes one
 * intensity for its whole box, and masking one with a gradient is a dead end
 * here — `react-native-svg` will not mask non-SVG content, which is the same
 * wall `ProgressiveImageTreatment` hit.
 *
 * So each layer covers a shorter run from the top than the one before it, and
 * the blur compounds where they overlap: strongest under the chrome, thinning
 * downward. Layers are kept weak and numerous because the cost of the trick is
 * a seam at every layer's bottom edge — small steps make those disappear, and
 * the colour gradient drawn over the stack hides the rest.
 */
const BLUR_LAYERS = 6;
const BLUR_LAYER_INTENSITY = 8;

function rgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type Props = {
  /** The page background the curtain fades out of, as a hex string. */
  color: string;
  height: number;
  /** Scroll-driven 0–1. Omit for a curtain that is simply always drawn. */
  opacity?: Animated.AnimatedInterpolation<number> | number;
  /**
   * Adds the progressive blur behind the gradient. iOS only — `expo-blur` on
   * Android is experimental and this stacks six of them.
   */
  blurred?: boolean;
};

/**
 * The fade under floating top chrome, so scrolled content dissolves rather
 * than sliding out from behind a hard edge.
 *
 * Shared by Home and the search screens — the effect is the same one, and two
 * curtains with different falloffs over the same app would read as a mistake.
 */
export function ScrollCurtain({ color, height, opacity = 1, blurred = false }: Props) {
  const colors = useMemo(
    () =>
      STOPS.map((alpha) => rgba(color, alpha)) as unknown as readonly [
        string,
        string,
        ...string[],
      ],
    [color],
  );

  const showBlur = blurred && Platform.OS === 'ios';

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        height,
        opacity,
      }}
    >
      {showBlur ? (
        <View style={StyleSheet.absoluteFill}>
          {Array.from({ length: BLUR_LAYERS }, (_, i) => (
            <BlurView
              key={i}
              intensity={BLUR_LAYER_INTENSITY}
              tint="light"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                // Full height for the first, then progressively shorter.
                height: height * (1 - i / BLUR_LAYERS),
              }}
            />
          ))}
        </View>
      ) : null}

      <LinearGradient
        colors={colors}
        locations={LOCATIONS as unknown as readonly [number, number, ...number[]]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}
