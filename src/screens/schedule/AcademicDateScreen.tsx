import React, { useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { Text } from '@/components/design-system';
import {
  CURTAIN_BLUR_DEPTH,
  CURTAIN_FADE_DEPTH,
  CURTAIN_FADE_IN,
  ScrollCurtain,
} from '@/components/design-system/ScrollCurtain';
import { CardGlass } from '@/components/design-system/GlassSurface';
import { SECTION_HEADING_TEXT } from '@/components/feature/today/TodaySectionHeader';
import { academicsTheme } from '@/screens/academics/academicsTheme';
import { MaterialSymbol, msChevronRight } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { useNow } from '@/hooks';
import { useTabBarContentPadding } from '@/navigation/tabBarInset';
import type { AcademicDateRoutes } from '@/navigation/types';
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
function countdown(
  entry: AcademicDateEntry,
  now: Date,
): { value: string; unit?: string; label: string } {
  const days = daysUntil(entry.date, now);
  const until = `Until ${COUNTDOWN_SUBJECT[entry.category] ?? 'the deadline'}`;

  if (days > 1) return { value: String(days), unit: 'days', label: until };
  if (days === 1) return { value: 'Tomorrow', label: until };
  if (days === 0) return { value: 'Today', label: until };

  // Nothing is counting down any more, so a "time until" heading would lie.
  const end = entry.endDate ? daysUntil(entry.endDate, now) : days;
  if (end >= 0) return { value: 'In progress', label: 'Status' };
  return { value: 'Passed', label: 'Status' };
}

/**
 * What the number is counting down to, phrased to complete "Until ...".
 *
 * The label used to name the event rather than the measurement — a closure
 * read "Campus closed / 7 days", which says the campus is shut for a week
 * when it means Labour Day is a week away. The category is already on the
 * overline and in Details, so this only has to explain the number.
 */
const COUNTDOWN_SUBJECT: Partial<Record<AcademicDateEntry['category'], string>> = {
  closure: 'campus closes',
  exam: 'it starts',
  term: 'it starts',
};

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
export function AcademicDateScreen() {
  /*
    The route rather than screen props: this screen is registered into three
    different stacks, and typing it against any one of them would make it
    unusable from the other two.
  */
  const route = useRoute<RouteProp<AcademicDateRoutes, 'AcademicDate'>>();
  /*
    `push`, not `navigate`. This screen is the focused route, and a stack's
    `navigate` reuses the focused route rather than stacking a second copy —
    following a related date would swap the content out from under you with
    no way back to the date you came from.
  */
  const navigation = useNavigation<{
    push: (screen: 'AcademicDate', params: { id: string }) => void;
  }>();
  const theme = useTheme();
  const now = useNow();

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
    <View style={styles.root}>
      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + 8,
          paddingBottom: tabBarPadding + 24,
        }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
      {/*
        Title first, hero second. The countdown is the more striking block, but
        it only qualifies something you have to already know — which deadline
        this is. Leading with the date meant reading "31 / Today" before
        finding out what was due.
      */}
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

      {/* Hero — the date, and how long you have. */}
      <View style={styles.block}>
        {/*
          Shadow outside, clip inside: a view that clips its bounds clips its
          own shadow too, so the lift and the glass cannot live on one box.
        */}
        <View style={[styles.heroShadow, { shadowColor: theme.color.primary }]}>
        <View style={styles.hero}>
          <CardGlass radius={PANEL_RADIUS} />
          {/*
            Weekday and month together on top, year underneath. The month
            belonged with the weekday rather than the year: "Mon, Sep" is how
            you say the date, and it leaves the numeral as the only thing at
            that size.
          */}
          <View style={styles.heroDate}>
            <Text variant="caption" style={[styles.dow, { color: theme.color.primary }]}>
              {/*
                Composed, not one `toLocaleDateString` call: asking for
                weekday and month together returns "Sep Mon" — month first and
                no separator.
              */}
              {`${day.toLocaleDateString('en-CA', { weekday: 'short' })}, ` +
                `${day.toLocaleDateString('en-CA', { month: 'short' })}`.toUpperCase()}
            </Text>
            <Text variant="heading1" style={styles.dayNumber}>
              {day.getDate()}
            </Text>
          </View>

          <View style={[styles.heroRule, { backgroundColor: theme.color.border }]} />

          <View style={styles.heroMeta}>
            <Text variant="caption" style={styles.heroLabel}>
              {clock.label}
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
        {/*
          Bare and ruled, matching the course detail page. Boxing key/value
          rows in a glass panel gave the page two competing card treatments,
          and the rules alone carry the structure.
        */}
        <View>
          {details.map((row) => (
            <View key={row.key} style={styles.detailRow}>
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
          <View style={[styles.panel, { borderColor: academicsTheme.cardBorder }]}>
            <CardGlass radius={PANEL_RADIUS} />
            {related.map((other, index) => {
              const otherDay = parseDay(other.date);
              return (
                <Pressable
                  key={other.id}
                  onPress={() => navigation.push('AcademicDate', { id: other.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`${other.title}, ${ACADEMIC_CATEGORY_LABEL[other.category]}`}
                  style={({ pressed }) => [
                    styles.relatedRow,
                    index < related.length - 1 ? styles.relatedRowDivided : null,
                    pressed ? styles.relatedRowPressed : null,
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
                    color={academicsTheme.metaText}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Source. */}
      <View style={styles.block}>
        <View style={[styles.panel, styles.source, { borderColor: academicsTheme.cardBorder }]}>
          <CardGlass radius={PANEL_RADIUS} />
          <Text variant="caption" style={styles.detailKey}>
            SOURCE
          </Text>
          <Text variant="bodySmall" style={styles.sourceValue}>
            Undergraduate academic dates · Office of the Registrar
          </Text>
        </View>
      </View>
      </Animated.ScrollView>

      {/* Above the content, below the bar — drawn only once content scrolls up. */}
      <ScrollCurtain
        color={academicsTheme.pageBackground}
        height={headerHeight + CURTAIN_FADE_DEPTH}
        blurHeight={headerHeight + CURTAIN_BLUR_DEPTH}
        blurred
        opacity={curtainOpacity}
      />
    </View>
  );
}

/**
 * The app's overline, as used by the schedule blocks, the all-day card and
 * the campus cards. This screen had four near-misses of it — 11pt here, 0.2
 * tracking there, one that never uppercased.
 */
/** One radius for every panel on the page, glass and border alike. */
/** Matches the course detail page's ruled key/value rows. */
const DETAIL_DIVIDER = 'rgba(0, 0, 0, 0.12)';

const PANEL_RADIUS = 12;

const OVERLINE = {
  fontSize: 10,
  fontWeight: '700',
  letterSpacing: 0.3,
  textTransform: 'uppercase',
} as const;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: academicsTheme.pageBackground,
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
  heroShadow: {
    borderRadius: PANEL_RADIUS,
    borderCurve: 'continuous',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 2,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: academicsTheme.cardBorder,
    borderRadius: PANEL_RADIUS,
    borderCurve: 'continuous',
    overflow: 'hidden',
    paddingVertical: 20,
    paddingHorizontal: 22,
  },
  heroDate: {
    alignItems: 'center',
  },
  dow: {
    ...OVERLINE,
  },
  /*
    Deliberately the same size and leading as `count` opposite. The two
    columns each run overline-then-value, so matching them lets both rows
    align rather than only the overlines — the numeral was 44 against the
    countdown's 34, which pushed the second row out of step.
  */
  dayNumber: {
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '600',
    letterSpacing: -1.4,
    color: academicsTheme.headingText,
    marginTop: 6,
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
    ...OVERLINE,
    color: academicsTheme.metaText,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    /* Matches `dayNumber.marginTop` so both value rows start together. */
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
    color: academicsTheme.metaText,
  },
  heroSub: {
    fontSize: 12,
    lineHeight: 16,
    color: academicsTheme.metaText,
    marginTop: 6,
  },
  eyebrow: {
    ...OVERLINE,
  },
  title: {
    color: academicsTheme.headingText,
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
    ...OVERLINE,
    color: '#FFFFFF',
    opacity: 0.75,
  },
  affectsBody: {
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    marginTop: 6,
  },
  sectionHeading: {
    ...SECTION_HEADING_TEXT,
    color: academicsTheme.headingText,
    marginBottom: 10,
  },
  panel: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: PANEL_RADIUS,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    /*
      Under every row including the last — a ruled list, not separators. The
      same weight the course detail page uses: with no card around them these
      rules are the only structure, so a 6% hairline all but disappears.
    */
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DETAIL_DIVIDER,
  },
  detailKey: {
    width: 84,
    fontSize: 12,
    lineHeight: 20,
    color: academicsTheme.metaText,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: academicsTheme.headingText,
  },
  /*
    Separators, not a ruled list: these rows sit inside a card whose edge does
    part of the separating, so this stays the lighter card hairline rather
    than the heavier `DETAIL_DIVIDER` used on the bare rows above.
  */
  relatedRowDivided: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: academicsTheme.cardBorder,
  },
  relatedRowPressed: {
    opacity: 0.55,
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
    color: academicsTheme.headingText,
  },
  relatedMonth: {
    fontSize: 12,
    color: academicsTheme.metaText,
    marginTop: 2,
  },
  relatedText: {
    flex: 1,
    minWidth: 0,
  },
  relatedKind: {
    ...OVERLINE,
    color: academicsTheme.metaText,
  },
  relatedTitle: {
    fontSize: 14,
    lineHeight: 19,
    color: academicsTheme.headingText,
    marginTop: 3,
  },
  source: {
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  sourceValue: {
    fontSize: 14,
    color: academicsTheme.headingText,
    marginTop: 3,
  },
});
