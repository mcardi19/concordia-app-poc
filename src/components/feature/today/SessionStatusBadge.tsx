import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';

type Props = {
  label: string;
  style?: StyleProp<ViewStyle>;
};

/** White pill badge for photo / gradient surfaces (homepage primary card). */
export function SessionStatusBadge({ label, style }: Props) {
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 999,
          borderCurve: 'continuous',
          backgroundColor: '#FFFFFF',
        },
        style,
      ]}
    >
      <PulsingStatusDot color="#00C853" />
      <Text
        variant="body"
        style={{
          fontWeight: '500',
          color: '#1A1A1A',
          fontSize: 15,
          lineHeight: 15 * 1.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/** Status badge on light surfaces (no pill). */
export function SessionStatusBadgeOnLight({ label, style }: Props) {
  const theme = useTheme();

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, style]}>
      <PulsingStatusDot color={theme.color.success} />
      <Text
        variant="body"
        style={{
          fontWeight: '500',
          color: theme.color.text.primary,
          fontSize: 16,
          lineHeight: 16 * 1.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function PulsingStatusDot({ color }: { color: string }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const haloScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.6],
  });
  const haloOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 0],
  });

  return (
    <View style={{ width: 10, height: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: 10,
          height: 10,
          borderRadius: 5,
          borderCurve: 'continuous',
          backgroundColor: color,
          opacity: haloOpacity,
          transform: [{ scale: haloScale }],
        }}
      />
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          borderCurve: 'continuous',
          backgroundColor: color,
        }}
      />
    </View>
  );
}
