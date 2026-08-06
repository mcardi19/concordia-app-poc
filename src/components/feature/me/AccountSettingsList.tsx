import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/design-system';
import { MaterialSymbol, msChevronRight } from '@/components/icons';
import { fonts } from '@/design-system/fonts';
import { useCardSurface } from '@/design-system/theme';
import { useTheme } from '@/design-system/theme';
import type { SettingsRow } from '@/types/profile';

type Props = {
  rows: SettingsRow[];
  onRowPress?: (row: SettingsRow) => void;
};

export function AccountSettingsList({ rows, onRowPress }: Props) {
  const theme = useTheme();
  const cardStyle = useCardSurface('none', { padding: 0, overflow: 'hidden' });

  return (
    <View>
      <Text variant="heading3" style={{ fontSize: 22, marginBottom: theme.spacing.sm }}>
        Settings
      </Text>
      <View style={cardStyle}>
        {rows.map((row, index) => (
          <Pressable
            key={row.id}
            onPress={() => onRowPress?.(row)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: theme.spacing.md,
              paddingHorizontal: theme.spacing.md,
              backgroundColor: pressed ? theme.color.backgroundSubtle : theme.color.background,
              borderBottomWidth: index < rows.length - 1 ? 1 : 0,
              borderBottomColor: theme.color.borderSubtle,
            })}
            accessibilityRole="button"
            accessibilityLabel={row.label}
          >
            <Text variant="body" style={{ fontFamily: fonts.interMedium }}>
              {row.label}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {row.value ? (
                <Text variant="bodySmall" color="secondary" style={{ marginRight: theme.spacing.xs }}>
                  {row.value}
                </Text>
              ) : null}
              <MaterialSymbol icon={msChevronRight} size={22} color={theme.color.text.subtle} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
