import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Defs,
  Image as SvgImage,
  LinearGradient as SvgLinearGradient,
  Mask,
  Rect,
  Stop,
} from 'react-native-svg';

export type ProgressiveImageTreatmentProps = {
  /**
   * The image underneath. Required for the blur: the sharp top of the ramp is
   * a second, gradient-masked copy of this drawn over a fully blurred base.
   * Without it only the tint stack renders.
   */
  source?: ImageSourcePropType;
  /**
   * Transform applied to the underlying image, if any. The masked copy must
   * carry the identical transform or the two will ghost apart.
   */
  imageStyle?: StyleProp<ImageStyle>;
  /**
   * Fraction of card height where the image starts going soft (0–1).
   * Everything above this stays fully sharp.
   * @default 0.48
   */
  blurStart?: number;
  /**
   * Blur strength at the bottom of the ramp. 0 disables.
   *
   * Currently defaults OFF. The gradient-masked sharp overlay below does not
   * render on this stack — react-native-svg draws nothing for the <Mask> +
   * <Image href={require(...)}> combination, so the full-coverage BlurView is
   * left blurring the entire photo instead of just the lower ramp. Until that
   * is resolved, shipping sharp beats shipping a smeared hero.
   * @default 0
   */
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

type SharpOverlayProps = {
  source: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  /** Where the fade to blurred begins (0–1). */
  start: number;
};

/**
 * A sharp copy of the image, faded out downward by an SVG gradient mask.
 *
 * This is what makes the ramp continuous. Stacking clipped BlurViews — the
 * obvious approach without a masking library — steps the blur radius at each
 * band's rectangular edge, and those edges read as visible bands no matter how
 * many you add. Masking a sharp copy over a uniformly blurred base has no
 * edges at all, and costs one BlurView instead of N.
 *
 * `@react-native-masked-view` would be the usual tool, but it is not installed
 * and this app runs the New Architecture; react-native-svg handles the mask.
 */
function SharpOverlay({ source, imageStyle, start }: SharpOverlayProps) {
  // Scoped per instance — the card and the expand overlay both mount one.
  const maskId = `pit-mask-${React.useId()}`;
  const gradientId = `pit-fade-${React.useId()}`;

  return (
    <Animated.View
      pointerEvents="none"
      // Transform only; ImageStyle and ViewStyle agree on that.
      style={[absoluteFill, imageStyle as StyleProp<ViewStyle>]}
    >
      {/* Explicit dimensions: react-native-svg needs a viewport, style alone gives none. */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            {/* White keeps the copy; black reveals the blurred base beneath. */}
            <Stop offset="0" stopColor="#fff" stopOpacity="1" />
            <Stop offset={start} stopColor="#fff" stopOpacity="1" />
            <Stop offset="1" stopColor="#fff" stopOpacity="0" />
          </SvgLinearGradient>
          <Mask id={maskId}>
            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
          </Mask>
        </Defs>
        <SvgImage
          href={source}
          x="0"
          y="0"
          width="100%"
          height="100%"
          // Equivalent to resizeMode="cover" on the base image.
          preserveAspectRatio="xMidYMid slice"
          mask={`url(#${maskId})`}
        />
      </Svg>
    </Animated.View>
  );
}

/**
 * Absolute overlay stack for photo cards:
 * progressive blur → warm vertical tint → diagonal accent → soft contrast.
 * Does not affect layout; place above an image and below content.
 */
export function ProgressiveImageTreatment({
  source,
  imageStyle,
  blurStart = 0.48,
  blurIntensity = 0,
  overlayOpacity = 1,
  style,
}: ProgressiveImageTreatmentProps) {
  const start = Math.max(0, Math.min(0.85, blurStart));
  const strength = Math.max(0, overlayOpacity);
  const useBlur = blurIntensity > 0 && source != null;

  return (
    <View pointerEvents="none" style={[absoluteFill, style]}>
      {useBlur ? (
        <>
          {/* Blurs the whole image; the masked copy restores the sharp top. */}
          <BlurView
            intensity={Math.min(100, blurIntensity)}
            tint="default"
            experimentalBlurMethod={androidBlurMethod}
            style={absoluteFill}
          />
          <SharpOverlay source={source} imageStyle={imageStyle} start={start} />
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
