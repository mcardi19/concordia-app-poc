import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { Text } from '@/components/design-system';
import { useCardSurface } from '@/design-system/theme';
import { useTheme } from '@/design-system/theme';
import type { ScheduleEvent, ScheduleEventStatus } from './scheduleTypes';
import { formatTimeRange } from './scheduleUtils';

type Props = {
  event: ScheduleEvent;
  status: ScheduleEventStatus;
  height?: number;
  nowLabel?: string;
  style?: ViewStyle;
};

export function ScheduleEventBlock({ event, status, height, nowLabel, style }: Props) {
  const theme = useTheme();
  const isActive = status === 'active';
  const isPast = status === 'past';

  const cardBase = useCardSurface('none', {
    minHeight: height ?? 72,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    ...style,
  });

  const surfaceStyle: ViewStyle = isActive
    ? {
        ...cardBase,
        backgroundColor: theme.color.primary,
        borderColor: theme.color.primary,
      }
    : isPast
      ? {
          ...cardBase,
          backgroundColor: theme.color.backgroundSubtle,
          borderColor: theme.color.borderSubtle,
        }
      : {
          ...cardBase,
          borderLeftWidth: 4,
          borderLeftColor: theme.color.border,
        };

  const codeColor = isActive
    ? theme.color.text.inverseSubtle
    : isPast
      ? theme.color.text.subtle
      : theme.color.text.secondary;
  const titleColor = isActive
    ? theme.color.text.inverse
    : isPast
      ? theme.color.text.subtle
      : theme.color.text.primary;
  const timeColor = isActive ? theme.color.text.inverseSubtle : theme.color.text.subtle;

  return (
    <View>
      {isActive && nowLabel ? (
        <Text
          variant="caption"
          color="brand"
          style={{ fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 }}
        >
          {nowLabel}
        </Text>
      ) : null}
      <View style={surfaceStyle}>
        <View style={{ flex: 1, paddingRight: theme.spacing.sm }}>
          <Text variant="bodySmall" style={{ color: codeColor, marginBottom: 4 }}>
            {event.courseCode}
            {isPast ? ' · done' : ''}
          </Text>
          <Text
            variant="heading3"
            style={{
              fontSize: 20,
              lineHeight: 26,
              color: titleColor,
            }}
            numberOfLines={2}
          >
            {event.title}
          </Text>
        </View>
        <Text variant="bodySmall" style={{ color: timeColor, alignSelf: 'flex-start' }}>
          {formatTimeRange(event.startMinutes, event.endMinutes)}
        </Text>
      </View>
    </View>
  );
}
