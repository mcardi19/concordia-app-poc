import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
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
import { CampusEventCard } from '@/components/feature/today/CampusEventCard';
import { todayShadowSoft } from '@/components/feature/today/todayShadows';
import {
  CAMPUS_TODAY,
  campusEventCostLabel,
  type CampusEventCategory,
  type CampusTodayItem,
} from '@/components/feature/today/todayData';
import {
  MaterialSymbol,
  msExpandMore,
  msSearch,
  msTuneFillSemibold,
  msTuneSemibold,
} from '@/components/icons';
import {
  CampusEventFilterSheet,
  type CostFilter,
  type FormatFilter,
} from './CampusEventFilterSheet';
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

type EventRangeTab = 'upcoming' | 'today' | 'tomorrow' | 'weekend';

const EVENT_RANGE_TABS: { id: EventRangeTab; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'weekend', label: 'Weekend' },
];

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

/** Remaining Saturday/Sunday of this weekend, or the coming one on weekdays. */
function weekendOffsets(today = new Date()): number[] {
  const weekday = today.getDay();
  if (weekday === 6) return [0, 1];
  if (weekday === 0) return [0];
  const saturday = 6 - weekday;
  return [saturday, saturday + 1];
}

function rangeTabForOffset(offset: number, weekend: readonly number[]): EventRangeTab {
  if (offset === 0) return 'today';
  if (offset === 1) return 'tomorrow';
  if (weekend.includes(offset)) return 'weekend';
  return 'upcoming';
}

function eventDayLabel(offset: number, today = new Date()): string {
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  return addDays(today, offset).toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function matchesRange(
  dayOffset: number,
  rangeTab: EventRangeTab,
  selectedOffset: number,
  weekend: readonly number[],
  pinUpcomingDay: boolean,
): boolean {
  if (rangeTab === 'today') return dayOffset === 0;
  if (rangeTab === 'tomorrow') return dayOffset === 1;
  if (rangeTab === 'weekend') return weekend.includes(dayOffset);
  if (pinUpcomingDay) return dayOffset === selectedOffset;
  return dayOffset >= 0;
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
 * Search narrows by title/place, the filter sheet by category/format/cost,
 * range pills by Upcoming / Today / Tomorrow / Weekend, and the week strip
 * by a specific day.
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
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');
  const [costFilter, setCostFilter] = useState<CostFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [rangeTab, setRangeTab] = useState<EventRangeTab>('upcoming');
  /**
   * Upcoming shows every future event unless a week-strip day that is not
   * Today / Tomorrow / Weekend pinned the list to that single day.
   */
  const [pinUpcomingDay, setPinUpcomingDay] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  /** Month the title shows — the week being looked at, not only the day selected. */
  const [visibleWeek, setVisibleWeek] = useState(() => startOfDay(new Date()));
  /** Month grid open. The title’s chevron is its disclosure control. */
  const [monthExpanded, setMonthExpanded] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(() => new Set());

  const selectedOffset = dayOffsetFromToday(selectedDate);
  const weekend = useMemo(() => weekendOffsets(), []);
  const monthLabel = visibleWeek.toLocaleDateString('en-CA', { month: 'long' });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CAMPUS_TODAY.filter((item) => {
      if (!matchesRange(item.dayOffset, rangeTab, selectedOffset, weekend, pinUpcomingDay)) {
        return false;
      }
      if (filter !== 'all' && item.category !== filter) return false;
      if (formatFilter !== 'all' && item.format !== formatFilter) return false;
      if (costFilter === 'free' && campusEventCostLabel(item.cost) !== 'Free') {
        return false;
      }
      if (costFilter === 'paid' && campusEventCostLabel(item.cost) === 'Free') {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    }).sort((a, b) => a.dayOffset - b.dayOffset);
  }, [costFilter, filter, formatFilter, pinUpcomingDay, query, rangeTab, selectedOffset, weekend]);

  const grouped = useMemo(() => {
    const groups: { offset: number; label: string; items: CampusTodayItem[] }[] = [];
    for (const item of filtered) {
      const last = groups[groups.length - 1];
      if (last && last.offset === item.dayOffset) {
        last.items.push(item);
      } else {
        groups.push({
          offset: item.dayOffset,
          label: eventDayLabel(item.dayOffset),
          items: [item],
        });
      }
    }
    return groups;
  }, [filtered]);

  const showDayHeaders = grouped.length > 1;

  const onSelectDate = useCallback((date: Date) => {
    const day = startOfDay(date);
    setSelectedDate(day);
    setVisibleWeek(day);
    const tab = rangeTabForOffset(dayOffsetFromToday(day), weekendOffsets());
    setRangeTab(tab);
    setPinUpcomingDay(tab === 'upcoming');
  }, []);

  const onSelectRange = useCallback((tab: EventRangeTab) => {
    setRangeTab(tab);
    setPinUpcomingDay(false);
    const today = startOfDay(new Date());
    if (tab === 'today') {
      setSelectedDate(today);
      setVisibleWeek(today);
    } else if (tab === 'tomorrow') {
      const next = addDays(today, 1);
      setSelectedDate(next);
      setVisibleWeek(next);
    } else if (tab === 'weekend') {
      const [weekendStart] = weekendOffsets();
      const next = addDays(today, weekendStart ?? 0);
      setSelectedDate(next);
      setVisibleWeek(next);
    }
  }, []);

  const filtersActive =
    filter !== 'all' || formatFilter !== 'all' || costFilter !== 'all';
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
        {/* Search + filters */}
        <View style={styles.searchPad}>
          <View style={styles.searchRow}>
            <View
              style={[
                styles.searchField,
                todayShadowSoft,
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
            <Pressable
              onPress={() => setFilterOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Filters"
              accessibilityState={{ selected: filtersActive }}
              style={({ pressed }) => [
                styles.filterButton,
                todayShadowSoft,
                filtersActive
                  ? {
                      backgroundColor: theme.color.primary,
                      borderColor: theme.color.primary,
                    }
                  : {
                      backgroundColor: searchTheme.cardBackground,
                      borderColor: searchTheme.cardBorder,
                    },
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <MaterialSymbol
                icon={msTuneSemibold}
                filled={msTuneFillSemibold}
                active={filtersActive}
                size={24}
                color={filtersActive ? '#FFFFFF' : theme.color.primary}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          directionalLockEnabled
          style={styles.pillsRail}
          contentContainerStyle={styles.pillsRow}
          accessibilityRole="tablist"
          keyboardShouldPersistTaps="handled"
        >
          {EVENT_RANGE_TABS.map((tab) => {
            const on = tab.id === rangeTab;
            return (
              <Pressable
                key={tab.id}
                onPress={() => onSelectRange(tab.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={tab.label}
                style={({ pressed }) => [
                  styles.pill,
                  on
                    ? {
                        backgroundColor: theme.color.primary,
                        borderColor: theme.color.primary,
                      }
                    : {
                        backgroundColor: searchTheme.cardBackground,
                        borderColor: searchTheme.cardBorder,
                      },
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text
                  variant="bodySmall"
                  style={[
                    styles.pillLabel,
                    { color: on ? theme.color.text.inverse : searchTheme.bodyText },
                  ]}
                >
                  {tab.label}
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
            const next = addDays(weekStart, selectedDate.getDay());
            setSelectedDate(next);
            setVisibleWeek(addDays(weekStart, MIDWEEK_OFFSET));
            const tab = rangeTabForOffset(dayOffsetFromToday(next), weekendOffsets());
            setRangeTab(tab);
            setPinUpcomingDay(tab === 'upcoming');
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
            grouped.map((group) => (
              <View key={group.offset} style={styles.dayGroup}>
                {showDayHeaders ? (
                  <Text
                    variant="bodySmall"
                    style={[styles.dayHeader, { color: searchTheme.headingText }]}
                  >
                    {group.label}
                  </Text>
                ) : null}
                <View style={styles.dayCards}>
                  {group.items.map((item) => (
                    <CampusEventCard
                      key={item.id}
                      item={item}
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
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      </Animated.ScrollView>

      {/* Above the content, below the bar — drawn only once content scrolls up. */}
      <CampusEventFilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        category={filter}
        onCategory={setFilter}
        format={formatFilter}
        onFormat={setFormatFilter}
        cost={costFilter}
        onCost={setCostFilter}
        canReset={filtersActive}
        onReset={() => {
          setFilter('all');
          setFormatFilter('all');
          setCostFilter('all');
        }}
      />

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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {},
  searchPad: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingBottom: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    flex: 1,
  },
  filterButton: {
    width: searchFieldHeight,
    height: searchFieldHeight,
    borderRadius: searchFieldHeight / 2,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: searchFieldFontSize,
    paddingVertical: 0,
  },
  pillsRail: {
    flexGrow: 0,
    flexShrink: 0,
  },
  pillsRow: {
    gap: 7,
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 12,
    paddingBottom: 4,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
  },
  pillLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  monthToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 16,
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
    gap: 28,
  },
  dayGroup: {
    gap: 10,
  },
  dayCards: {
    gap: 28,
  },
  dayHeader: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  empty: {
    fontSize: 15,
    lineHeight: 15 * 1.4,
    paddingVertical: 24,
    textAlign: 'center',
  },
});
