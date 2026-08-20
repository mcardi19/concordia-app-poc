import React, { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarContentPadding } from '@/navigation/tabBarInset';
import { Text } from '@/components/design-system';
import { MeGlassCard } from '@/components/feature/me';
import {
  MaterialSymbol,
  msAssignment,
  msEvent,
  msHowToReg,
  msPayments,
  msScheduleClock,
  msSchool,
  msWbSunny,
  msWorkspacePremium,
} from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import {
  CALENDAR_FILTERS,
  KIND_META,
  ACADEMIC_EVENTS,
  academicMonths,
  isEventToday,
  isPastEvent,
  nextEvent,
  type AcademicEvent,
  type AcademicKind,
} from './academicsData';
import { academicsTheme } from './academicsTheme';
import { useNow } from '@/hooks';
import { academicDayKey, academicTermStatus } from '@/services/academic';
import type { AcademicsStackScreenProps } from '@/navigation/types';

/** "Aug 19 – Aug 22", for entries that occupy more than a day. */
function rangeLabel(event: AcademicEvent): string {
  if (!event.endDate) return '';
  const fmt = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
    });
  };
  return `${fmt(event.date)} – ${fmt(event.endDate)}`;
}

const KIND_ICON: Record<AcademicKind, Parameters<typeof MaterialSymbol>[0]['icon']> = {
  registration: msHowToReg,
  term: msSchool,
  exam: msAssignment,
  deadline: msScheduleClock,
  closure: msWbSunny,
  financial: msPayments,
  graduation: msWorkspacePremium,
};

/**
 * Academic calendar (design artboard 04b). Filter chips over a chronology
 * grouped by month; today's entry is promoted to the top of its month and
 * rendered as the filled brand card.
 *
 * Past entries within the current month are hidden behind a toggle rather
 * than dropped — the design keeps them reachable but out of the way.
 */
export function AcademicCalendarScreen({
  navigation,
}: AcademicsStackScreenProps<'AcademicCalendar'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarPadding = useTabBarContentPadding();

  const [activeFilter, setActiveFilter] = useState('all');
  const [showPast, setShowPast] = useState(false);

  const now = useNow();
  const next = useMemo(() => nextEvent(now), [now]);
  const allMonths = useMemo(() => academicMonths(), []);
  const filterKinds = CALENDAR_FILTERS.find((f) => f.id === activeFilter)?.kinds ?? null;
  const thisMonthKey = academicDayKey(now).slice(0, 7);
  const termStatus = useMemo(() => academicTermStatus(now), [now]);

  const open = useCallback(
    (event: AcademicEvent) => navigation.navigate('AcademicDate', { id: event.id }),
    [navigation],
  );

  const months = useMemo(
    () =>
      allMonths
        .map((month) => {
          const visible = month.events.filter((event) => {
            if (filterKinds && !filterKinds.includes(event.kind)) return false;
            if (!showPast && isPastEvent(event, now)) return false;
            return true;
          });

          // Today first, then next up, then the rest chronologically.
          const rank = (event: AcademicEvent) => {
            if (isEventToday(event, now)) return 0;
            if (next && event.id === next.id) return 1;
            return isPastEvent(event, now) ? 3 : 2;
          };

          const ordered =
            month.key === thisMonthKey
              ? [...visible].sort(
                  (a, b) => rank(a) - rank(b) || Number(a.day) - Number(b.day),
                )
              : visible;

          return { ...month, events: ordered };
        })
        .filter((m) => m.events.length > 0),
    [allMonths, filterKinds, showPast, next, now, thisMonthKey],
  );

  const hiddenPastCount = useMemo(
    () => ACADEMIC_EVENTS.filter((event) => isPastEvent(event, now)).length,
    [now],
  );

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: tabBarPadding + 24 }}
      >
        {/* Term masthead */}
        <LinearGradient
          colors={[theme.color.primary, academicsTheme.heroGradientEnd]}
          style={[styles.hero, { paddingTop: insets.top + 18 }]}
        >
          <Text
            variant="heading2"
            style={{ fontSize: 27, lineHeight: 30, color: '#FFFFFF' }}
          >
            {termStatus.label}
          </Text>
          <View style={styles.heroMetaRow}>
            {termStatus.week ? (
              <View style={styles.heroPill}>
                <Text variant="caption" style={{ fontSize: 10.5, fontWeight: '700', color: '#FFFFFF' }}>
                  Week {termStatus.week.current} of {termStatus.week.total}
                </Text>
              </View>
            ) : null}
            <Text
              variant="caption"
              style={{ fontSize: 12.5, fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}
            >
              {termStatus.phase}
            </Text>
          </View>
        </LinearGradient>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {CALENDAR_FILTERS.map((filter) => {
            const on = filter.id === activeFilter;
            return (
              <Pressable
                key={filter.id}
                onPress={() => setActiveFilter(filter.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${filter.label} filter`}
                style={[
                  styles.filterChip,
                  on
                    ? { backgroundColor: theme.color.primary, borderColor: theme.color.primary }
                    : { backgroundColor: academicsTheme.filterIdle, borderColor: academicsTheme.filterBorder },
                ]}
              >
                <Text
                  variant="caption"
                  style={{
                    fontSize: 12.5,
                    fontWeight: '600',
                    color: on ? '#FFFFFF' : '#1A1A1C',
                  }}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {months.map((month) => (
          <View key={month.month} style={styles.monthSection}>
            <Text
              variant="bodySmall"
              style={{
                fontSize: 17,
                fontWeight: '600',
                letterSpacing: -0.4,
                color: academicsTheme.headingText,
                marginBottom: 10,
              }}
            >
              {month.month}
            </Text>

            <View style={styles.eventList}>
              {month.events.map((event) => {
                const meta = KIND_META[event.kind];
                const today = isEventToday(event, now);
                const past = isPastEvent(event, now);

                if (today) {
                  /*
                    A span in force shows *today's* date, not the day it began
                    — a card labelled "Today" beside the 19th when it is the
                    20th is simply wrong. The range moves into the detail line.
                  */
                  const spanning = Boolean(event.endDate) && event.date !== academicDayKey(now);
                  const heroDay = spanning ? String(now.getDate()) : event.day;
                  const heroDow = spanning
                    ? now.toLocaleDateString('en-CA', { weekday: 'short' })
                    : event.dow;
                  const heroDetail = event.endDate
                    ? [rangeLabel(event), event.detail].filter(Boolean).join(' · ')
                    : event.detail;

                  return (
                    <Pressable
                      key={event.id}
                      onPress={() => open(event)}
                      accessibilityRole="button"
                      accessibilityLabel={`Today, ${meta.label}: ${event.title}`}
                      style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
                    >
                    <LinearGradient
                      colors={[theme.color.primary, academicsTheme.heroGradientEnd]}
                      style={[styles.todayCard, { shadowColor: theme.color.primary }]}
                    >
                      <View style={styles.todayDate}>
                        <Text
                          variant="heading2"
                          style={{ fontSize: 28, lineHeight: 30, fontWeight: '600', letterSpacing: -1, color: '#FFFFFF' }}
                        >
                          {heroDay}
                        </Text>
                        <Text
                          variant="caption"
                          style={{
                            fontSize: 10.5,
                            fontWeight: '700',
                            letterSpacing: 0.6,
                            color: 'rgba(255,255,255,0.82)',
                            marginTop: 4,
                          }}
                        >
                          {heroDow.toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.todayRule} />

                      <View style={styles.todayBody}>
                        <View style={styles.todayTags}>
                          <View style={styles.heroPill}>
                            <Text
                              variant="caption"
                              style={{ fontSize: 10.5, fontWeight: '700', color: '#FFFFFF' }}
                            >
                              Today
                            </Text>
                          </View>
                          <View style={styles.todayKind}>
                            <MaterialSymbol
                              icon={KIND_ICON[event.kind]}
                              size={15}
                              color="rgba(255,255,255,0.88)"
                            />
                            <Text
                              variant="caption"
                              style={{
                                fontSize: 10.5,
                                fontWeight: '700',
                                letterSpacing: 0.5,
                                color: 'rgba(255,255,255,0.88)',
                              }}
                            >
                              {meta.label.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <Text
                          variant="heading3"
                          style={{ fontSize: 20, lineHeight: 24, fontWeight: '600', letterSpacing: -0.4, color: '#FFFFFF' }}
                        >
                          {event.title}
                        </Text>
                        <Text
                          variant="caption"
                          style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.82)', marginTop: 3 }}
                        >
                          {heroDetail}
                        </Text>
                      </View>
                    </LinearGradient>
                    </Pressable>
                  );
                }

                return (
                  <Pressable
                    key={event.id}
                    onPress={() => open(event)}
                    accessibilityRole="button"
                    accessibilityLabel={`${meta.label}: ${event.title}`}
                    style={({ pressed }) => ({ opacity: past ? 0.5 : pressed ? 0.72 : 1 })}
                  >
                  <MeGlassCard contentStyle={styles.eventRow}>
                    <View style={styles.eventDate}>
                      <Text
                        variant="bodySmall"
                        style={{
                          fontSize: 20,
                          lineHeight: 22,
                          fontWeight: '600',
                          letterSpacing: -0.6,
                          color: academicsTheme.headingText,
                        }}
                      >
                        {event.day}
                      </Text>
                      <Text
                        variant="caption"
                        style={{
                          fontSize: 8,
                          fontWeight: '700',
                          letterSpacing: 0.4,
                          color: academicsTheme.mutedText,
                          marginTop: 3,
                        }}
                      >
                        {event.dow.toUpperCase()}
                      </Text>
                    </View>

                    <View style={[styles.eventIcon, { backgroundColor: `${meta.color}14` }]}>
                      <MaterialSymbol icon={KIND_ICON[event.kind]} size={17} color={meta.color} />
                    </View>

                    <View style={styles.eventText}>
                      <Text
                        variant="bodySmall"
                        numberOfLines={1}
                        style={{
                          fontSize: 17,
                          lineHeight: 21,
                          fontWeight: '600',
                          letterSpacing: -0.2,
                          color: academicsTheme.headingText,
                        }}
                      >
                        {event.title}
                      </Text>
                      <Text
                        variant="caption"
                        numberOfLines={1}
                        style={{ fontSize: 12.5, color: academicsTheme.metaText, marginTop: 2 }}
                      >
                        {event.detail}
                      </Text>
                    </View>
                  </MeGlassCard>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {hiddenPastCount > 0 ? (
          <Pressable
            onPress={() => setShowPast((v) => !v)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.pastToggle, { opacity: pressed ? 0.6 : 1 }]}
          >
            <MaterialSymbol icon={msEvent} size={16} color={theme.color.primary} />
            <Text
              variant="caption"
              style={{ fontSize: 12.5, fontWeight: '600', color: theme.color.primary }}
            >
              {showPast ? 'Hide earlier dates' : `Show ${hiddenPastCount} earlier dates`}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: academicsTheme.pageBackground,
  },
  hero: {
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 9,
  },
  heroPill: {
    alignSelf: 'flex-start',
    backgroundColor: academicsTheme.heroPill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  filterRow: {
    gap: 7,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
  },
  monthSection: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 16,
  },
  eventList: {
    gap: 8,
  },
  todayCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
    borderRadius: 8,
    borderCurve: 'continuous',
    paddingHorizontal: 18,
    paddingVertical: 16,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.27, shadowRadius: 26 },
      android: { elevation: 8 },
    }),
  },
  todayDate: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayRule: {
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: academicsTheme.heroPill,
  },
  todayBody: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  todayTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  todayKind: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  eventDate: {
    width: 30,
    alignItems: 'center',
  },
  eventIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventText: {
    flex: 1,
    minWidth: 0,
  },
  pastToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingVertical: 10,
  },
});
