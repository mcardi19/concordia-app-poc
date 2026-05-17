import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/design-system';
import { useCardSurface } from '@/design-system/theme';
import { useTheme } from '@/design-system/theme';
import type { StudentProfile } from '@/types/profile';

type Props = {
  profile: StudentProfile;
};

function PhotoPlaceholder() {
  const theme = useTheme();
  return (
    <View
      style={{
        width: 88,
        height: 108,
        backgroundColor: theme.color.backgroundMuted,
        borderRadius: theme.radius.sm,
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: 200,
            height: 2,
            backgroundColor: theme.color.borderSubtle,
            transform: [{ rotate: '-45deg' }, { translateX: -40 + i * 8 }],
            top: i * 10,
          }}
        />
      ))}
    </View>
  );
}

function BarcodePlaceholder() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', height: 48 }}>
      {Array.from({ length: 42 }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 2,
            height: 20 + (i % 5) * 6,
            marginRight: 2,
            backgroundColor: theme.color.text.primary,
          }}
        />
      ))}
    </View>
  );
}

export function StudentIdCard({ profile }: Props) {
  const theme = useTheme();
  const cardStyle = useCardSurface('low', { padding: theme.spacing.md, marginBottom: theme.spacing.md });

  return (
    <View style={cardStyle}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.sm,
        }}
      >
        <Text variant="heading3" color="brand" style={{ flex: 1, fontSize: 20 }}>
          Concordia Student ID
        </Text>
        <Text variant="caption" color="secondary">
          {profile.academicYear}
        </Text>
      </View>
      <View style={{ height: 1, backgroundColor: theme.color.primary, marginBottom: theme.spacing.md }} />

      <View style={{ flexDirection: 'row', marginBottom: theme.spacing.md }}>
        <PhotoPlaceholder />
        <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
          <Text variant="caption" color="secondary" style={{ letterSpacing: 0.8, marginBottom: 4 }}>
            {profile.displayName}
          </Text>
          <Text variant="heading2" color="brand" style={{ fontSize: 22, lineHeight: 28, marginBottom: theme.spacing.md }}>
            {profile.program}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text variant="caption" color="secondary">
                ID
              </Text>
              <Text variant="bodySmall" color="brand" style={{ fontWeight: '600' }}>
                {formatStudentId(profile.studentId)}
              </Text>
            </View>
            <View style={{ flex: 1, paddingHorizontal: 4 }}>
              <Text variant="caption" color="secondary">
                Year
              </Text>
              <Text variant="bodySmall" color="brand" style={{ fontWeight: '600' }}>
                {profile.yearLabel}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="caption" color="secondary">
                Advisor
              </Text>
              <Text variant="bodySmall" color="brand" style={{ fontWeight: '600' }}>
                {profile.advisor}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View
        style={{
          borderTopWidth: 1,
          borderStyle: 'dashed',
          borderColor: theme.color.border,
          paddingTop: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <BarcodePlaceholder />
        <Text variant="caption" color="secondary" style={{ marginLeft: theme.spacing.sm, letterSpacing: 1 }}>
          TAP
        </Text>
      </View>
    </View>
  );
}

function formatStudentId(id: string): string {
  const digits = id.replace(/\D/g, '');
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}
