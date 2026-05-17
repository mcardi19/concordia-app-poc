import React from 'react';
import { ScrollView, View } from 'react-native';
import { Screen, Text } from '@/components/design-system';
import { useCardSurface, useTheme } from '@/design-system/theme';
import { todayTheme } from '@/screens/today/todayTheme';

const LOANS = [
  {
    id: '1',
    tag: 'Due tomorrow',
    title: '"The Waves" by Virginia Woolf',
    subtitle: 'Bellamy Library · Renew online',
  },
  {
    id: '2',
    tag: 'Due Apr 24',
    title: 'Research Methods in Psychology',
    subtitle: 'Webster Library · 1 renewal left',
  },
];

export function LibraryScreen() {
  const theme = useTheme();
  const loansCardStyle = useCardSurface('none', { paddingHorizontal: theme.spacing.md });

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xl }}>
        <Text
          variant="heading1"
          color="brand"
          style={{ fontSize: 32, marginTop: theme.spacing.sm, marginBottom: 8 }}
        >
          Library
        </Text>
        <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
          Loans, holds, and study spaces.
        </Text>

        <Text variant="heading3" style={{ marginBottom: theme.spacing.md }}>
          Your loans
        </Text>
        <View style={loansCardStyle}>
          {LOANS.map((loan, index) => (
            <View
              key={loan.id}
              style={{
                paddingVertical: theme.spacing.md,
                borderBottomWidth: index < LOANS.length - 1 ? 1 : 0,
                borderBottomColor: theme.color.borderSubtle,
              }}
            >
              <Text
                variant="caption"
                style={{ color: todayTheme.labelCaps, fontWeight: '700', marginBottom: 4 }}
              >
                {loan.tag}
              </Text>
              <Text variant="body" style={{ fontWeight: '600', marginBottom: 4 }}>
                {loan.title}
              </Text>
              <Text variant="bodySmall" color="secondary">
                {loan.subtitle}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
