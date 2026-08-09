import React from 'react';
import { Pressable, View } from 'react-native';
import { MaterialSymbol } from '@/components/icons';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import type { PinnedChip } from './todayData';
import { todayShadowSoft } from './todayShadows';

type Props = {
  chips: PinnedChip[];
  onChipPress?: (chip: PinnedChip) => void;
};

export function TodayPinnedChips({ chips, onChipPress }: Props) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
      {chips.map((chip) => (
        <Pressable
          key={chip.id}
          onPress={() => onChipPress?.(chip)}
          accessibilityRole="button"
          accessibilityLabel={chip.label}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            backgroundColor: theme.color.background,
            borderRadius: theme.radius.full,
            borderCurve: 'continuous',
            paddingLeft: 12.5,
            paddingRight: 16,
            paddingVertical: 10,
            borderWidth: 0.5,
            borderColor: theme.color.background,
            transform: [{ scale: pressed ? 0.975 : 1 }],
            ...todayShadowSoft,
          })}
        >
          <MaterialSymbol icon={chip.icon} size={18} color={chip.iconColor} />
          <Text
            variant="body"
            style={{
              fontWeight: '500',
              fontSize: 17,
              lineHeight: 17 * 1.2,
            }}
          >
            {chip.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
