import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import type { DegreeProgress } from '@/types/profile';

type Props = {
  progress: DegreeProgress;
};

export function DegreeProgressSection({ progress }: Props) {
  const theme = useTheme();
  const totalSegmentCredits = progress.segments.reduce((sum, s) => sum + s.credits, 0);

  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: theme.spacing.sm,
        }}
      >
        <Text variant="heading3" style={{ fontSize: 22 }}>
          Degree progress
        </Text>
        <Text variant="bodySmall" color="brand" style={{ textAlign: 'right' }}>
          <Text style={{ fontWeight: '700', fontSize: 18, color: theme.color.primary }}>
            {progress.earnedCredits}
          </Text>
          {` of ${progress.totalCredits} credits`}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          height: 10,
          borderRadius: theme.radius.button,
          borderCurve: 'continuous',
          overflow: 'hidden',
          marginBottom: theme.spacing.md,
        }}
      >
        {progress.segments.map((segment) => (
          <View
            key={segment.id}
            style={{
              flex: segment.credits / totalSegmentCredits,
              backgroundColor: segment.color,
            }}
          />
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {progress.segments.map((segment) => (
          <View
            key={segment.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '50%',
              marginBottom: theme.spacing.xs,
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                borderCurve: 'continuous',
                backgroundColor: segment.color,
                marginRight: theme.spacing.xs,
              }}
            />
            <Text variant="bodySmall" color="secondary">
              {segment.label} {segment.credits}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
