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
      style={styles.rail}
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

const ROW_PADDING_TOP = 12;
const ROW_PADDING_BOTTOM = 4;
const CHIP_PADDING_VERTICAL = 8;
const CHIP_LABEL_LINE_HEIGHT = 18;

/**
 * The rail's laid-out height, derived from the same numbers the styles use.
 *
 * The search screens pin this row under a floating field, so they need to
 * pad their list by exactly this much — measuring it with `onLayout` would
 * mean a frame of wrong padding every time the row appears.
 */
export const SEARCH_SCOPE_CHIP_ROW_HEIGHT =
  ROW_PADDING_TOP + CHIP_PADDING_VERTICAL * 2 + CHIP_LABEL_LINE_HEIGHT + ROW_PADDING_BOTTOM;

const styles = StyleSheet.create({
  /*
    The rail sits between the field and the results list in a flex column, so
    it inherits `flexShrink: 1` and the list below squeezes it — which crops
    the chips rather than the list, because a horizontal ScrollView clips its
    content instead of scrolling it vertically. Pinning both flex factors
    makes it hug its own height.
  */
  rail: {
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    gap: 6,
    // Without this the chips stretch to the rail's height instead of hugging
    // their own label.
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: ROW_PADDING_TOP,
    paddingBottom: ROW_PADDING_BOTTOM,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: CHIP_PADDING_VERTICAL,
    borderRadius: 8,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 13,
    // Keep lineHeight above the font's own metrics so descenders in
    // "Buildings" are not clipped.
    lineHeight: CHIP_LABEL_LINE_HEIGHT,
    fontWeight: '600',
  },
  count: {
    fontSize: 11.5,
    lineHeight: 18,
    fontWeight: '500',
    opacity: 0.75,
  },
});
