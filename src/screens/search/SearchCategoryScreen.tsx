import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/design-system';
import { MaterialSymbol, msChevronLeft } from '@/components/icons';
import {
  SERVICE_CATEGORIES,
  SearchResultRow,
  SearchSurface,
} from '@/components/feature/search';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { getCampusServices } from '@/data/buildings';
import type { SearchScreenProps } from '@/navigation/types';
import { categoryIcon } from './globalSearch';
import { searchTheme } from './searchTheme';

type Props = SearchScreenProps<'SearchCategory'>;

/**
 * A service category from the browse rail, opened whole.
 *
 * The campus feed has no category field, so membership is inferred by matching
 * the category's own words against each service's name and building. That is
 * a stopgap: it over-matches on common words and misses anything phrased
 * differently. A real taxonomy on the feed should replace it.
 */
export function SearchCategoryScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const category = useMemo(
    () => SERVICE_CATEGORIES.find((c) => c.key === route.params.categoryKey),
    [route.params.categoryKey],
  );

  /*
    Read the feed directly rather than through `useServicesSearch`: that hook
    truncates an empty query to the first 50 rows, and the category needs to
    match against the whole SGW list.
  */
  const services = useMemo(() => {
    if (!category) return [];
    // Every meaningful word in the label and blurb, since the feed carries no
    // category of its own — short words match too loosely to be useful.
    const terms = `${category.label} ${category.blurb}`
      .toLowerCase()
      .split(/[^a-zà-ÿ0-9]+/)
      .filter((word) => word.length > 3);

    return getCampusServices('sgw').filter((service) => {
      const haystack = `${service.label} ${service.buildingName}`.toLowerCase();
      return terms.some((term) => haystack.includes(term));
    });
  }, [category]);

  if (!category) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
        <Text variant="bodySmall" style={styles.missing}>
          That category is no longer available.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.chromeRow}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
        >
          <SearchSurface style={styles.backButton} radius={18}>
            <MaterialSymbol icon={msChevronLeft} size={20} color={theme.color.primary} />
          </SearchSurface>
        </Pressable>
      </View>

      <ScrollView
        // No tab bar to clear on the search screens — just the home indicator.
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.masthead}>
          <View style={[styles.mastheadIcon, { backgroundColor: `${theme.color.primary}14` }]}>
            <MaterialSymbol icon={category.icon} size={24} color={theme.color.primary} />
          </View>
          <View style={styles.mastheadText}>
            <Text variant="heading3" style={styles.title}>
              {category.label}
            </Text>
            <Text variant="caption" style={styles.subtitle}>
              {category.blurb}
            </Text>
          </View>
        </View>

        {category.key === 'wellbeing' ? (
          <View style={styles.banner}>
            <Text variant="bodySmall" style={styles.bannerText}>
              In crisis right now?{' '}
              <Text style={styles.bannerLink}>Call Campus Safety 514-848-3717</Text> — 24/7.
            </Text>
          </View>
        ) : null}

        {services.length > 0 ? (
          <View style={styles.section}>
            <SearchSurface style={styles.card}>
              {services.map((service, i) => (
                <SearchResultRow
                  key={service.id}
                  title={service.label}
                  subtitle={service.buildingCode
                    ? `${service.buildingCode} · ${service.buildingName}`
                    : service.buildingName}
                  icon={categoryIcon('service')}
                  last={i === services.length - 1}
                />
              ))}
            </SearchSurface>
          </View>
        ) : (
          <View style={styles.section}>
            <SearchSurface style={styles.card}>
              <View style={styles.emptyRow}>
                <Text variant="bodySmall" style={styles.emptyText}>
                  {`No ${category.label.toLowerCase()} services are listed for SGW right now.`}
                </Text>
              </View>
            </SearchSurface>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: searchTheme.pageBackground,
  },
  chromeRow: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingBottom: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masthead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 14,
  },
  mastheadIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mastheadText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '600',
    letterSpacing: -0.4,
    color: searchTheme.headingText,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 16,
    color: searchTheme.metaText,
    marginTop: 3,
  },
  banner: {
    marginTop: 16,
    marginHorizontal: semanticSpacing.screenHorizontal,
    borderRadius: 10,
    borderCurve: 'continuous',
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: 'rgba(145, 34, 56, 0.06)',
  },
  bannerText: {
    fontSize: 13,
    lineHeight: 19,
    color: searchTheme.bodyText,
  },
  bannerLink: {
    fontWeight: '700',
    color: '#912238',
  },
  section: {
    paddingTop: 20,
  },
  card: {
    marginHorizontal: semanticSpacing.screenHorizontal,
  },
  emptyRow: {
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: searchTheme.metaText,
  },
  missing: {
    padding: semanticSpacing.screenHorizontal,
    color: searchTheme.metaText,
  },
});
