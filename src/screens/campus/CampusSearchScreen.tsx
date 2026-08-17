import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { GlassView } from 'expo-glass-effect';
import { MIN_TOUCH_TARGET_SIZE } from '@/accessibility';
import { Text } from '@/components/design-system';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import {
  CURTAIN_FADE_DEPTH,
  CURTAIN_FADE_IN,
  ScrollCurtain,
} from '@/components/design-system/ScrollCurtain';
import { PulsingStatusDot } from '@/components/design-system/PulsingStatusDot';
import { SearchSurface } from '@/components/feature/search';
import {
  MaterialSymbol,
  msDirectionsWalk,
  msHistory,
  msNorthEast,
  msSearch,
  msSearchOff,
} from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import {
  searchFieldFontSize,
  searchFieldHeight,
  semanticSpacing,
} from '@/design-system/tokens';
import { useBuildings } from '@/hooks/useBuildings';
import { useCampusUserLocation } from '@/hooks/useCampusUserLocation';
import { useNow } from '@/hooks';
import { useServicesSearch } from '@/hooks/useServicesSearch';
import { useShuttleTracker } from '@/hooks/useShuttleTracker';
import { useTabBarContentPadding } from '@/navigation/tabBarInset';
import { MOCK_WEEK_EVENTS } from '@/components/feature/schedule/scheduleMockData';
import { getDayKey } from '@/components/feature/schedule/scheduleUtils';
import { CURATED_BOOKS, LIBRARY_LOANS } from '@/components/feature/library/libraryData';
import { searchTheme } from '@/screens/search/searchTheme';
import {
  SECTION_ACTION_TEXT,
  SECTION_HEADING_TEXT,
} from '@/components/feature/today/TodaySectionHeader';
import {
  CAMPUS_FILTER_LABEL,
  type CampusMapFilter,
} from '@/services/campus/buildingPresentation';
import type { CampusStackScreenProps } from '@/navigation/types';
import type { BuildingSummary } from '@/types/campus';
import {
  CAMPUS_BROWSE_CHIPS,
  CAMPUS_FAVOURITE_CODES,
  CAMPUS_GROUP_LABEL,
  groupCampusHits,
  searchCampusPlaces,
  searchCampusResources,
  shuttleIcon,
  type CampusSearchHit,
  type Coords,
} from './campusSearch';

type Props = CampusStackScreenProps<'CampusSearch'>;

const CAMPUS_ID = 'sgw';

/** Gap between the field and Cancel. */
const FIELD_ROW_GAP = 10;

/** Matches the map rail's live dot. */
const STATUS_DOT_SIZE = 8;

/** Matched to the Campus map field so the cross-fade lands the bar in place. */
const FIELD_HEIGHT = Math.max(MIN_TOUCH_TARGET_SIZE, searchFieldHeight);

/**
 * How long the map takes to fade into this screen. Read by `CampusStack` as
 * the route's `animationDuration` and by the Cancel reveal below — the two
 * are choreographed against each other, so they share one number.
 */
export const CAMPUS_SEARCH_TRANSITION_MS = 260;

/*
  Cancel starts halfway into the fade rather than before or after it.

  Started with the fade, the slide is over before the page is legible and the
  field simply appears already narrowed. Held until the fade ends, it reads as
  a separate beat tacked on afterwards. Beginning at half means it carries the
  back half of the transition: the map is still resolving as the field gives
  up its width.

  Eased in-out, not out. An ease-out is front-loaded — it would be ~84% done
  at the moment the fade completes, which puts the motion right back behind a
  transparent page. In-out holds most of the travel until the page is up, and
  suits the gesture besides: the bar is reshaping itself, not entering.
*/
const CANCEL_DELAY_MS = Math.round(CAMPUS_SEARCH_TRANSITION_MS * 0.5);
const CANCEL_DURATION_MS = 280;

/** Seeded so the resting state has recents before anything has been searched. */
const SEED_RECENTS = ['Webster Library', 'Hall Building', 'Hive Café'];

/**
 * Campus search.
 *
 * The same search as the app-wide one, opened from the map instead of a
 * header action — so both of its states lead with what is on the map. Resting
 * shows live campus activity (shuttle, next class, saved buildings, map
 * layers) rather than the service directory; typed puts Places above courses
 * and services, and every place hit can be handed straight back to the map.
 */
export function CampusSearchScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const glass = useMemo(() => canUseLiquidGlass(), []);
  // Zero bar height here — the hook knows this screen is pushed.
  const tabBarPadding = useTabBarContentPadding();

  const [query, setQuery] = useState('');
  const [recents, setRecents] = useState(SEED_RECENTS);
  const [coords, setCoords] = useState<Coords | null>(null);

  const { data: buildings } = useBuildings();
  const { results: services, isLoading } = useServicesSearch(CAMPUS_ID, query);
  const shuttle = useShuttleTracker();
  const { getCurrentCoords } = useCampusUserLocation();

  /**
   * Distances are what make place hits campus-first, so location is read once
   * on open rather than per result. Until it lands, places fall back to their
   * street address — the list still works, it just cannot be ordered by walk.
   */
  useEffect(() => {
    let cancelled = false;
    void getCurrentCoords().then((next) => {
      if (!cancelled && next) setCoords(next);
    });
    return () => {
      cancelled = true;
    };
  }, [getCurrentCoords]);

  /*
    The field floats over the list so results scroll under a curtain rather
    than stopping at a hard edge — Home's chrome, applied here. This is the
    height the list has to clear.
  */
  const fieldRowHeight = insets.top + theme.spacing.sm + FIELD_HEIGHT + 12;

  /*
    Scroll-driven, like Home's. A curtain drawn at full strength while nothing
    has scrolled veils the top of the list for no reason — it only has a job
    once content is passing under the chrome.
  */
  const scrollY = useRef(new RNAnimated.Value(0)).current;
  const curtainOpacity = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [...CURTAIN_FADE_IN, 9999],
        outputRange: [0, 1, 1],
        extrapolate: 'clamp',
      }),
    [scrollY],
  );

  const trimmed = query.trim();
  const searched = trimmed.length > 0;

  const hits = useMemo(() => {
    if (!searched) return [];
    return [
      ...searchCampusPlaces(buildings ?? [], trimmed, CAMPUS_ID, coords),
      ...searchCampusResources(
        MOCK_WEEK_EVENTS,
        LIBRARY_LOANS,
        CURATED_BOOKS,
        services,
        trimmed,
      ),
    ];
  }, [searched, trimmed, buildings, coords, services]);

  const groups = useMemo(() => groupCampusHits(hits), [hits]);

  /*
    Focused once the push has finished, not with `autoFocus`.

    `autoFocus` runs on mount, which under react-native-screens is before the
    screen is in the window hierarchy — iOS refuses first responder to an
    off-screen view, so the keyboard never came up and the field needed a
    second tap. Waiting for `transitionEnd` also puts the keyboard's rise
    after the cross-fade instead of fighting it.
  */
  const inputRef = useRef<TextInput>(null);

  useEffect(
    () =>
      navigation.addListener('transitionEnd', (event) => {
        if (!event.data.closing) inputRef.current?.focus();
      }),
    [navigation],
  );

  /*
    Cancel slides in from behind the right edge, so the field arrives exactly
    where the map left it and only then gives up the width. Driven by a
    negative margin rather than an animated width: at width 0 the button has
    no room to lay out, so its natural width could never be measured. Both
    values are shared values, never state — a render between the tap and the
    first frame is what makes this stutter.
  */
  const cancelProgress = useSharedValue(0);
  const cancelWidth = useSharedValue(0);

  useEffect(() => {
    cancelProgress.value = withDelay(
      CANCEL_DELAY_MS,
      withTiming(1, {
        duration: CANCEL_DURATION_MS,
        easing: Easing.inOut(Easing.cubic),
      }),
    );
  }, [cancelProgress]);

  const cancelStyle = useAnimatedStyle(() => ({
    // The row's gap is pulled back too, or the field stays a gap short of the
    // map field's width for the first frames.
    marginRight: -(cancelWidth.value + FIELD_ROW_GAP) * (1 - cancelProgress.value),
    opacity: cancelProgress.value,
  }));

  const remember = useCallback((label: string) => {
    setRecents((prev) => [label, ...prev.filter((r) => r !== label)].slice(0, 4));
  }, []);

  const clearRecents = useCallback(() => setRecents([]), []);

  /**
   * Both ways out of this screen land on the map, which is the point of
   * opening search from Campus — a place hit takes its building with it, a
   * category chip takes its filter and label, and Cancel just goes back.
   *
   * `popTo`, not `navigate`. Under React Navigation 7 `navigate` no longer
   * returns to a screen already in the stack — it pushes another copy, which
   * both slid in from the right instead of fading and left the old map and
   * this screen mounted underneath it.
   */
  const showOnMap = useCallback(
    (building: BuildingSummary) => {
      remember(building.name);
      navigation.popTo('CampusHome', { focusBuildingId: building.id });
    },
    [navigation, remember],
  );

  /**
   * A category is answered on the map, not here: the label goes into the map's
   * field, the layer pins every match, and the drawer lists the same set. A
   * flat list on this screen would drop the half of the answer that is where
   * the results are.
   */
  const showLayer = useCallback(
    (filter: CampusMapFilter) => {
      navigation.popTo('CampusHome', {
        mapFilter: filter,
        searchLabel: CAMPUS_FILTER_LABEL[filter],
      });
    },
    [navigation],
  );

  const favourites = useMemo(() => {
    const campus = (buildings ?? []).filter((b) => b.campusId === CAMPUS_ID);
    return CAMPUS_FAVOURITE_CODES.map((code) =>
      campus.find((b) => b.code === code),
    ).filter((b): b is BuildingSummary => b != null);
  }, [buildings]);

  /** The next class still to start today — the same signal the map cards use. */
  const nextClass = useMemo(() => {
    const dayKey = getDayKey(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return MOCK_WEEK_EVENTS.filter(
      (event) =>
        event.dayKey === dayKey && event.kind !== 'study' && event.startMinutes > nowMinutes,
    ).sort((a, b) => a.startMinutes - b.startMinutes)[0];
  }, [now]);

  /**
   * A room reads "EV 3.245" — the leading token is the building code, which
   * is what turns the next class into a pin the map can fly to.
   */
  const nextClassBuilding = useMemo(() => {
    const code = nextClass?.room?.split(/[\s.-]/)[0]?.toUpperCase();
    if (!code) return undefined;
    return (buildings ?? []).find(
      (building) => building.campusId === CAMPUS_ID && building.code.toUpperCase() === code,
    );
  }, [nextClass, buildings]);

  const field = (
    <>
      <MaterialSymbol icon={msSearch} size={22} color={theme.color.primary} />
      <TextInput
        ref={inputRef}
        value={query}
        onChangeText={setQuery}
        placeholder="Search campus"
        placeholderTextColor={searchTheme.metaText}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        returnKeyType="search"
        accessibilityLabel="Search campus"
        style={[styles.input, { color: searchTheme.headingText }]}
      />
    </>
  );

  return (
    <View style={styles.root}>
      {/*
        Field + Cancel only. Unlike the app-wide Search screen there is no
        separate back control: this arrives as the map fading into search, so
        Cancel is the way out and the field's own clear button empties the
        query. The field's offset, height and radius track the map's field
        exactly — that is what the cross-fade is hiding behind.
      */}
      <ScrollCurtain
        color={searchTheme.pageBackground}
        height={fieldRowHeight + CURTAIN_FADE_DEPTH}
        blurred
        opacity={curtainOpacity}
      />

      <View style={[styles.fieldWrap, { paddingTop: insets.top + theme.spacing.sm }]}>
        <View style={styles.fieldRow}>
          {glass ? (
            <GlassView
              isInteractive
              glassEffectStyle="regular"
              colorScheme="light"
              style={[
                styles.field,
                { borderRadius: theme.radius.full, borderColor: theme.color.primary },
              ]}
            >
              {field}
            </GlassView>
          ) : (
            <View
              style={[styles.field, styles.fieldFallback, { borderRadius: theme.radius.full }]}
            >
              {field}
            </View>
          )}

          <Animated.View style={cancelStyle}>
            <Pressable
              onPress={() => navigation.goBack()}
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

      <RNAnimated.ScrollView
        onScroll={RNAnimated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: fieldRowHeight,
          paddingBottom: tabBarPadding + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {!searched ? (
          <RestingState
            recents={recents}
            favourites={favourites}
            nextClass={nextClass}
            nextClassBuilding={nextClassBuilding}
            shuttleMinutes={shuttle.sgwMinutes}
            onRunSearch={setQuery}
            onClearRecents={clearRecents}
            onShowLayer={showLayer}
            onShowOnMap={showOnMap}
            onTrackShuttle={() => navigation.navigate('ShuttleTracker')}
          />
        ) : isLoading && hits.length === 0 ? (
          <ResultSkeleton />
        ) : groups.length === 0 ? (
          <NoResults query={trimmed} />
        ) : (
          groups.map((group) => (
            <View key={group.group} style={styles.group}>
              <View style={styles.groupHead}>
                <Text variant="heading3" style={styles.groupLabel}>
                  {CAMPUS_GROUP_LABEL[group.group]}
                </Text>
                <Text variant="caption" style={styles.groupCount}>
                  {group.hits.length}
                </Text>
              </View>
              {group.hits.map((hit, i) => (
                <ResultRow
                  key={hit.id}
                  hit={hit}
                  highlight={trimmed}
                  last={i === group.hits.length - 1}
                  onPress={() =>
                    hit.building ? showOnMap(hit.building) : remember(hit.title)
                  }
                />
              ))}
            </View>
          ))
        )}
      </RNAnimated.ScrollView>
    </View>
  );
}

/**
 * One result. Place hits carry an "On map" tag rather than a chevron — the
 * tag is the promise that tapping goes back to the map with the pin selected,
 * which is what separates them from the rows that merely record a search.
 */
function ResultRow({
  hit,
  highlight,
  last,
  onPress,
}: {
  hit: CampusSearchHit;
  highlight: string;
  last: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        hit.building ? `${hit.title}, ${hit.subtitle}, show on map` : `${hit.title}, ${hit.subtitle}`
      }
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: `${theme.color.primary}14` }]}>
        <MaterialSymbol icon={hit.icon} size={22} color={theme.color.primary} />
      </View>
      <View style={styles.rowText}>
        <Text variant="body" numberOfLines={1} style={styles.rowTitle}>
          {highlighted(hit.title, highlight, theme.color.primary)}
        </Text>
        <Text variant="body" numberOfLines={1} style={styles.rowMeta}>
          {hit.subtitle}
        </Text>
      </View>
      {hit.building ? (
        <View style={[styles.onMap, { backgroundColor: `${theme.color.primary}14` }]}>
          <Text variant="caption" style={[styles.onMapLabel, { color: theme.color.primary }]}>
            On map
          </Text>
        </View>
      ) : (
        <MaterialSymbol icon={msNorthEast} size={18} color={searchTheme.chevron} />
      )}
      {!last ? <View style={styles.rowDivider} /> : null}
    </Pressable>
  );
}

/**
 * Resting state — live campus activity, not the service directory.
 *
 * The order answers "where am I going next?" before "what is Concordia?":
 * map layers, what you looked up last, your buildings, then the two things
 * that are actually moving right now.
 */
function RestingState({
  recents,
  favourites,
  nextClass,
  nextClassBuilding,
  shuttleMinutes,
  onRunSearch,
  onClearRecents,
  onShowLayer,
  onShowOnMap,
  onTrackShuttle,
}: {
  recents: string[];
  favourites: BuildingSummary[];
  nextClass: (typeof MOCK_WEEK_EVENTS)[number] | undefined;
  nextClassBuilding: BuildingSummary | undefined;
  shuttleMinutes: number | null;
  onRunSearch: (q: string) => void;
  onClearRecents: () => void;
  onShowLayer: (filter: CampusMapFilter) => void;
  onShowOnMap: (building: BuildingSummary) => void;
  onTrackShuttle: () => void;
}) {
  const theme = useTheme();

  return (
    <>
      {/*
        Layer chips, not query chips: each one puts a category on the map
        behind this screen rather than typing into the field.
      */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRail}
        keyboardShouldPersistTaps="handled"
      >
        {/*
          Always present, like the map's own rail — the shuttle is a place you
          go whether or not one is departing. Only the countdown and the live
          dot are conditional; outside service hours it is a plain pill to the
          tracker rather than a chip that vanishes on weekends.
        */}
        <Pressable
          onPress={onTrackShuttle}
          accessibilityRole="button"
          accessibilityLabel={
            shuttleMinutes != null
              ? `Shuttle, next departure in ${shuttleMinutes} minutes`
              : 'Shuttle'
          }
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <SearchSurface style={styles.chip} radius={999}>
            {shuttleMinutes != null ? (
              <PulsingStatusDot color={searchTheme.statusOpen} size={STATUS_DOT_SIZE} />
            ) : (
              <MaterialSymbol
                icon={shuttleIcon}
                size={17}
                color={theme.color.primary}
              />
            )}
            <Text variant="bodySmall" style={styles.chipLabel}>
              {shuttleMinutes != null ? `Shuttle · ${shuttleMinutes} min` : 'Shuttle'}
            </Text>
          </SearchSurface>
        </Pressable>

        {CAMPUS_BROWSE_CHIPS.map((chip) => (
          <Pressable
            key={chip.filter}
            onPress={() => onShowLayer(chip.filter)}
            accessibilityRole="button"
            accessibilityLabel={`Show ${CAMPUS_FILTER_LABEL[chip.filter]} on the map`}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <SearchSurface style={styles.chip} radius={999}>
              <MaterialSymbol icon={chip.icon} size={17} color={theme.color.primary} />
              <Text variant="bodySmall" style={styles.chipLabel}>
                {CAMPUS_FILTER_LABEL[chip.filter]}
              </Text>
            </SearchSurface>
          </Pressable>
        ))}
      </ScrollView>

      {recents.length > 0 ? (
        <View style={styles.section}>
          <SectionHead label="Recent" action="Clear" onActionPress={onClearRecents} />
          {recents.map((recent) => (
            <Pressable
              key={recent}
              onPress={() => onRunSearch(recent)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.recentRow, { opacity: pressed ? 0.6 : 1 }]}
            >
              <MaterialSymbol icon={msHistory} size={22} color={searchTheme.metaText} />
              <Text variant="body" numberOfLines={1} style={styles.recentLabel}>
                {recent}
              </Text>
              <MaterialSymbol icon={msNorthEast} size={18} color={searchTheme.chevron} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {favourites.length > 0 ? (
        <View style={styles.section}>
          <SectionHead label="Favourite locations" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.favouriteRail}
            keyboardShouldPersistTaps="handled"
          >
            {favourites.map((building) => (
              <Pressable
                key={building.id}
                onPress={() => onShowOnMap(building)}
                accessibilityRole="button"
                accessibilityLabel={`${building.name}, show on map`}
                style={({ pressed }) => [styles.favourite, { opacity: pressed ? 0.6 : 1 }]}
              >
                <View
                  style={[styles.favouriteTile, { backgroundColor: `${theme.color.primary}14` }]}
                >
                  <Text
                    variant="heading3"
                    style={[styles.favouriteCode, { color: theme.color.primary }]}
                  >
                    {building.code}
                  </Text>
                </View>
                <Text variant="caption" numberOfLines={1} style={styles.favouriteName}>
                  {building.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {(nextClass && nextClassBuilding) || shuttleMinutes != null ? (
        <View style={styles.section}>
          <SectionHead label="Happening now" />
          <View style={styles.activityStack}>
            {/*
              Only shown once the room resolves to a building — the action is
              "put it on the map", so without a pin there is nothing to do.
            */}
            {nextClass && nextClassBuilding ? (
              <ActivityCard
                icon={msDirectionsWalk}
                title={`${nextClass.courseCode} — ${nextClass.room}`}
                meta={nextClass.title}
                action="Show"
                onPress={() => onShowOnMap(nextClassBuilding)}
              />
            ) : null}
            {shuttleMinutes != null ? (
              <ActivityCard
                icon={shuttleIcon}
                title="SGW → Loyola shuttle"
                meta={`Departs in ${shuttleMinutes} min`}
                action="Track"
                onPress={onTrackShuttle}
              />
            ) : null}
          </View>
        </View>
      ) : null}
    </>
  );
}

/** A live campus signal with the one action it is worth taking. */
function ActivityCard({
  icon,
  title,
  meta,
  action,
  onPress,
}: {
  icon: typeof shuttleIcon;
  title: string;
  meta: string;
  action: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${meta}. ${action}`}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
    >
      <SearchSurface style={styles.activityCard}>
        <View style={[styles.activityIcon, { backgroundColor: `${theme.color.primary}14` }]}>
          <MaterialSymbol icon={icon} size={22} color={theme.color.primary} />
        </View>
        <View style={styles.rowText}>
          <Text variant="body" numberOfLines={1} style={styles.activityTitle}>
            {title}
          </Text>
          <Text variant="body" numberOfLines={1} style={styles.rowMeta}>
            {meta}
          </Text>
        </View>
        <View style={[styles.activityAction, { backgroundColor: theme.color.primary }]}>
          <Text variant="caption" style={styles.activityActionLabel}>
            {action}
          </Text>
        </View>
      </SearchSurface>
    </Pressable>
  );
}

function SectionHead({
  label,
  action,
  onActionPress,
}: {
  label: string;
  action?: string;
  onActionPress?: () => void;
}) {
  return (
    <View style={styles.sectionHead}>
      <Text variant="heading3" style={styles.sectionLabel}>
        {label}
      </Text>
      {action ? (
        <Pressable onPress={onActionPress} accessibilityRole="button" hitSlop={8}>
          <Text variant="caption" color="brand" style={styles.sectionAction}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <View style={styles.emptyBlock}>
      <View style={styles.emptyIcon}>
        <MaterialSymbol icon={msSearchOff} size={26} color={searchTheme.eyebrowCount} />
      </View>
      <Text variant="heading3" style={styles.emptyTitle}>
        {`Nothing on campus for “${query}”`}
      </Text>
      <Text variant="body" style={styles.emptyBody}>
        Try a building code like H or LB, a course, or a service.
      </Text>
    </View>
  );
}

/** Placeholder rows while the services feed is in flight. */
function ResultSkeleton() {
  return (
    <View style={styles.section}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.row}>
          <View style={styles.skeletonIcon} />
          <View style={styles.rowText}>
            <View style={[styles.skeletonLine, { width: `${70 - i * 8}%` }]} />
            <View
              style={[styles.skeletonLine, styles.skeletonLineSmall, { width: `${40 + i * 5}%` }]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Marks the matched substring so a row shows why it came back. */
function highlighted(title: string, needle: string, tint: string) {
  const at = title.toLowerCase().indexOf(needle.toLowerCase());
  if (!needle || at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <Text style={{ color: tint, fontWeight: '700' }}>
        {title.slice(at, at + needle.length)}
      </Text>
      {title.slice(at + needle.length)}
    </>
  );
}

const FAVOURITE_TILE_SIZE = 68;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: searchTheme.pageBackground,
  },
  /** Floats over the list; the curtain behind it is what hides scrolled rows. */
  fieldWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 11,
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
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: FIELD_HEIGHT,
    // Same capsule, inset and glyph size as the Campus map field it replaces.
    paddingHorizontal: 22,
    borderCurve: 'continuous',
    overflow: 'hidden',
    // Focused for as long as this screen is up, so the brand ring is static.
    borderWidth: 1.5,
  },
  fieldFallback: {
    borderColor: searchTheme.cardBorder,
    backgroundColor: searchTheme.cardBackground,
  },
  input: {
    flex: 1,
    fontSize: searchFieldFontSize,
    padding: 0,
  },
  cancel: {
    paddingLeft: 2,
    justifyContent: 'center',
  },
  cancelLabel: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '600',
    color: '#912238',
  },
  chipRail: {
    gap: 8,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 4,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  chipLabel: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '600',
    color: searchTheme.bodyText,
  },
  section: {
    paddingTop: 22,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: semanticSpacing.screenHorizontal,
    marginBottom: 10,
  },
  sectionLabel: {
    ...SECTION_HEADING_TEXT,
    color: searchTheme.headingText,
  },
  sectionAction: {
    ...SECTION_ACTION_TEXT,
    fontWeight: '600',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingVertical: 13,
  },
  recentLabel: {
    flex: 1,
    fontSize: 16,
    lineHeight: 16 * 1.25,
    fontWeight: '500',
    color: searchTheme.bodyText,
  },
  favouriteRail: {
    gap: 14,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingVertical: 2,
  },
  favourite: {
    width: FAVOURITE_TILE_SIZE,
  },
  favouriteTile: {
    width: FAVOURITE_TILE_SIZE,
    height: FAVOURITE_TILE_SIZE,
    borderRadius: 16,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favouriteCode: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '600',
  },
  favouriteName: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '500',
    color: searchTheme.headingText,
    marginTop: 7,
    textAlign: 'center',
  },
  activityStack: {
    gap: 8,
    paddingHorizontal: semanticSpacing.screenHorizontal,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 13,
    paddingVertical: 13,
  },
  activityIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 16,
    lineHeight: 16 * 1.25,
    fontWeight: '600',
    color: searchTheme.headingText,
  },
  activityAction: {
    borderRadius: 9,
    borderCurve: 'continuous',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activityActionLabel: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  group: {
    paddingTop: 22,
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: semanticSpacing.screenHorizontal,
    marginBottom: 6,
  },
  groupLabel: {
    ...SECTION_HEADING_TEXT,
    color: searchTheme.headingText,
  },
  groupCount: {
    ...SECTION_ACTION_TEXT,
    fontWeight: '700',
    color: searchTheme.eyebrowCount,
  },
  /*
    Rows sit straight on the page rather than inside a grouped card — the
    app-wide search uses cards, and keeping these flat is what makes the two
    result lists read as different surfaces.
  */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingVertical: 14,
  },
  rowDivider: {
    position: 'absolute',
    left: semanticSpacing.screenHorizontal,
    right: semanticSpacing.screenHorizontal,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: searchTheme.rowDivider,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  // Same title/meta scale as Today attention rows and app-wide Search.
  rowTitle: {
    fontSize: 16,
    lineHeight: 16 * 1.25,
    fontWeight: '600',
    color: searchTheme.headingText,
  },
  rowMeta: {
    fontSize: 13.5,
    lineHeight: 13.5 * 1.4,
    color: searchTheme.metaText,
    marginTop: 2,
  },
  onMap: {
    borderRadius: 8,
    borderCurve: 'continuous',
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  onMapLabel: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '600',
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
    ...SECTION_HEADING_TEXT,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: searchTheme.headingText,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 13.5,
    lineHeight: 21,
    color: searchTheme.metaText,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },
  skeletonIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(20,12,16,0.07)',
  },
  skeletonLine: {
    height: 14,
    borderRadius: 6,
    backgroundColor: 'rgba(20,12,16,0.09)',
    marginTop: 4,
  },
  skeletonLineSmall: {
    height: 11,
  },
});
