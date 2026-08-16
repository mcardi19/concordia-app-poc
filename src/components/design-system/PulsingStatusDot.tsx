import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

/** Halo travel and fade — one slow expanding ring, not a throb. */
const PULSE_DURATION_MS = 1400;
const HALO_MAX_SCALE = 2.6;
const HALO_START_OPACITY = 0.7;

/**
 * A live-status dot with an expanding halo — the homepage session badge's
 * "in session now" indicator, and the Campus rail's live shuttle.
 *
 * Shared so "this is live" animates identically wherever it appears; two
 * dots pulsing at different rates on the same screen reads as a glitch.
 *
 * Driven by the legacy `Animated` API rather than Reanimated: it is a
 * fire-and-forget native-driver loop with no gesture or layout involvement,
 * and this is the form the session badge has always used.
 */
export function PulsingStatusDot({ color, size = 10 }: { color: string; size?: number }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: PULSE_DURATION_MS,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const haloScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, HALO_MAX_SCALE],
  });
  const haloOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [HALO_START_OPACITY, 0],
  });

  const dot = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderCurve: 'continuous' as const,
    backgroundColor: color,
  };

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          dot,
          { position: 'absolute', opacity: haloOpacity, transform: [{ scale: haloScale }] },
        ]}
      />
      <View style={dot} />
    </View>
  );
}
