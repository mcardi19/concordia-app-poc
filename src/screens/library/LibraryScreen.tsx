import React from 'react';
import { ScrollView, View } from 'react-native';
import { Screen, Text } from '@/components/design-system';
import {
  CURATED_BOOKS,
  CURATED_BY,
  CURATED_COURSE,
  LIBRARY_LOANS,
  LIBRARY_QUICK_ACTIONS,
  LIBRARY_STATUS,
  LibraryCuratedBook,
  LibraryLoanRow,
  LibraryQuickActionCard,
} from '@/components/feature/library';
import { useCardSurface, useTheme } from '@/design-system/theme';

export function LibraryScreen() {
  const theme = useTheme();
  const loansCardStyle = useCardSurface('none', {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  });

  return (
    <Screen edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
      >
        <Text
          variant="heading1"
          style={{
            fontSize: 32,
            lineHeight: 38,
            fontWeight: '700',
            color: theme.color.text.primary,
            marginTop: theme.spacing.sm,
            marginBottom: theme.spacing.sm,
          }}
        >
          Library
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
            paddingBottom: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.color.borderSubtle,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.color.success,
              marginRight: theme.spacing.sm,
            }}
          />
          <Text variant="bodySmall" color="secondary" style={{ flex: 1 }}>
            {LIBRARY_STATUS}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: theme.spacing.sm,
          }}
        >
          <Text variant="heading3" style={{ fontSize: 22, lineHeight: 26 }}>
            On loan
          </Text>
          <Text variant="caption" color="secondary" style={{ letterSpacing: 0.4 }}>
            {LIBRARY_LOANS.length} volumes
          </Text>
        </View>

        <View style={loansCardStyle}>
          {LIBRARY_LOANS.map((loan) => (
            <LibraryLoanRow key={loan.id} loan={loan} />
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.xl }}>
          {LIBRARY_QUICK_ACTIONS.map((action) => (
            <LibraryQuickActionCard key={action.id} action={action} />
          ))}
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: theme.spacing.md,
          }}
        >
          <Text variant="heading3" style={{ fontSize: 22, lineHeight: 26 }}>
            For {CURATED_COURSE}
          </Text>
          <Text
            variant="caption"
            color="brand"
            style={{ fontWeight: '700', letterSpacing: 0.4, flexShrink: 1, textAlign: 'right', marginLeft: 8 }}
          >
            {CURATED_BY}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CURATED_BOOKS.map((book) => (
            <LibraryCuratedBook key={book.id} book={book} />
          ))}
        </ScrollView>
      </ScrollView>
    </Screen>
  );
}
