import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { scheduleTheme } from '@/components/feature/schedule';
import { MaterialSymbol, msChevronRight } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { useNow } from '@/hooks';
import { useTabBarContentPadding } from '@/navigation/tabBarInset';
import type { ScheduleStackScreenProps } from '@/navigation/types';
import {
  ACADEMIC_CATEGORY_LABEL,
  academicDateById,
  academicDayKey,
  relatedAcademicDates,
  type AcademicDateEntry,
} from '@/services/academic';

const MS_PER_DAY = 86_400_000;

function parseDay(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Whole days from today to `iso`, negative once it has passed. */
function daysUntil(iso: string, now: Date): number {
  const today = parseDay(academicDayKey(now)).getTime();
  return Math.round((parseDay(iso).getTime() - today) / MS_PER_DAY);
}

/**
 * How long until it matters, in the words you would actually use. A deadline
 * three weeks out is "21 days"; one tomorrow is "Tomorrow". The number is the
 * point of the card, so it only stays a number while a number is informative.
 */
function countdown(entry: AcademicDateEntry, now: Date): { value: string; unit?: string } {
  const days = daysUntil(entry.date, now);
  if (days > 1) return { value: String(days), unit: days === 1 ? 'day' : 'days' };
  if (days === 1) return { value: 'Tomorrow' };
  if (days === 0) return { value: 'Today' };

  const end = entry.endDate ? daysUntil(entry.endDate, now) : days;
  if (end >= 0) return { value: 'In progress' };
  return { value: 'Passed' };
}

/** "Time until deadline" reads wrong on a holiday. */
function countdownLabel(entry: AcademicDateEntry): string {
  switch (entry.category) {
    case 'closure':
      return 'Campus closed';
    case 'exam':
    case 'term':
      return entry.endDate ? 'Period' : 'Starts';
    default:
      return 'Time until deadline';
  }
}

function formatLong(iso: string): string {
  return parseDay(iso).toLocaleDateString('en-CA', {
    month: 'long',
    year: 'numeric',
  });
}

function formatRange(entry: AcademicDateEntry): string | null {
  if (!entry.endDate) return null;
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const from = parseDay(entry.date).toLocaleDateString('en-CA', opts);
  const to = parseDay(entry.endDate).toLocaleDateString('en-CA', opts);
  return `${from} – ${to}`;
}

const TERM_LABEL: Record<AcademicDateEntry['term'], string> = {
  'summer-2026': 'Summer 2026',
  'fall-2026': 'Fall 2026',
  'winter-2027': 'Winter 2027',
  'summer-2027': 'Summer 2027',
};

/**
 * 04c · Calendar event — one academic date in full.
 *
 * The design's layout: a hero pairing the date with a countdown, the title
 * block, then details, related dates and the source. Everything on it is
 * rendered from the entry rather than written per screen, so the fees frame
 * and the Victoria Day frame are the same component with different data —
 * which is what makes it work for the other ninety-two dates too.
 */
export function AcademicDateScreen({ route }: ScheduleStackScreenProps<'AcademicDate'>) {
  const theme = useTheme();
  const now = useNow();
  const tabBarPadding = useTabBarContentPadding();

  const entry = useMemo(() => academicDateById(route.params.id), [route.params.id]);
  const related = useMemo(() => (entry ? relatedAcademicDates(entry, 3) : []), [entry]);

  if (!entry) {
    return (
      <View style={styles.missing}>
        <Text variant="body" color="secondary">
          That academic date is no longer published.
        </Text>
      </View>
    );
  }

  const day = parseDay(entry.date);
  const clock = countdown(entry, now);
  const range = formatRange(entry);

  const details: { key: string; value: string }[] = [
    { key: 'Category', value: ACADEMIC_CATEGORY_LABEL[entry.category] },
    { key: 'Term', value: TERM_LABEL[entry.term] },
    ...(range ? [{ key: 'Runs', value: range }] : []),
    ...(entry.detail ? [{ key: 'Applies to', value: entry.detail }] : []),
    {
      key: 'Action',
      value: entry.actionable
        ? 'You need to do something by this date'
        : 'For information — nothing to submit',
    },
  ];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: tabBarPadding + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero — the date, and how long you have. */}
      <View style={styles.block}>
        <View style={[styles.hero, { shadowColor: theme.color.primary }]}>
          <View style={styles.heroDate}>
            <Text variant="caption" style={[styles.dow, { color: theme.color.primary }]}>
              {day.toLocaleDateString('en-CA', { weekday: 'short' }).toUpperCase()}
            </Text>
            <Text variant="heading1" style={styles.dayNumber}>
              {day.getDate()}
            </Text>
            <Text variant="caption" style={styles.month}>
              {formatLong(entry.date)}
            </Text>
          </View>

          <View style={[styles.heroRule, { backgroundColor: theme.color.border }]} />

          <View style={styles.heroMeta}>
            <Text variant="caption" style={styles.heroLabel}>
              {countdownLabel(entry)}
            </Text>
            <View style={styles.countRow}>
              <Text variant="heading1" style={[styles.count, { color: theme.color.primary }]}>
                {clock.value}
              </Text>
              {clock.unit ? (
                <Text variant="bodySmall" style={styles.countUnit}>
                  {clock.unit}
                </Text>
              ) : null}
            </View>
            {range ? (
              <Text variant="caption" style={styles.heroSub}>
                {range}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Title block. */}
      <View style={styles.block}>
        <Text variant="caption" style={[styles.eyebrow, { color: theme.color.primary }]}>
          {ACADEMIC_CATEGORY_LABEL[entry.category]}
        </Text>
        <Text variant="heading2" style={styles.title}>
          {entry.title}
        </Text>
        {entry.detail ? (
          <Text variant="body" color="secondary" style={styles.lede}>
            {entry.detail}
          </Text>
        ) : null}
      </View>

      {/*
        The design's "This affects you" card, shown only where the data says
        it does. A closure affects everyone the same way and has no action —
        a brand-filled call to arms over "University closed" would be noise.
      */}
      {entry.actionable ? (
        <View style={styles.block}>
          <View style={[styles.affects, { backgroundColor: theme.color.primary }]}>
            <Text variant="caption" style={styles.affectsLabel}>
              This affects you
            </Text>
            <Text variant="body" style={styles.affectsBody}>
              {clock.value === 'Passed'
                ? 'This deadline has passed. Contact Birks Student Service Centre about a late request.'
                : `Submit through the Student Hub before the end of ${formatRange(entry) ?? day.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}.`}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Details. */}
      <View style={styles.block}>
        <Text variant="heading3" style={styles.sectionHeading}>
          Details
        </Text>
        <View style={[styles.panel, { borderColor: scheduleTheme.cardBorder }]}>
          {details.map((row, index) => (
            <View
              key={row.key}
              style={[
                styles.detailRow,
                index < details.length - 1 ? styles.detailRowDivided : null,
              ]}
            >
              <Text variant="caption" style={styles.detailKey}>
                {row.key}
              </Text>
              <Text variant="bodySmall" style={styles.detailValue}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Related dates. */}
      {related.length > 0 ? (
        <View style={styles.block}>
          <Text variant="heading3" style={styles.sectionHeading}>
            Related dates
          </Text>
          <View style={[styles.panel, { borderColor: scheduleTheme.cardBorder }]}>
            {related.map((other, index) => {
              const otherDay = parseDay(other.date);
              return (
                <View
                  key={other.id}
                  style={[
                    styles.relatedRow,
                    index < related.length - 1 ? styles.detailRowDivided : null,
                  ]}
                >
                  <View style={styles.relatedDate}>
                    <Text variant="body" style={styles.relatedDay}>
                      {otherDay.getDate()}
                    </Text>
                    <Text variant="caption" style={styles.relatedMonth}>
                      {otherDay.toLocaleDateString('en-CA', { month: 'short' })}
                    </Text>
                  </View>
                  <View style={[styles.heroRule, { backgroundColor: theme.color.border }]} />
                  <View style={styles.relatedText}>
                    <Text variant="caption" style={styles.relatedKind}>
                      {ACADEMIC_CATEGORY_LABEL[other.category]}
                    </Text>
                    <Text variant="bodySmall" numberOfLines={2} style={styles.relatedTitle}>
                      {other.title}
                    </Text>
                  </View>
                  <MaterialSymbol
                    icon={msChevronRight}
                    size={16}
                    color={scheduleTheme.metaText}
                  />
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Source. */}
      <View style={styles.block}>
        <View style={[styles.panel, styles.source, { borderColor: scheduleTheme.cardBorder }]}>
          <Text variant="caption" style={styles.detailKey}>
            SOURCE
          </Text>
          <Text variant="bodySmall" style={styles.sourceValue}>
            Undergraduate academic dates · Office of the Registrar
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: scheduleTheme.pageBackground,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: semanticSpacing.screenHorizontal,
  },
  block: {
    paddingHorizontal: semanticSpacing.screenHorizontal + 6,
    paddingTop: 20,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    backgroundColor: scheduleTheme.cardBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: scheduleTheme.cardBorder,
    borderRadius: 8,
    borderCurve: 'continuous',
    paddingVertical: 20,
    paddingHorizontal: 22,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 2,
  },
  heroDate: {
    alignItems: 'center',
  },
  dow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dayNumber: {
    fontSize: 56,
    lineHeight: 56,
    fontWeight: '600',
    letterSpacing: -2,
    color: scheduleTheme.headingText,
    marginTop: 4,
  },
  month: {
    fontSize: 11,
    color: scheduleTheme.metaText,
    marginTop: 4,
  },
  heroRule: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  heroMeta: {
    flex: 1,
    minWidth: 0,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: scheduleTheme.metaText,
    textTransform: 'uppercase',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginTop: 6,
  },
  count: {
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '600',
    letterSpacing: -1.4,
  },
  countUnit: {
    fontSize: 14,
    color: scheduleTheme.metaText,
  },
  heroSub: {
    fontSize: 11,
    lineHeight: 16,
    color: scheduleTheme.metaText,
    marginTop: 6,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    color: scheduleTheme.headingText,
    marginTop: 6,
  },
  lede: {
    marginTop: 8,
    lineHeight: 21,
  },
  affects: {
    borderRadius: 8,
    borderCurve: 'continuous',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  affectsLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: '#FFFFFF',
    opacity: 0.75,
    textTransform: 'uppercase',
  },
  affectsBody: {
    fontSize: 14.5,
    lineHeight: 20,
    color: '#FFFFFF',
    marginTop: 6,
  },
  sectionHeading: {
    color: scheduleTheme.headingText,
    marginBottom: 10,
  },
  panel: {
    backgroundColor: scheduleTheme.cardBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  detailRowDivided: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: scheduleTheme.cardBorder,
  },
  detailKey: {
    width: 84,
    fontSize: 12,
    color: scheduleTheme.metaText,
  },
  detailValue: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: scheduleTheme.headingText,
  },
  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  relatedDate: {
    width: 38,
    alignItems: 'center',
  },
  relatedDay: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.8,
    color: scheduleTheme.headingText,
  },
  relatedMonth: {
    fontSize: 10,
    color: scheduleTheme.metaText,
    marginTop: 2,
  },
  relatedText: {
    flex: 1,
    minWidth: 0,
  },
  relatedKind: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: scheduleTheme.metaText,
    textTransform: 'uppercase',
  },
  relatedTitle: {
    fontSize: 13,
    lineHeight: 17,
    color: scheduleTheme.headingText,
    marginTop: 3,
  },
  source: {
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  sourceValue: {
    fontSize: 13,
    color: scheduleTheme.headingText,
    marginTop: 3,
  },
});
