import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
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
 * Always sits on a photo/gradient surface, not the page — fixed regardless
 * of app theme, same reasoning as `SessionHero`'s on-scrim colors.
 */
const ON_PHOTO_BADGE_BG = '#FFFFFF';
const ON_PHOTO_BADGE_TEXT = '#1A1A1A';

/** White pill badge for photo / gradient surfaces (homepage primary card). */
export function SessionStatusBadge({ label, tone = DEFAULT_STATUS_TONE, style }: Props) {
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
          backgroundColor: ON_PHOTO_BADGE_BG,
        },
        style,
      ]}
    >
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
