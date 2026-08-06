import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/design-system';
import { fonts } from '@/design-system/fonts';
import { useTheme } from '@/design-system/theme';
import type { LibraryLoan } from './libraryData';

type Props = {
  loan: LibraryLoan;
  onRenew?: () => void;
};

export function LibraryLoanRow({ loan, onRenew }: Props) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.color.borderSubtle,
      }}
    >
      <View
        style={{
          width: 44,
          height: 64,
          borderRadius: theme.radius.sm,
          backgroundColor: loan.coverColor,
          marginRight: theme.spacing.md,
          padding: 6,
          justifyContent: 'flex-end',
        }}
      >
        <Text
          variant="caption"
          style={{ color: theme.color.text.inverse, fontSize: 9, lineHeight: 11 }}
          numberOfLines={2}
        >
          {loan.title}
        </Text>
      </View>

      <View style={{ flex: 1, paddingRight: theme.spacing.sm }}>
        <Text variant="body" style={{ fontFamily: fonts.interSemiBold, marginBottom: 2, lineHeight: 20 }}>
          {loan.title}
        </Text>
        <Text
          variant="bodySmall"
          color="secondary"
          style={{ fontStyle: 'italic', marginBottom: 4 }}
        >
          {loan.author}
        </Text>
        <Text
          variant="caption"
          style={{
            fontFamily: fonts.interBold,
            color: loan.dueUrgent ? theme.color.primary : theme.color.text.subtle,
            letterSpacing: 0.3,
          }}
        >
          {loan.dueLabel}
        </Text>
      </View>

      <Pressable
        onPress={onRenew}
        style={({ pressed }) => ({
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: loan.dueUrgent ? theme.color.primary : theme.color.border,
          opacity: pressed ? 0.85 : 1,
        })}
        accessibilityRole="button"
        accessibilityLabel={`Renew ${loan.title}`}
      >
        <Text
          variant="bodySmall"
          style={{
            fontFamily: fonts.interSemiBold,
            color: loan.dueUrgent ? theme.color.primary : theme.color.text.secondary,
          }}
        >
          Renew
        </Text>
      </Pressable>
    </View>
  );
}
