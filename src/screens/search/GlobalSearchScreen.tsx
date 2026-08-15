import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { GlassView } from 'expo-glass-effect';
import { Text } from '@/components/design-system';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import {
  MaterialSymbol,
  msChevronLeft,
  msDirectionsBus,
  msHistory,
  msLocalLibrary,
  msNorthEast,
  msSchool,
  msSearch,
  msSearchOff,
} from '@/components/icons';
import {
  CATEGORY_PAGE_SIZE,
  FALLBACK_SUGGESTIONS,
  QUICK_TASKS,
  SEARCH_NEEDS,
  SERVICE_CATEGORIES,
  SearchNeedRail,
  SearchGroupLabel,
  SearchResultGroup,
  SearchResultRow,
  SearchScopeChips,
  SearchSurface,
  type SearchScope,
} from '@/components/feature/search';
import { useTheme } from '@/design-system/theme';
import { searchFieldHeight, semanticSpacing } from '@/design-system/tokens';
import { useBuildings } from '@/hooks/useBuildings';
import { useServicesSearch } from '@/hooks/useServicesSearch';
import { horizontalCarouselProps } from '@/components/feature/today';
import { MOCK_WEEK_EVENTS } from '@/components/feature/schedule/scheduleMockData';
import { CURATED_BOOKS, LIBRARY_LOANS } from '@/components/feature/library/libraryData';
import type { SearchScreenProps } from '@/navigation/types';
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  categoryIcon,
  groupHits,
  searchBuildings,
  searchCourses,
  searchLibrary,
  searchServices,
  type SearchCategory,
} from './globalSearch';
import { searchTheme } from './searchTheme';

type Props = SearchScreenProps<'Search'>;

/** Gap between the back control, the field, and Cancel. */
const FIELD_ROW_GAP = 10;

/** Page metrics for the Browse-services rail — `snapToInterval` needs both. */
const CATEGORY_PAGE_WIDTH = 300;
const CATEGORY_RAIL_GAP = 12;

/** Seeded so the zero state has something to show before any search is run. */
const SEED_RECENTS = [
  { label: 'Webster Library', icon: msLocalLibrary },
  { label: 'HIST 287', icon: msSchool },
  { label: 'Shuttle schedule', icon: msDirectionsBus },
];

/**
 * Search & discovery.
 *
 * The zero state is a browsable directory rather than an empty box — quick
 * tasks, recents, the service categories, and plain-language needs — so a
 * student who cannot name a service can still reach it. Typing switches the
 * same screen to scoped results.
 */
export function GlobalSearchScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const glass = useMemo(() => canUseLiquidGlass(), []);

  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>(null);
  const [recents, setRecents] = useState(SEED_RECENTS);

  const { data: buildings } = useBuildings();
  // The services feed is per-campus; SGW carries the bulk of them.
  const { results: services, isLoading } = useServicesSearch('sgw', query);

  const trimmed = query.trim();
  const searched = trimmed.length > 0;

  const hits = useMemo(() => {
    if (!searched) return [];
    return [
      ...searchCourses(MOCK_WEEK_EVENTS, trimmed),
      ...searchBuildings(buildings ?? [], trimmed),
      ...searchLibrary(LIBRARY_LOANS, CURATED_BOOKS, trimmed),
      ...searchServices(services, trimmed),
    ];
  }, [searched, trimmed, buildings, services]);

  /** Counts stay whole-result counts so a chip does not report its own filter. */
  const counts = useMemo(() => {
    const byCategory = {} as Record<SearchCategory, number>;
    for (const category of CATEGORY_ORDER) byCategory[category] = 0;
    for (const hit of hits) byCategory[hit.category] += 1;
    return byCategory;
  }, [hits]);

  const scopes = useMemo(
    () => [
      { scope: null as SearchScope, label: 'All', count: hits.length },
      ...CATEGORY_ORDER.filter((c) => counts[c] > 0).map((c) => ({
        scope: c as SearchScope,
        label: CATEGORY_LABEL[c],
        count: counts[c],
      })),
    ],
    [hits.length, counts],
  );

  /**
   * Pulled out whole above the list — but only when one hit is genuinely
   * strongest. Category order is not relevance: taking the first group's
   * first hit labelled a building "best match" for a library query.
   */
  const bestMatch = useMemo(() => {
    if (scope) return undefined;
    let top: { hit: (typeof hits)[number]; score: number } | undefined;
    for (const hit of hits) {
      const score = matchScore(hit.title, trimmed);
      if (!top || score > top.score) top = { hit, score };
    }
    // A bare substring hit is not distinctive enough to promote.
    return top && top.score >= SCORE_WORD_PREFIX ? top.hit : undefined;
  }, [hits, scope, trimmed]);

  const groups = useMemo(() => {
    const scoped = scope ? hits.filter((h) => h.category === scope) : hits;
    // Never repeat the promoted hit as a row directly beneath itself.
    return groupHits(scoped.filter((h) => h.id !== bestMatch?.id));
  }, [hits, scope, bestMatch]);

  /*
    Cancel slides in from behind the right edge and the field gives up the
    width, the way the platform search field behaves.

    Driven by a negative margin rather than an animated width: at width 0 the
    button would have no room to lay out, so its natural width could never be
    measured. This way it always lays out in full and is simply pulled out of
    the row (and clipped) while hidden.

    Everything the animation needs is a shared value or a ref, and it is
    started straight from the focus handlers. Routing it through state and an
    effect instead put a full re-render of this screen — the whole zero state,
    every glass surface in it — between the tap and the first frame, which is
    what made it stutter. Measuring into a shared value rather than state
    keeps the layout pass from forcing a second one.
  */
  const cancelProgress = useSharedValue(0);
  const cancelWidth = useSharedValue(0);
  const focusedRef = useRef(false);
  const queryRef = useRef('');

  const revealCancel = useCallback(
    (next: boolean) => {
      cancelProgress.value = withTiming(next ? 1 : 0, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
    },
    [cancelProgress],
  );

  /** Query lives in state (results need it) and a ref (the handlers do). */
  const updateQuery = useCallback((next: string) => {
    queryRef.current = next;
    setQuery(next);
  }, []);

  const runSearch = useCallback(
    (next: string) => {
      updateQuery(next);
      setScope(null);
      // Reached without focusing the field — tapping a task or a recent.
      revealCancel(next.length > 0);
    },
    [updateQuery, revealCancel],
  );

  /* Stable, so `ZeroState`'s memo actually holds. */
  const clearRecents = useCallback(() => setRecents([]), []);
  const openCategory = useCallback(
    (key: string) => navigation.navigate('SearchCategory', { categoryKey: key }),
    [navigation],
  );

  const remember = useCallback((label: string, icon: typeof msSearch) => {
    setRecents((prev) => [
      { label, icon },
      ...prev.filter((r) => r.label !== label),
    ].slice(0, 4));
  }, []);

  /**
   * Focus is the trigger, not typing — the way out should be there the moment
   * the field is live. On blur it stays up while there is still a query to
   * clear, since scrolling the results dismisses the keyboard.
   */
  const onFieldFocus = useCallback(() => {
    focusedRef.current = true;
    revealCancel(true);
  }, [revealCancel]);

  const onFieldBlur = useCallback(() => {
    focusedRef.current = false;
    revealCancel(queryRef.current.length > 0);
  }, [revealCancel]);

  /**
   * Cancel replaces the field's own clear button, so it does what that did —
   * empties the query — and drops the keyboard with it. Leaving search is the
   * back control's job.
   */
  const cancelSearch = useCallback(() => {
    // Clipped out of the row while hidden, but never trust that for a tap.
    if (cancelProgress.value === 0) return;
    updateQuery('');
    setScope(null);
    Keyboard.dismiss();
    if (!focusedRef.current) revealCancel(false);
  }, [cancelProgress, updateQuery, revealCancel]);

  const cancelStyle = useAnimatedStyle(() => ({
    // The row's gap is pulled back too, or the field stays a gap short of the
    // full width while Cancel is hidden.
    marginRight: -(cancelWidth.value + FIELD_ROW_GAP) * (1 - cancelProgress.value),
    opacity: cancelProgress.value,
  }));

  const field = (
    <>
      <MaterialSymbol icon={msSearch} size={22} color={theme.color.primary} />
      <TextInput
        value={query}
        onChangeText={updateQuery}
        // Short enough to survive the field narrowing when Cancel slides in.
        placeholder="Search Concordia"
        placeholderTextColor={searchTheme.metaText}
        autoCorrect={false}
        onFocus={onFieldFocus}
        onBlur={onFieldBlur}
        returnKeyType="search"
        accessibilityLabel="Search Concordia"
        style={[styles.input, { color: searchTheme.headingText }]}
      />
    </>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      {/*
        Search is pushed by a header action rather than being a tab, and it
        renders with `headerShown: false` so the field keeps the top of the
        screen — this row carries the only visible way back. Matches the back
        control on SearchCategory.
      */}
      <View style={styles.fieldWrap}>
        <View style={styles.fieldRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
          >
            <SearchSurface style={styles.backButton} radius={22}>
              <MaterialSymbol icon={msChevronLeft} size={20} color={theme.color.primary} />
            </SearchSurface>
          </Pressable>

          {glass ? (
            <GlassView
              isInteractive
              glassEffectStyle="regular"
              colorScheme="light"
              style={styles.field}
            >
              {field}
            </GlassView>
          ) : (
            <View style={[styles.field, styles.fieldFallback]}>{field}</View>
          )}

          <Animated.View style={cancelStyle}>
            <Pressable
              onPress={cancelSearch}
              accessibilityRole="button"
              accessibilityLabel="Cancel search"
              hitSlop={6}
              // Into a shared value, not state — this must not cause a render.
              onLayout={(e) => {
                cancelWidth.value = e.nativeEvent.layout.width;
              }}
              style={({ pressed }) => [styles.cancel, { opacity: pressed ? 0.5 : 1 }]}
            >
              <Text variant="bodySmall" numberOfLines={1} style={styles.cancelLabel}>
                Cancel
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>

      {searched ? (
        <SearchScopeChips scopes={scopes} active={scope} onSelect={setScope} />
      ) : null}

      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        // No tab bar to clear on this screen — just the home indicator.
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {!searched ? (
          <ZeroState
            recents={recents}
            onRunSearch={runSearch}
            onClearRecents={clearRecents}
            onOpenCategory={openCategory}
          />
        ) : isLoading ? (
          <ResultSkeleton />
        ) : hits.length === 0 ? (
          <NoResults query={trimmed} onRunSearch={runSearch} />
        ) : (
          <>
            <Text variant="caption" style={styles.summary}>
              {`${hits.length} result${hits.length === 1 ? '' : 's'} for “${trimmed}”`}
            </Text>

            {bestMatch ? (
              <View style={styles.bestMatch}>
                <SearchResultGroup label="Best match" elevated>
                  <SearchResultRow
                    title={bestMatch.title}
                    subtitle={bestMatch.subtitle}
                    icon={categoryIcon(bestMatch.category)}
                    highlight={trimmed}
                    last
                    onPress={() => remember(bestMatch.title, categoryIcon(bestMatch.category))}
                  />
                </SearchResultGroup>
              </View>
            ) : null}

            {groups.map((group) => (
              <SearchResultGroup
                key={group.category}
                label={CATEGORY_LABEL[group.category]}
                count={group.hits.length}
              >
                {group.hits.map((hit, i) => (
                  <SearchResultRow
                    key={hit.id}
                    title={hit.title}
                    subtitle={hit.subtitle}
                    icon={categoryIcon(hit.category)}
                    highlight={trimmed}
                    last={i === group.hits.length - 1}
                    onPress={() => remember(hit.title, categoryIcon(hit.category))}
                  />
                ))}
              </SearchResultGroup>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

/**
 * Browse-first zero state.
 *
 * Memoised: this subtree is a dozen-odd glass surfaces, and without it every
 * keystroke and every focus change rebuilt the lot — enough of a commit to
 * eat the first frames of the Cancel animation.
 */
const ZeroState = React.memo(function ZeroState({
  recents,
  onRunSearch,
  onClearRecents,
  onOpenCategory,
}: {
  recents: { label: string; icon: typeof msSearch }[];
  onRunSearch: (q: string) => void;
  onClearRecents: () => void;
  onOpenCategory: (key: string) => void;
}) {
  const theme = useTheme();

  const pages = useMemo(
    () =>
      Array.from({ length: Math.ceil(SERVICE_CATEGORIES.length / CATEGORY_PAGE_SIZE) }, (_, i) =>
        SERVICE_CATEGORIES.slice(i * CATEGORY_PAGE_SIZE, i * CATEGORY_PAGE_SIZE + CATEGORY_PAGE_SIZE),
      ),
    [],
  );

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.taskRail}
        keyboardShouldPersistTaps="handled"
      >
        {QUICK_TASKS.map((task) => (
          <Pressable
            key={task}
            onPress={() => onRunSearch(task)}
            accessibilityRole="button"
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <SearchSurface style={styles.taskChip} radius={999}>
              <Text variant="caption" style={styles.taskLabel}>
                {task}
              </Text>
            </SearchSurface>
          </Pressable>
        ))}
      </ScrollView>

      {/*
        Straight on the page rather than in a card: these are past queries, not
        results, and a grouped surface gave them the same weight as the service
        categories below. Every row carries the history glyph for the same
        reason — a per-result icon read as a destination.
      */}
      {recents.length > 0 ? (
        <View style={styles.recentBlock}>
          <SearchGroupLabel action="Clear" onActionPress={onClearRecents}>
            Recent
          </SearchGroupLabel>
          {recents.map((recent) => (
            <Pressable
              key={recent.label}
              onPress={() => onRunSearch(recent.label)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.recentRow, { opacity: pressed ? 0.6 : 1 }]}
            >
              <MaterialSymbol icon={msHistory} size={20} color={searchTheme.metaText} />
              <Text variant="bodySmall" style={styles.recentLabel}>
                {recent.label}
              </Text>
              <MaterialSymbol icon={msNorthEast} size={16} color={searchTheme.chevron} />
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <SearchResultGroupLabelRow label="Browse services" />
        <ScrollView
          {...horizontalCarouselProps}
          snapToInterval={CATEGORY_PAGE_WIDTH + CATEGORY_RAIL_GAP}
          contentContainerStyle={styles.categoryRail}
          keyboardShouldPersistTaps="handled"
        >
          {pages.map((page, index) => (
            <SearchSurface key={index} style={styles.categoryPage}>
              {page.map((category, i) => (
                <Pressable
                  key={category.key}
                  onPress={() => onOpenCategory(category.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`${category.label}. ${category.blurb}`}
                  style={({ pressed }) => [
                    styles.categoryRow,
                    i < page.length - 1 ? styles.recentDivider : null,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <View
                    style={[styles.categoryIcon, { backgroundColor: `${theme.color.primary}0E` }]}
                  >
                    <MaterialSymbol icon={category.icon} size={20} color={theme.color.primary} />
                  </View>
                  <View style={styles.categoryText}>
                    <Text variant="bodySmall" style={styles.categoryLabel}>
                      {category.label}
                    </Text>
                    <Text variant="caption" numberOfLines={1} style={styles.categoryBlurb}>
                      {category.blurb}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </SearchSurface>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SearchResultGroupLabelRow label="Not sure where to start?" />
        <SearchNeedRail needs={SEARCH_NEEDS} onSelect={(need) => onRunSearch(need.query)} />
      </View>
    </>
  );
});

/** Nothing matched — offer a correction and a way back to browsing. */
function NoResults({ query, onRunSearch }: { query: string; onRunSearch: (q: string) => void }) {
  const suggestion = nearestSuggestion(query);

  return (
    <>
      <View style={styles.emptyBlock}>
        <View style={styles.emptyIcon}>
          <MaterialSymbol icon={msSearchOff} size={26} color={searchTheme.eyebrowCount} />
        </View>
        <Text variant="heading3" style={styles.emptyTitle}>
          {`No results for “${query}”`}
        </Text>
        <Text variant="bodySmall" style={styles.emptyBody}>
          Check the spelling, or try one of the searches below.
        </Text>
      </View>

      {suggestion ? (
        <Pressable
          onPress={() => onRunSearch(suggestion)}
          accessibilityRole="button"
          style={styles.didYouMean}
        >
          <Text variant="bodySmall" style={styles.didYouMeanText}>
            Did you mean <Text style={styles.didYouMeanTerm}>{suggestion}</Text>?
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.section}>
        <SearchResultGroupLabelRow label="Try searching for" />
        <View style={styles.suggestionWrap}>
          {FALLBACK_SUGGESTIONS.map((s) => (
            <Pressable
              key={s}
              onPress={() => onRunSearch(s)}
              accessibilityRole="button"
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <SearchSurface style={styles.taskChip} radius={999}>
                <Text variant="caption" style={styles.taskLabel}>
                  {s}
                </Text>
              </SearchSurface>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SearchResultGroupLabelRow label="Not sure what it's called? Browse by need" />
        <SearchNeedRail needs={SEARCH_NEEDS} onSelect={(need) => onRunSearch(need.query)} />
      </View>
    </>
  );
}

/** Placeholder rows while the services feed is in flight. */
function ResultSkeleton() {
  return (
    <View style={styles.section}>
      <SearchSurface style={styles.skeletonCard}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.recentRow, i < 2 ? styles.recentDivider : null]}>
            <View style={styles.skeletonIcon} />
            <View style={styles.recentLabelWrap}>
              <View style={[styles.skeletonLine, { width: `${70 - i * 8}%` }]} />
              <View style={[styles.skeletonLine, styles.skeletonLineSmall, { width: `${40 + i * 5}%` }]} />
            </View>
          </View>
        ))}
      </SearchSurface>
    </View>
  );
}

/** Standalone group label, for sections whose body is not a single card. */
function SearchResultGroupLabelRow({ label }: { label: string }) {
  return (
    <Text variant="caption" style={styles.sectionLabel}>
      {label}
    </Text>
  );
}

const SCORE_TITLE_PREFIX = 3;
const SCORE_WORD_PREFIX = 2;
const SCORE_CONTAINS = 1;

/**
 * How well a title answers the query. Prefix beats mid-word so "Lib" ranks
 * "Library" over a building that merely contains the letters.
 */
function matchScore(title: string, query: string): number {
  const t = title.toLowerCase();
  const q = query.toLowerCase();
  if (t.startsWith(q)) return SCORE_TITLE_PREFIX;
  if (t.split(/[^a-z0-9]+/).some((word) => word.startsWith(q))) return SCORE_WORD_PREFIX;
  return t.includes(q) ? SCORE_CONTAINS : 0;
}

/**
 * Cheap did-you-mean: the suggestion sharing the longest prefix with the
 * query. Enough for a typo like "hoausing" → "Off-campus housing" without
 * pulling in an edit-distance dependency.
 */
function nearestSuggestion(query: string): string | null {
  const q = query.toLowerCase();
  let best: { term: string; score: number } | null = null;
  for (const term of FALLBACK_SUGGESTIONS) {
    const t = term.toLowerCase();
    let score = 0;
    for (const word of t.split(/\s+/)) {
      let shared = 0;
      while (shared < word.length && shared < q.length && word[shared] === q[shared]) shared += 1;
      score = Math.max(score, shared);
    }
    if (score >= 3 && (!best || score > best.score)) best = { term, score };
  }
  return best?.term ?? null;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: searchTheme.pageBackground,
  },
  fieldWrap: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingBottom: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: FIELD_ROW_GAP,
    // Clips Cancel while its negative margin holds it past the right edge.
    overflow: 'hidden',
  },
  cancel: {
    paddingLeft: 2,
    justifyContent: 'center',
  },
  cancelLabel: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '600',
    color: '#912238',
  },
  /** Grown with the field so the row still reads as one control group. */
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    // Takes the row's remaining width beside the back control.
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: searchFieldHeight,
    // Same capsule, inset and glyph size as the Campus field.
    paddingHorizontal: 22,
    borderRadius: searchFieldHeight / 2,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  /** Only applied when liquid glass is unavailable. */
  fieldFallback: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: searchTheme.cardBorder,
    backgroundColor: searchTheme.cardBackground,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  summary: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 14,
    fontSize: 12.5,
    lineHeight: 16,
    color: searchTheme.metaText,
  },
  bestMatch: {
    marginBottom: -4,
  },
  section: {
    paddingTop: 24,
  },
  /** Kept in step with `SearchGroupLabel`. */
  sectionLabel: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    marginBottom: 11,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    letterSpacing: 0,
    color: searchTheme.eyebrowText,
  },
  taskRail: {
    gap: 8,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 4,
    paddingBottom: 4,
  },
  taskChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  taskLabel: {
    fontSize: 13.5,
    lineHeight: 17,
    fontWeight: '600',
    color: searchTheme.bodyText,
  },
  recentBlock: {
    paddingTop: 22,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    // Aligned to the page, not inset inside a card.
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingVertical: 11,
  },
  recentDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: searchTheme.rowDivider,
  },
  recentLabel: {
    flex: 1,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '500',
    color: searchTheme.bodyText,
  },
  recentLabelWrap: {
    flex: 1,
    gap: 8,
  },
  categoryRail: {
    gap: CATEGORY_RAIL_GAP,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingVertical: 4,
    alignItems: 'stretch',
  },
  categoryPage: {
    width: CATEGORY_PAGE_WIDTH,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    flex: 1,
    minWidth: 0,
  },
  categoryLabel: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '600',
    color: searchTheme.headingText,
  },
  categoryBlurb: {
    fontSize: 12.5,
    lineHeight: 16,
    color: searchTheme.metaText,
    marginTop: 2,
  },
  emptyBlock: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: searchTheme.cardBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: searchTheme.cardBorder,
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: searchTheme.headingText,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 21,
    color: searchTheme.metaText,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },
  didYouMean: {
    marginTop: 26,
    marginHorizontal: semanticSpacing.screenHorizontal,
    borderRadius: 10,
    borderCurve: 'continuous',
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: 'rgba(145, 34, 56, 0.06)',
  },
  didYouMeanText: {
    fontSize: 14,
    lineHeight: 18,
    color: searchTheme.bodyText,
  },
  didYouMeanTerm: {
    fontWeight: '700',
    color: '#912238',
  },
  suggestionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: semanticSpacing.screenHorizontal,
  },
  skeletonCard: {
    marginHorizontal: semanticSpacing.screenHorizontal,
  },
  skeletonIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(20,12,16,0.07)',
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(20,12,16,0.09)',
  },
  skeletonLineSmall: {
    height: 9,
  },
});
