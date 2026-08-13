import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import { Text } from '@/components/design-system';
import { MaterialSymbol, msSearch } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { useBuildings } from '@/hooks/useBuildings';
import { useServicesSearch } from '@/hooks/useServicesSearch';
import { useTabBarContentPadding } from '@/navigation/tabBarInset';
import { MOCK_WEEK_EVENTS } from '@/components/feature/schedule/scheduleMockData';
import { CURATED_BOOKS, LIBRARY_LOANS } from '@/components/feature/library/libraryData';
import { meTheme } from '@/screens/me/meTheme';
import {
  CATEGORY_LABEL,
  groupHits,
  searchBuildings,
  searchCourses,
  searchLibrary,
  searchServices,
} from './globalSearch';

/**
 * The field's liquid glass, with the flat field as the fallback. `isInteractive`
 * so the glass responds to the tap that focuses the input.
 */
function SearchFieldSurface({ children }: { children: React.ReactNode }) {
  const glass = useMemo(() => canUseLiquidGlass(), []);

  if (!glass) {
    return (
      <View style={[styles.field, styles.fieldFallback, { borderColor: meTheme.cardBorder }]}>
        {children}
      </View>
    );
  }

  return (
    <GlassView
      isInteractive
      glassEffectStyle="regular"
      colorScheme="light"
      style={styles.field}
    >
      {children}
    </GlassView>
  );
}

/**
 * Cross-app search: courses, buildings, library and campus services in one
 * list. Everything but services filters local data synchronously, so results
 * land on the keystroke; services come from the cached campus feed.
 */
export function GlobalSearchScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarPadding = useTabBarContentPadding();
  const [query, setQuery] = useState('');

  const { data: buildings } = useBuildings();
  // The services feed is per-campus; SGW carries the bulk of them.
  const { results: services } = useServicesSearch('sgw', query);

  const groups = useMemo(() => {
    if (!query.trim()) return [];
    return groupHits([
      ...searchCourses(MOCK_WEEK_EVENTS, query),
      ...searchBuildings(buildings ?? [], query),
      ...searchLibrary(LIBRARY_LOANS, CURATED_BOOKS, query),
      ...searchServices(services, query),
    ]);
  }, [query, buildings, services]);

  const total = groups.reduce((sum, g) => sum + g.hits.length, 0);
  const searched = query.trim().length > 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.fieldWrap}>
        <SearchFieldSurface>
          <MaterialSymbol icon={msSearch} size={20} color={theme.color.primary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Courses, buildings, books, services"
            placeholderTextColor={meTheme.metaText}
            autoCorrect={false}
            clearButtonMode="while-editing"
            returnKeyType="search"
            accessibilityLabel="Search Concordia"
            style={[styles.input, { color: meTheme.headingText }]}
          />
        </SearchFieldSurface>
      </View>

      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: tabBarPadding + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {!searched ? (
          <Text variant="bodySmall" style={styles.hint}>
            Search across your courses, campus buildings, the library and campus services.
          </Text>
        ) : total === 0 ? (
          <Text variant="bodySmall" style={styles.hint}>
            No matches for “{query.trim()}”.
          </Text>
        ) : (
          groups.map((group) => (
            <View key={group.category} style={styles.group}>
              <Text variant="caption" style={styles.groupLabel}>
                {CATEGORY_LABEL[group.category].toUpperCase()}
              </Text>

              {group.hits.map((hit) => (
                <View key={hit.id} style={[styles.row, { borderColor: meTheme.sheetRowBorder }]}>
                  <View style={styles.rowText}>
                    <Text
                      variant="bodySmall"
                      numberOfLines={1}
                      style={{ fontSize: 15, fontWeight: '600', color: meTheme.headingText }}
                    >
                      {hit.title}
                    </Text>
                    {hit.subtitle ? (
                      <Text
                        variant="caption"
                        numberOfLines={1}
                        style={{ fontSize: 12.5, color: meTheme.metaText, marginTop: 1 }}
                      >
                        {hit.subtitle}
                      </Text>
                    ) : null}
                  </View>

                  {hit.meta ? (
                    <Text
                      variant="caption"
                      style={{ fontSize: 12, color: theme.color.primary, marginLeft: 12 }}
                    >
                      {hit.meta}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: meTheme.pageBackground,
  },
  fieldWrap: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingBottom: 12,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  /** Only applied when liquid glass is unavailable. */
  fieldFallback: {
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: meTheme.cardBackground,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  hint: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 8,
    fontSize: 14,
    color: meTheme.metaText,
  },
  group: {
    paddingTop: 18,
  },
  groupLabel: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: meTheme.labelText,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingVertical: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: meTheme.cardBackground,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
});
