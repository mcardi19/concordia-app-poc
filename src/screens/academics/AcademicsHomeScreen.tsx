import React, { useCallback, useMemo } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { setStatusBarStyle } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/design-system';
import { useFacultyProfile, useNow } from '@/hooks';
import { academicTermStatus } from '@/services/academic';
import { MeGlassCard, MeSectionLabel } from '@/components/feature/me';
import { horizontalCarouselProps } from '@/components/feature/today';
import {
  MaterialSymbol,
  msAssignment,
  msBarChart,
  msComputer,
  msMenuBook,
} from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import {
  HEADER_CHROME_HORIZONTAL_INSET,
  HEADER_CHROME_TOP_GAP,
} from '@/navigation/HeaderIconButton';
import { useTabBarContentPadding } from '@/navigation/tabBarInset';
import { useTabBarMinimizeScrollHandler } from '@/navigation/tabBarMinimize';
import type { AcademicsStackScreenProps } from '@/navigation/types';
import {
  ACADEMIC_RESOURCES,
  ACADEMIC_TERM,
  COURSES,
  KIND_META,
  TERM_STATS,
  upcomingDates,
  type AcademicResource,
  type Course,
} from './academicsData';
import { academicsTheme } from './academicsTheme';

type Props = AcademicsStackScreenProps<'AcademicsHome'>;

/*
  Sized against the truncation, not the card count. Registrar titles are long
  — "Last day to apply for DEF or MED notation" — and at 168 the second line
  clipped on most of them. 210 gives the text 174pt across instead of 132, a
  third more, which is the difference between two readable lines and an
  ellipsis.

  That trades the old three-card peek for a two-card one: on a 402pt screen
  with a 16pt inset, card two runs 256–486 and shows about 146 of its 230.
  Still unmistakably "there is more", and a partial card the size of a card
  reads as more deliberate than a 30pt sliver.
*/
const DATE_CARD_WIDTH = 230;
/*
  Lighter than the Me tab's 60% wash on purpose. These cards sit against the
  brand-filled "soonest" card, and liquid glass refracts colour in from its
  edges — thinning the wash is what lets that red bleed across the seam
  instead of being covered by white.
*/
const DATE_CARD_GLASS_TINT = 'rgba(255, 255, 255, 0.3)';
const CAROUSEL_GAP = 10;
const DATE_TITLE_LINE_HEIGHT = 21;
const PROF_AVATAR = 22;

/** First + last initial — "Ulf Hlobil" reads UH. */
function professorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
  }
  return (parts[0]?.[0] ?? '').toUpperCase();
}

/** Headshot from the faculty profile, initials while it loads or if none. */
function ProfessorAvatar({
  name,
  fpid,
}: {
  name: string;
  fpid?: string;
}) {
  const { data: profile } = useFacultyProfile(fpid);
  const photoUrl = profile?.photoUrl;

  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={styles.profAvatar} />;
  }

  return (
    <View style={[styles.profAvatar, styles.profAvatarFallback]}>
      <Text variant="caption" style={styles.profAvatarInitials}>
        {professorInitials(name)}
      </Text>
    </View>
  );
}

const RESOURCE_ICON = {
  moodle: msComputer,
  book: msMenuBook,
  chart: msBarChart,
  exam: msAssignment,
} as const;

/** Grade chip on a course row. Pending courses read grey rather than tinted. */
function GradeChip({ course }: { course: Course }) {
  const pending = course.pct == null;

  return (
    <View
      style={[
        styles.gradeChip,
        pending
          ? { backgroundColor: academicsTheme.pendingFill, borderColor: academicsTheme.pendingBorder }
          : { backgroundColor: `${course.color}1F`, borderColor: `${course.color}33` },
      ]}
    >
      <Text
        variant="bodySmall"
        style={{
          fontSize: 14,
          fontWeight: '600',
          letterSpacing: -0.4,
          color: pending ? academicsTheme.pendingText : course.color,
        }}
      >
        {course.grade}
      </Text>
    </View>
  );
}

function resourceRows(resources: readonly AcademicResource[]) {
  const rows: AcademicResource[][] = [];
  for (let i = 0; i < resources.length; i += 2) {
    rows.push(resources.slice(i, i + 2));
  }
  return rows;
}

/**
 * Academics home. White masthead with the term stats, then the light body:
 * courses, the upcoming-dates carousel, and the resources grid.
 */
export function AcademicsHomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const now = useNow();
  /* The carousel is "what's next from here", so it has to move with the day. */
  const upcoming = useMemo(() => upcomingDates(now, 4), [now]);
  const termStatus = useMemo(() => academicTermStatus(now), [now]);
  const insets = useSafeAreaInsets();
  const tabBarPadding = useTabBarContentPadding();
  const onScroll = useTabBarMinimizeScrollHandler();

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('dark');
      return () => setStatusBarStyle('auto');
    }, []),
  );

  const openResource = (resource: AcademicResource) => {
    if (resource.id === 'grades') {
      navigation.navigate('Grades');
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: tabBarPadding + 24 }}
      >
        {/* Masthead — white wash, black type. */}
        <View style={[styles.hero, { paddingTop: insets.top + HEADER_CHROME_TOP_GAP }]}>
          <View
            pointerEvents="none"
            style={[styles.heroWash, { backgroundColor: academicsTheme.heroBackground }]}
          />

          <Text
            variant="heading2"
            style={{
              fontSize: 27,
              lineHeight: 30,
              color: academicsTheme.headingText,
            }}
          >
            {ACADEMIC_TERM.title}
          </Text>
          <Text
            variant="bodySmall"
            style={{
              fontSize: 17,
              lineHeight: 22,
              color: academicsTheme.heroSubtitle,
              marginTop: 3,
            }}
          >
            {termStatus.label}
          </Text>
          {termStatus.week ||
          (termStatus.phase !== 'Between terms' &&
            termStatus.phase !== 'Before classes begin') ? (
            <Text variant="caption" style={{ fontSize: 12, color: academicsTheme.heroMeta, marginTop: 6 }}>
              {termStatus.week
                ? `Week ${termStatus.week.current} of ${termStatus.week.total} · ${termStatus.phase}`
                : termStatus.phase}
            </Text>
          ) : null}

          <View style={styles.statsRow}>
            {TERM_STATS.map((stat, index) => (
              <React.Fragment key={stat.label}>
                {index > 0 ? <View style={styles.statDivider} /> : null}
                <View style={[styles.stat, { paddingLeft: index === 0 ? 0 : 14 }]}>
                  <Text
                    variant="caption"
                    numberOfLines={1}
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      letterSpacing: 0.2,
                      color: academicsTheme.heroStatLabel,
                      marginBottom: 6,
                    }}
                  >
                    {stat.label}
                  </Text>
                  <Text
                    variant="heading3"
                    numberOfLines={1}
                    style={{
                      fontSize: 24,
                      lineHeight: 26,
                      fontWeight: '600',
                      letterSpacing: -0.6,
                      color: academicsTheme.headingText,
                    }}
                  >
                    {stat.value}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* My courses */}
        <View style={styles.section}>
          <MeSectionLabel>My courses</MeSectionLabel>
          <View style={styles.courseList}>
            {COURSES.map((course) => (
              <MeGlassCard
                key={course.code}
                onPress={() => navigation.navigate('CourseDetail', { eventId: course.eventId })}
                accessibilityLabel={`${course.code}, ${course.title}. Opens course details.`}
                contentStyle={styles.courseRow}
              >
                <View style={styles.courseText}>
                  <Text
                    variant="caption"
                    style={{ fontSize: 11.5, fontWeight: '600', letterSpacing: 0.2, color: academicsTheme.metaText }}
                  >
                    {course.code}
                  </Text>
                  <Text
                    variant="bodySmall"
                    numberOfLines={1}
                    style={{
                      fontSize: 17,
                      lineHeight: 21,
                      fontWeight: '600',
                      letterSpacing: -0.2,
                      color: academicsTheme.headingText,
                      marginTop: 3,
                    }}
                  >
                    {course.title}
                  </Text>
                  <View style={styles.profRow}>
                    <ProfessorAvatar name={course.prof} fpid={course.professorFpid} />
                    <Text
                      variant="caption"
                      numberOfLines={1}
                      style={{ flexShrink: 1, fontSize: 12, color: academicsTheme.metaText }}
                    >
                      Prof. {course.prof}
                    </Text>
                  </View>
                  <Text
                    variant="caption"
                    style={{ fontSize: 12, color: academicsTheme.mutedText, marginTop: 3 }}
                  >
                    {course.pct == null ? 'Grade pending' : `${course.pct}% · current average`}
                  </Text>
                </View>

                <GradeChip course={course} />
              </MeGlassCard>
            ))}
          </View>
        </View>

        {/* Academic calendar — horizontal carousel of the next few dates. */}
        <View style={styles.carouselSection}>
          <View style={{ paddingHorizontal: semanticSpacing.screenHorizontal }}>
            <MeSectionLabel
              action="See all"
              onActionPress={() => navigation.navigate('AcademicCalendar')}
            >
              Academic calendar
            </MeSectionLabel>
          </View>

          <ScrollView
            {...horizontalCarouselProps}
            snapToInterval={DATE_CARD_WIDTH + CAROUSEL_GAP}
            contentContainerStyle={styles.carousel}
          >
            {upcoming.map((date) => {
              const meta = KIND_META[date.kind];
              const soon = date.soon;

              const body = (
                <>
                  <View
                    style={[
                      styles.datePill,
                      { backgroundColor: soon ? academicsTheme.heroPill : 'rgba(0,0,0,0.05)' },
                    ]}
                  >
                    <Text
                      variant="caption"
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: soon ? '#FFFFFF' : academicsTheme.metaText,
                      }}
                    >
                      {meta.label}
                    </Text>
                  </View>

                  <Text
                    variant="caption"
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      letterSpacing: 0.5,
                      color: soon ? 'rgba(255,255,255,0.85)' : academicsTheme.mutedText,
                    }}
                  >
                    {date.dow.toUpperCase()} · {date.monthShort}
                  </Text>
                  <Text
                    variant="heading2"
                    style={{
                      fontSize: 40,
                      lineHeight: 43,
                      fontWeight: '600',
                      letterSpacing: -1.4,
                      marginTop: 4,
                      color: soon ? '#FFFFFF' : academicsTheme.headingText,
                    }}
                  >
                    {date.day}
                  </Text>

                  <View
                    style={[
                      styles.dateRule,
                      { backgroundColor: soon ? academicsTheme.heroPill : 'rgba(0,0,0,0.08)' },
                    ]}
                  />

                  <Text
                    variant="caption"
                    numberOfLines={2}
                    style={{
                      fontSize: 17,
                      fontWeight: '600',
                      lineHeight: DATE_TITLE_LINE_HEIGHT,
                      letterSpacing: -0.2,
                      // Two lines' worth whether the title wraps or not, so the
                      // cards stay a uniform height across the rail.
                      minHeight: DATE_TITLE_LINE_HEIGHT * 2,
                      color: soon ? '#FFFFFF' : academicsTheme.headingText,
                    }}
                  >
                    {date.title}
                  </Text>
                </>
              );

              const open = () => navigation.navigate('AcademicDate', { id: date.id });

              return soon ? (
                <Pressable
                  key={date.id}
                  onPress={open}
                  accessibilityRole="button"
                  accessibilityLabel={`${meta.label}: ${date.title}`}
                  style={({ pressed }) => (pressed ? styles.cardPressed : undefined)}
                >
                  <LinearGradient
                    colors={[theme.color.primary, academicsTheme.heroGradientEnd]}
                    style={[
                      styles.dateCard,
                      styles.dateCardContent,
                      styles.dateCardSoon,
                      { shadowColor: theme.color.primary },
                    ]}
                  >
                    {body}
                  </LinearGradient>
                </Pressable>
              ) : (
                <Pressable
                  key={date.id}
                  onPress={open}
                  accessibilityRole="button"
                  accessibilityLabel={`${meta.label}: ${date.title}`}
                  style={({ pressed }) => (pressed ? styles.cardPressed : undefined)}
                >
                  <MeGlassCard
                    style={styles.dateCard}
                    contentStyle={[styles.dateCardSurface, styles.dateCardContent]}
                    glassTint={DATE_CARD_GLASS_TINT}
                  >
                    {body}
                  </MeGlassCard>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Academic resources */}
        <View style={styles.section}>
          <MeSectionLabel>Academic resources</MeSectionLabel>
          <View style={styles.resourceGrid}>
            {resourceRows(ACADEMIC_RESOURCES).map((row) => (
              <View key={row.map((item) => item.id).join('-')} style={styles.resourceRow}>
                {row.map((resource) => (
                  <MeGlassCard
                    key={resource.id}
                    onPress={() => openResource(resource)}
                    accessibilityLabel={`${resource.label}. ${resource.subtitle}`}
                    style={styles.resourceCard}
                    contentStyle={styles.resourceContent}
                  >
                    <MaterialSymbol
                      icon={RESOURCE_ICON[resource.icon]}
                      size={22}
                      color={theme.color.primary}
                    />
                    <Text
                      variant="bodySmall"
                      style={{
                        fontSize: 17,
                        lineHeight: 21,
                        fontWeight: '600',
                        letterSpacing: -0.2,
                        color: academicsTheme.headingText,
                        marginTop: 8,
                      }}
                    >
                      {resource.label}
                    </Text>
                    <Text
                      variant="caption"
                      style={{
                        fontSize: 12.5,
                        lineHeight: 16,
                        color: academicsTheme.metaText,
                        marginTop: 2,
                      }}
                    >
                      {resource.subtitle}
                    </Text>
                  </MeGlassCard>
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  /** Press feedback for cards that draw their own surface. */
  cardPressed: {
    opacity: 0.72,
  },
  root: {
    flex: 1,
    backgroundColor: academicsTheme.pageBackground,
  },
  hero: {
    paddingHorizontal: HEADER_CHROME_HORIZONTAL_INSET,
    paddingBottom: 22,
    overflow: 'visible',
  },
  heroWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -400,
    bottom: -1,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderTopColor: academicsTheme.heroDivider,
  },
  stat: {
    flex: 1,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: academicsTheme.heroDivider,
  },
  section: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 32,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  courseList: {
    gap: 8,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  courseText: {
    flex: 1,
    minWidth: 0,
  },
  profRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  profAvatar: {
    width: PROF_AVATAR,
    height: PROF_AVATAR,
    borderRadius: PROF_AVATAR / 2,
  },
  profAvatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDEDEF',
  },
  profAvatarInitials: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: academicsTheme.metaText,
  },
  gradeChip: {
    width: 38,
    height: 38,
    borderRadius: 6,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselSection: {
    paddingTop: 32,
  },
  carousel: {
    gap: CAROUSEL_GAP,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingVertical: 4,
    /* Every card takes the tallest card's height rather than hugging content. */
    alignItems: 'stretch',
  },
  dateCard: {
    width: DATE_CARD_WIDTH,
  },
  dateCardSurface: {
    flex: 1,
  },
  dateCardContent: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    alignItems: 'flex-start',
  },
  dateCardSoon: {
    borderRadius: 8,
    borderCurve: 'continuous',
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 18 },
      android: { elevation: 6 },
    }),
  },
  datePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  dateRule: {
    alignSelf: 'stretch',
    height: StyleSheet.hairlineWidth * 2,
    marginTop: 13,
    marginBottom: 12,
  },
  resourceGrid: {
    gap: 8,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  resourceCard: {
    flex: 1,
    alignSelf: 'stretch',
  },
  resourceContent: {
    flexGrow: 1,
    padding: 14,
  },
});
