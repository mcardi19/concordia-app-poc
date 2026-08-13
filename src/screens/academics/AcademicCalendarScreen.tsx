import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { useTabBarContentPadding } from '@/navigation/tabBarInset';
import {
  ACADEMIC_MONTHS,
  ACADEMIC_TODAY,
  CALENDAR_FILTERS,
  KIND_META,
  isPastEvent,
  isToday,
  nextEvent,
  type AcademicEvent,
  type AcademicKind,
} from './academicsData';
import { academicsTheme } from './academicsTheme';

const KIND_ICON: Record<AcademicKind, Parameters<typeof MaterialSymbol>[0]['icon']> = {
  registration: msHowToReg,
  classes: msSchool,
  exam: msAssignment,
  deadline: msScheduleClock,
  holiday: msWbSunny,
  fees: msPayments,
  convocation: msWorkspacePremium,
};

/**
 * Academic calendar (design artboard 04b). Filter chips over a chronology
 * grouped by month; today's entry is promoted to the top of its month and
 * rendered as the filled brand card.
 *
 * Past entries within the current month are hidden behind a toggle rather
 * than dropped — the design keeps them reachable but out of the way.
 */
export function AcademicCalendarScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarPadding = useTabBarContentPadding();

  const [activeFilter, setActiveFilter] = useState('all');
  const [showPast, setShowPast] = useState(false);

  const next = useMemo(() => nextEvent(), []);
  const filterKinds = CALENDAR_FILTERS.find((f) => f.id === activeFilter)?.kinds ?? null;

  const months = useMemo(
    () =>
      ACADEMIC_MONTHS.map((month) => {
        const visible = month.events.filter((event) => {
          if (filterKinds && !filterKinds.includes(event.kind)) return false;
          if (!showPast && isPastEvent(month.month, event)) return false;
          return true;
        });

        // Today first, then next up, then the rest chronologically.
        const rank = (event: AcademicEvent) => {
          if (isToday(month.month, event)) return 0;
          if (next && month.month === next.month && event.day === next.event.day) return 1;
          return isPastEvent(month.month, event) ? 3 : 2;
        };

        const ordered =
          month.month === ACADEMIC_TODAY.month
            ? [...visible].sort((a, b) => rank(a) - rank(b) || Number(a.day) - Number(b.day))
            : visible;

        return { month: month.month, events: ordered };
      }).filter((m) => m.events.length > 0),
    [filterKinds, showPast, next],
  );

  const hiddenPastCount = ACADEMIC_MONTHS.reduce(
    (sum, m) => sum + m.events.filter((e) => isPastEvent(m.month, e)).length,
    0,
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
            Spring 2026
          </Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroPill}>
              <Text variant="caption" style={{ fontSize: 10.5, fontWeight: '700', color: '#FFFFFF' }}>
                Week 11 of 13
              </Text>
            </View>
            <Text
              variant="caption"
              style={{ fontSize: 12.5, fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}
            >
              Midterm period
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
                const today = isToday(month.month, event);
                const past = isPastEvent(month.month, event);

                if (today) {
                  return (
                    <LinearGradient
                      key={`${month.month}-${event.day}`}
                      colors={[theme.color.primary, academicsTheme.heroGradientEnd]}
                      style={[styles.todayCard, { shadowColor: theme.color.primary }]}
                    >
                      <View style={styles.todayDate}>
                        <Text
                          variant="heading2"
                          style={{ fontSize: 28, lineHeight: 30, fontWeight: '600', letterSpacing: -1, color: '#FFFFFF' }}
                        >
                          {event.day}
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
                          {event.dow.toUpperCase()}
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
                          {event.detail}
                        </Text>
                      </View>
                    </LinearGradient>
                  );
                }

                return (
                  <MeGlassCard
                    key={`${month.month}-${event.day}`}
                    style={past ? { opacity: 0.5 } : undefined}
                    contentStyle={styles.eventRow}
                  >
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
