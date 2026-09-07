import React from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Text } from '@/components/design-system';
import { PulsingStatusDot } from '@/components/design-system/PulsingStatusDot';
import { useTheme } from '@/design-system/theme';
import { DEFAULT_STATUS_TONE } from './todaySession';

type Props = {
  label: string;
  /** Status dot colour — the card's state decides it. */
  tone?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Always sits on a photo/gradient surface — white type over a light frost,
 * same reasoning as `SessionHero`'s on-scrim colors.
 */
const ON_PHOTO_BADGE_TEXT = '#FFFFFF';
const ON_PHOTO_BADGE_WASH = 'rgba(255, 255, 255, 0.12)';

const androidBlurMethod =
  Platform.OS === 'android' ? ('dimezisBlurView' as const) : undefined;

const badgeChrome = {
  alignSelf: 'flex-start' as const,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 8,
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 999,
  borderCurve: 'continuous' as const,
  overflow: 'hidden' as const,
};

/** Frosted white pill on the session hero. */
export function SessionStatusBadge({ label, tone = DEFAULT_STATUS_TONE, style }: Props) {
  return (
    <View style={[badgeChrome, style]}>
      <BlurView
        pointerEvents="none"
        intensity={24}
        tint="default"
        experimentalBlurMethod={androidBlurMethod}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: ON_PHOTO_BADGE_WASH,
        }}
      />
      <PulsingStatusDot color={tone} />
      <Text
        variant="body"
        style={{
          fontWeight: '500',
          color: ON_PHOTO_BADGE_TEXT,
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
