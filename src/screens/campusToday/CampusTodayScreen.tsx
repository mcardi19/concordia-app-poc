import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { LinearGradient } from 'expo-linear-gradient';
import Reanimated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '@/components/design-system';
import {
  CURTAIN_BLUR_DEPTH,
  CURTAIN_FADE_DEPTH,
  CURTAIN_FADE_IN,
  ScrollCurtain,
} from '@/components/design-system/ScrollCurtain';
import { ScheduleWeekStrip } from '@/components/feature/schedule';
import {
  CAMPUS_EVENT_FILTERS,
  CAMPUS_TODAY,
  type CampusEventCategory,
  type CampusTodayItem,
} from '@/components/feature/today/todayData';
import {
  MaterialSymbol,
  msCalendarAddOnFillSemibold,
  msCalendarAddOnSemibold,
  msExpandMore,
  msLocationOn,
  msScheduleClock,
  msSearch,
} from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import {
  searchFieldFontSize,
  searchFieldHeight,
  semanticSpacing,
} from '@/design-system/tokens';
import { useTabBarContentPadding } from '@/navigation/tabBarInset';
import type { TodayStackScreenProps } from '@/navigation/types';
import { searchTheme } from '@/screens/search/searchTheme';
import { useTodayTheme } from '@/screens/today/todayTheme';

type Props = TodayStackScreenProps<'CampusToday'>;

type FilterId = CampusEventCategory | 'all';

const MONTH_OUT_MS = 110;
const MONTH_IN_SPRING = { damping: 18, stiffness: 220, mass: 0.7 } as const;
const MONTH_RISE = 5;
/** Body-small step down from Schedule’s 26pt month title. */
const MONTH_TITLE_SIZE = 15;
const MONTH_TITLE_LINE = 20;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayOffsetFromToday(date: Date, today = new Date()): number {
  const ms = startOfDay(date).getTime() - startOfDay(today).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Midweek day used to title a week that straddles a month boundary. */
const MIDWEEK_OFFSET = 3;

/**
 * Month label that swaps rather than cuts when you page the week strip —
 * same motion as Schedule, at body-small size.
 */
function MonthTitle({ month, color }: { month: string; color: string }) {
  const [shown, setShown] = useState(month);
  const progress = useSharedValue(1);

  useEffect(() => {
    if (month === shown) return;
    progress.value = withTiming(0, { duration: MONTH_OUT_MS }, (finished) => {
      if (!finished) return;
      runOnJS(setShown)(month);
      progress.value = withSpring(1, MONTH_IN_SPRING);
    });
  }, [month, shown, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * MONTH_RISE }],
  }));

  return (
    <Reanimated.View style={style}>
      <Text
        variant="bodySmall"
        style={{
          fontSize: MONTH_TITLE_SIZE,
          lineHeight: MONTH_TITLE_LINE,
          fontWeight: '600',
          color,
        }}
      >
        {shown}
      </Text>
    </Reanimated.View>
  );
}

/**
 * Campus Events — the page behind Home’s “Campus events” section.
 *
 * Search narrows by title/place, chips by category, and the week strip by day.
 * Mock events carry a `dayOffset` until a real calendar feed lands.
 */
export function CampusTodayScreen({}: Props) {
  const theme = useTheme();
  const todayTheme = useTodayTheme();
  const tabBarPadding = useTabBarContentPadding();

  /* Transparent bar, so the curtain is what keeps content legible under it. */
  const headerHeight = useHeaderHeight();
  const scrollY = useRef(new Animated.Value(0)).current;
  const curtainOpacity = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [...CURTAIN_FADE_IN, 9999],
        outputRange: [0, 1, 1],
        extrapolate: 'clamp',
      }),
    [scrollY],
  );

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  /** Month the title shows — the week being looked at, not only the day selected. */
  const [visibleWeek, setVisibleWeek] = useState(() => startOfDay(new Date()));
  /** Month grid open. The title’s chevron is its disclosure control. */
  const [monthExpanded, setMonthExpanded] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(() => new Set());

  const selectedOffset = dayOffsetFromToday(selectedDate);
  const monthLabel = visibleWeek.toLocaleDateString('en-CA', { month: 'long' });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CAMPUS_TODAY.filter((item) => {
      if (item.dayOffset !== selectedOffset) return false;
      if (filter !== 'all' && item.category !== filter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    });
  }, [filter, query, selectedOffset]);

  const onSelectDate = useCallback((date: Date) => {
    const day = startOfDay(date);
    setSelectedDate(day);
    setVisibleWeek(day);
  }, []);

  const radius = theme.radius.lg;
  const countLabel =
    filtered.length === 1 ? '1 event' : `${filtered.length} events`;

  return (
    <View style={[styles.root, { backgroundColor: todayTheme.pageBackground }]}>
      <Animated.ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + 8,
            paddingBottom: tabBarPadding + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
        {/* Search */}
        <View style={styles.searchPad}>
          <View
            style={[
              styles.searchField,
              {
                backgroundColor: searchTheme.cardBackground,
                borderColor: searchTheme.cardBorder,
              },
            ]}
          >
            <MaterialSymbol icon={msSearch} size={22} color={theme.color.primary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search events"
              placeholderTextColor={searchTheme.metaText}
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search campus events"
              style={[styles.searchInput, { color: searchTheme.headingText }]}
            />
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRail}
          contentContainerStyle={styles.chipRow}
          keyboardShouldPersistTaps="handled"
        >
          {CAMPUS_EVENT_FILTERS.map(({ id, label }) => {
            const on = filter === id;
            return (
              <Pressable
                key={id}
                onPress={() => setFilter(id)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={label}
                style={[
                  styles.chip,
                  on
                    ? {
                        backgroundColor: theme.color.primary,
                        borderColor: theme.color.primary,
                      }
                    : {
                        backgroundColor: searchTheme.cardBackground,
                        borderColor: searchTheme.cardBorder,
                      },
                ]}
              >
                <Text
                  variant="bodySmall"
                  style={[
                    styles.chipLabel,
                    { color: on ? theme.color.text.inverse : searchTheme.bodyText },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/*
          Same month disclosure as Schedule: tap the title to expand the week
          strip into a month grid. Sized for a secondary chrome role on this
          page (body-small), not the Schedule masthead.
        */}
        <Pressable
          onPress={() => setMonthExpanded((open) => !open)}
          style={styles.monthToggle}
          accessibilityRole="button"
          accessibilityLabel={`${monthLabel}, ${monthExpanded ? 'hide' : 'show'} month`}
          accessibilityState={{ expanded: monthExpanded }}
        >
          <MonthTitle month={monthLabel} color={searchTheme.headingText} />
          <View style={monthExpanded ? styles.chevronFlipped : undefined}>
            <MaterialSymbol icon={msExpandMore} size={16} color={searchTheme.headingText} />
          </View>
        </Pressable>

        <ScheduleWeekStrip
          selectedDate={selectedDate}
          expanded={monthExpanded}
          onVisibleMonthChange={setVisibleWeek}
          onSelectDate={onSelectDate}
          onVisibleWeekChange={(weekStart) => {
            setSelectedDate((prev) => addDays(weekStart, prev.getDay()));
            setVisibleWeek(addDays(weekStart, MIDWEEK_OFFSET));
          }}
        />

        <Text variant="body" color="subtle" style={styles.count}>
          {countLabel}
        </Text>

        <View style={styles.list}>
          {filtered.length === 0 ? (
            <Text variant="body" color="subtle" style={styles.empty}>
              No events match these filters.
            </Text>
          ) : (
            filtered.map((item) => (
              <EventCard
                key={item.id}
                item={item}
                radius={radius}
                added={addedIds.has(item.id)}
                onToggleAdd={() => {
                  const added = addedIds.has(item.id);
                  Alert.alert(
                    added ? 'On your schedule' : 'Add to schedule?',
                    added
                      ? `Remove “${item.title}” from your schedule?`
                      : `Add “${item.title}” to your schedule?`,
                    [
                      { text: added ? 'Keep' : 'Not now', style: 'cancel' },
                      {
                        text: added ? 'Remove' : 'Add',
                        style: added ? 'destructive' : 'default',
                        onPress: () => {
                          setAddedIds((prev) => {
                            const next = new Set(prev);
                            if (added) next.delete(item.id);
                            else next.add(item.id);
                            return next;
                          });
                        },
                      },
                    ],
                  );
                }}
              />
            ))
          )}
        </View>
      </Animated.ScrollView>

      {/* Above the content, below the bar — drawn only once content scrolls up. */}
      <ScrollCurtain
        color={todayTheme.pageBackground}
        height={headerHeight + CURTAIN_FADE_DEPTH}
        blurHeight={headerHeight + CURTAIN_BLUR_DEPTH}
        blurred
        opacity={curtainOpacity}
      />
    </View>
  );
}

const EVENT_SCRIM_COLORS = [
  'transparent',
  'rgba(0, 0, 0, 0.7)',
  'rgba(0, 0, 0, 1)',
] as const;
const ON_EVENT_SCRIM = '#FFFFFF';

function EventCard({
  item,
  radius,
  added,
  onToggleAdd,
}: {
  item: CampusTodayItem;
  radius: number;
  added: boolean;
  onToggleAdd: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { borderRadius: radius }]}>
      <Image source={item.image} style={styles.image} resizeMode="cover" />
      <LinearGradient
        pointerEvents="none"
        colors={[...EVENT_SCRIM_COLORS]}
        locations={[0.35, 0.68, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.scrim}
      />
      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <View style={styles.copy}>
            <Text
              variant="body"
              numberOfLines={2}
              style={[styles.title, { color: ON_EVENT_SCRIM }]}
            >
              {item.title}
            </Text>
            <View style={styles.metaRow}>
              <MaterialSymbol
                icon={msScheduleClock}
                size={16}
                color={ON_EVENT_SCRIM}
              />
              <Text
                variant="body"
                numberOfLines={1}
                style={[styles.metaTime, { color: ON_EVENT_SCRIM }]}
              >
                {item.time}
              </Text>
              <View style={styles.metaLocationIcon}>
                <MaterialSymbol
                  icon={msLocationOn}
                  size={16}
                  color={ON_EVENT_SCRIM}
                />
              </View>
              <Text
                variant="body"
                numberOfLines={1}
                style={[styles.meta, { color: 'rgba(255, 255, 255, 0.85)' }]}
              >
                {item.location}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={onToggleAdd}
            accessibilityRole="button"
            accessibilityState={{ selected: added }}
            accessibilityLabel={
              added ? 'Remove from schedule' : 'Add to schedule'
            }
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: added
                  ? theme.color.primary
                  : ON_EVENT_SCRIM,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <MaterialSymbol
              icon={msCalendarAddOnSemibold}
              filled={msCalendarAddOnFillSemibold}
              active={added}
              size={20}
              color={added ? ON_EVENT_SCRIM : theme.color.primary}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {},
  searchPad: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
  },
  searchField: {
    height: searchFieldHeight,
    borderRadius: searchFieldHeight / 2,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: searchFieldFontSize,
    paddingVertical: 0,
  },
  chipRail: {
    flexGrow: 0,
    flexShrink: 0,
    marginTop: 4,
  },
  chipRow: {
    gap: 6,
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 12,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  monthToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 10,
    paddingBottom: 2,
  },
  chevronFlipped: {
    transform: [{ rotate: '180deg' }],
  },
  count: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 8,
    fontSize: 14,
    lineHeight: 14 * 1.4,
  },
  list: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 14,
    gap: 12,
  },
  empty: {
    fontSize: 15,
    lineHeight: 15 * 1.4,
    paddingVertical: 24,
    textAlign: 'center',
  },
  card: {
    borderCurve: 'continuous',
    overflow: 'hidden',
    height: 260,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  cardBody: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 22 * 1.2,
    letterSpacing: -0.4,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  metaTime: {
    flexShrink: 0,
    fontSize: 14,
    lineHeight: 14 * 1.35,
  },
  metaLocationIcon: {
    marginLeft: 8,
  },
  meta: {
    flexShrink: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 14 * 1.35,
  },
});
