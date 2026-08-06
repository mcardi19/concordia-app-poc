import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/design-system';
import { MaterialSymbol } from '@/components/icons';
import {
  msBookmarks,
  msDocumentScanner,
  msMeetingRoom,
} from '@/components/icons/symbols';
import { fonts } from '@/design-system/fonts';
import { useCardSurface } from '@/design-system/theme';
import { useTheme } from '@/design-system/theme';
import type { LibraryQuickAction } from './libraryData';

const ICONS = {
  scan: msDocumentScanner,
  room: msMeetingRoom,
  holds: msBookmarks,
} as const;

type Props = {
  action: LibraryQuickAction;
  onPress?: () => void;
};

export function LibraryQuickActionCard({ action, onPress }: Props) {
  const theme = useTheme();
  const cardStyle = useCardSurface('none', {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
    minHeight: 108,
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.9 : 1 })}
      accessibilityRole="button"
      accessibilityLabel={action.label}
    >
      <View style={cardStyle}>
        <View style={{ marginBottom: theme.spacing.sm }}>
          <MaterialSymbol icon={ICONS[action.icon]} size={28} color={theme.color.primary} />
        </View>
        <Text
          variant="caption"
          color="brand"
          style={{ fontFamily: fonts.interSemiBold, textAlign: 'center', lineHeight: 16 }}
        >
          {action.label}
        </Text>
      </View>
    </Pressable>
  );
}
