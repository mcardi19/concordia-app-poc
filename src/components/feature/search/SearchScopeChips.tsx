import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { searchTheme } from '@/screens/search/searchTheme';
import type { SearchCategory } from '@/screens/search/globalSearch';

/** `null` is the "All" scope. */
export type SearchScope = SearchCategory | null;

type Props = {
  scopes: { scope: SearchScope; label: string; count: number }[];
  active: SearchScope;
  onSelect: (scope: SearchScope) => void;
};

/**
 * Scope filter above the results.
 *
 * The design names these All / Services / People / Places / Calendar, but the
 * app has no people or calendar index — these are the categories
 * `globalSearch` actually returns, so a chip can never promise a scope that
 * cannot be searched.
 */
export function SearchScopeChips({ scopes, active, onSelect }: Props) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {scopes.map(({ scope, label, count }) => {
        const on = scope === active;
        return (
          <Pressable
            key={label}
            onPress={() => onSelect(scope)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${label}, ${count} results`}
            style={[
              styles.chip,
              on
                ? { backgroundColor: theme.color.primary, borderColor: theme.color.primary }
                : { backgroundColor: searchTheme.cardBackground, borderColor: searchTheme.cardBorder },
            ]}
          >
            <Text
              variant="bodySmall"
              style={[
                styles.label,
                { color: on ? theme.color.text.inverse : searchTheme.bodyText },
              ]}
            >
              {label}
            </Text>
            <Text
              variant="caption"
              style={[
                styles.count,
                { color: on ? theme.color.text.inverse : searchTheme.metaText },
              ]}
            >
              {count}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 6,
    // Without this the chips stretch to the rail's height instead of hugging
    // their own label.
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 12,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 14,
    // Keep lineHeight above the font's own metrics so descenders in
    // "Buildings" are not clipped.
    lineHeight: 19,
    fontWeight: '600',
  },
  count: {
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: '500',
    opacity: 0.75,
  },
});
