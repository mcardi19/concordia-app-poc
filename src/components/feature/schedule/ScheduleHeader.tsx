import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import type { ScheduleViewMode } from './scheduleTypes';
import { formatDayHeading, formatWeekMeta } from './scheduleUtils';

type Props = {
  selectedDate: Date;
  viewMode: ScheduleViewMode;
  onViewModeChange: (mode: ScheduleViewMode) => void;
};

export function ScheduleHeader({ selectedDate, viewMode, onViewModeChange }: Props) {
  const theme = useTheme();
  const weekMeta = formatWeekMeta(selectedDate);
  const heading = formatDayHeading(selectedDate);

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.sm,
        }}
      >
        <Text variant="caption" color="secondary" style={{ letterSpacing: 0.6, flex: 1 }}>
          {weekMeta}
        </Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          {(['week', 'day'] as const).map((mode) => {
            const active = viewMode === mode;
            return (
              <Pressable
                key={mode}
                onPress={() => onViewModeChange(mode)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text
                  variant="bodySmall"
                  style={{
                    fontWeight: active ? '600' : '400',
                    color: active ? theme.color.primary : theme.color.text.subtle,
                    textTransform: 'capitalize',
                  }}
                >
                  {mode}
                </Text>
                {active ? (
                  <View
                    style={{
                      height: 2,
                      backgroundColor: theme.color.primary,
                      marginTop: 4,
                      borderRadius: 1,
                    }}
                  />
                ) : (
                  <View style={{ height: 6 }} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <Text
          variant="heading1"
          style={{
            fontSize: 34,
            lineHeight: 40,
            fontWeight: '700',
            color: theme.color.text.primary,
          }}
        >
          {heading.main}
        </Text>
        <Text
          variant="heading1"
          style={{
            fontSize: 34,
            lineHeight: 40,
            fontWeight: '700',
            color: '#C9A859',
          }}
        >
          {heading.suffix}
        </Text>
      </View>
    </View>
  );
}
