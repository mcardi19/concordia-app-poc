import React, { useMemo } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * How far content scrolls before the curtain is fully drawn. Short on purpose:
 * it should arrive as soon as anything passes under the chrome, not gradually.
 */
export const CURTAIN_FADE_IN = [0, 20] as const;

/** How far the colour fade runs past the chrome it sits behind. */
export const CURTAIN_FADE_DEPTH = 40;

/**
 * How far the blur runs past it — much shorter than the colour fade, and
 * deliberately so.
 *
 * A `BlurView` has a hard bottom edge whatever is drawn over it, so the trick
 * is to end the blur while the colour wash above still has body: at this depth
 * the gradient is around a fifth opaque where the blur stops, which covers the
 * seam. Run the blur to the bottom of the fade instead and it ends exactly
 * where the wash reaches zero, with nothing left to hide it.
 */
export const CURTAIN_BLUR_DEPTH = 8;

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
 * Each layer covers a shorter run from the top than the one before, so the
 * blur compounds where they overlap: strongest under the chrome, thinning
 * downward.
 *
 * The intensities ramp rather than being equal, which is what makes it read as
 * progressive. Only the first layer reaches the bottom, so its intensity *is*
 * the discontinuity at the edge — with every layer equal, that edge was a full
 * -strength blur stopping dead, which is the line you could see. Weakest at the
 * bottom, strongest at the top.
 */
const BLUR_LAYERS = 6;
const BLUR_BASE_INTENSITY = 3;
const BLUR_INTENSITY_STEP = 4;

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
  /** How far the blur reaches. Defaults to the full height. */
  blurHeight?: number;
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
export function ScrollCurtain({
  color,
  height,
  blurHeight,
  opacity = 1,
  blurred = false,
}: Props) {
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
              intensity={BLUR_BASE_INTENSITY + i * BLUR_INTENSITY_STEP}
              tint="light"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                // Full reach for the first, then progressively shorter.
                height: (blurHeight ?? height) * (1 - i / BLUR_LAYERS),
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
