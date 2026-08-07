import React from 'react';
import { Animated } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';

type Props = {
  greeting: string;
  dateLabel: string;
  titleOpacity?: Animated.Value | Animated.AnimatedInterpolation<number>;
};

export function TodayMasthead({ greeting, dateLabel, titleOpacity }: Props) {
  const theme = useTheme();

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { paddingRight: theme.spacing.sm },
        titleOpacity != null ? { opacity: titleOpacity } : null,
      ]}
    >
      <Text
        variant="body"
        style={{
          fontWeight: '600',
          fontSize: 27,
          lineHeight: 27 * 1.02,
          letterSpacing: -1.2,
          marginBottom: 0,
        }}
      >
        {greeting}
      </Text>
      <Text
        variant="body"
        color="subtle"
        style={{
          fontWeight: '600',
          fontSize: 16,
          lineHeight: 16 * 1.2,
          letterSpacing: -0.4,
        }}
      >
        {dateLabel}
      </Text>
    </Animated.View>
  );
}
