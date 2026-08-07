import React, { useEffect, useState } from 'react';
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
import { useTabBarMinimizeScrollHandler } from '@/navigation/tabBarMinimize';
import { useTabBarScrollInset } from '@/navigation/tabBarInset';
import { fetchLibraryHours, isConcordiaOpenDataConfigured } from '@/api';

function formatLocalDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function LibraryScreen() {
  const theme = useTheme();
  const tabBarInset = useTabBarScrollInset();
  const onTabBarMinimizeScroll = useTabBarMinimizeScrollHandler();
  const [openDataLine, setOpenDataLine] = useState<string | null>(null);
  const [openDataError, setOpenDataError] = useState<string | null>(null);

  useEffect(() => {
    if (!__DEV__) return;

    let cancelled = false;

    async function loadOpenDataSmokeTest() {
      if (!isConcordiaOpenDataConfigured()) {
        if (!cancelled) {
          setOpenDataError(
            'Open Data: add CONCORDIA_OPENDATA_USER and CONCORDIA_OPENDATA_API_KEY to .env, then restart Expo.',
          );
        }
        return;
      }

      const dateIso = formatLocalDateIso(new Date());
      try {
        const rows = await fetchLibraryHours(dateIso);
        if (cancelled) return;
        setOpenDataError(null);
        console.log('[Open Data] library/hours', dateIso, rows);
        const preview = rows
          .slice(0, 2)
          .map((r) => `${r.service}: ${r.text}`)
          .join(' · ');
        setOpenDataLine(
          rows.length ? `Today (${dateIso}): ${rows.length} rows · ${preview}` : 'Empty response from API',
        );
      } catch (e: unknown) {
        if (cancelled) return;
        setOpenDataLine(null);
        setOpenDataError(e instanceof Error ? e.message : 'Open Data request failed');
      }
    }

    void loadOpenDataSmokeTest();
    return () => {
      cancelled = true;
    };
  }, []);

  const loansCardStyle = useCardSurface('none', {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  });

  return (
    <Screen edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarInset }}
        scrollEventThrottle={16}
        onScroll={onTabBarMinimizeScroll}
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

        {__DEV__ ? (
          <View
            style={{
              marginBottom: theme.spacing.md,
              padding: theme.spacing.md,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.color.borderSubtle,
              backgroundColor: theme.color.backgroundSubtle,
            }}
          >
            <Text variant="caption" color="secondary" style={{ fontWeight: '700', marginBottom: 6 }}>
              Open Data (dev check)
            </Text>
            {openDataError ? (
              <Text variant="bodySmall" style={{ color: theme.color.error }}>
                {openDataError}
              </Text>
            ) : openDataLine ? (
              <Text variant="bodySmall" color="secondary">
                {openDataLine}
              </Text>
            ) : (
              <Text variant="bodySmall" color="secondary">
                Loading library hours…
              </Text>
            )}
            <Text variant="caption" color="subtle" style={{ marginTop: 6 }}>
              See Metro / Expo terminal for full JSON log.
            </Text>
          </View>
        ) : null}

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
