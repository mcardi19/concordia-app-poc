import React from 'react';
import { Pressable, View } from 'react-native';
import { MaterialSymbol } from '@/components/icons';
import { Text } from '@/components/design-system';
import { fonts } from '@/design-system/fonts';
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
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            backgroundColor: theme.color.background,
            borderRadius: theme.radius.full,
            paddingHorizontal: 12.5,
            paddingVertical: 8.5,
            borderWidth: 0.5,
            borderColor: theme.color.background,
            ...todayShadowSoft,
          }}
        >
          <MaterialSymbol icon={chip.icon} size={18} color={chip.iconColor} />
          <Text
            variant="body"
            style={{
              fontFamily: fonts.interMedium,
              fontSize: 15,
              lineHeight: 15 * 1.2,
            }}
          >
            {chip.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
