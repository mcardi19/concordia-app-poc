import React, { useEffect, useMemo, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { MsIconDefinition } from 'material-symbols-react-native';
import { Text } from '@/components/design-system';
import {
  MaterialSymbol,
  msChevronRight,
  msMail,
  msMap,
} from '@/components/icons';
import {
  CARD_BLUR_INTENSITY,
  CARD_GLASS_TINT,
  GlassSurface,
} from '@/components/design-system/GlassSurface';
import { useTheme } from '@/design-system/theme';
import { useCourseDetail, useFacultyProfile, useNow } from '@/hooks';
import { todayShadowSoft } from './todayShadows';
import type { FacultyProfile } from '@/api/facultyProfile';
import type { ScheduleDeliveryMode } from '@/components/feature/schedule/scheduleTypes';
import type { ScheduleEvent } from '@/components/feature/schedule/scheduleTypes';
import { SESSION_COMPONENT_LABEL } from '@/components/feature/schedule/scheduleTypes';
import {
  formatClock,
  getDayKey,
} from '@/components/feature/schedule/scheduleUtils';
import { MOCK_WEEK_EVENTS } from '@/components/feature/schedule/scheduleMockData';
import { useTodayTheme } from '@/screens/today/todayTheme';

const DELIVERY_LABEL: Record<ScheduleDeliveryMode, string> = {
  P: 'In person',
  B: 'Blended',
  OL: 'Online',
};

/**
 * The meeting facts the body renders, independent of where it was opened from.
 *
 * Today passes its derived session; Schedule passes a timetable row. Taking
 * this shape rather than `TodaySession` keeps the body from depending on the
 * Home card's view model — the status pill and hero image it carries have no
 * meaning on the Schedule route.
 */
export type CourseMeeting = {
  courseCode: string;
  componentLabel?: string;
  mode?: ScheduleDeliveryMode;
  /** "Starts" / "Ends" — Today flips this while a class is running. */
  timeLabel: string;
  timeValue: string;
  room: string;
  professor: string;
  /** Faculty profile slug, when the instructor could be matched to one. */
  professorFpid?: string;
  /** Timetable row id, so the course's schedule can mark the one you opened. */
  eventId?: string;
};

/** Build the meeting facts from a raw timetable row. */
export function meetingFromEvent(event: ScheduleEvent): CourseMeeting {
  return {
    courseCode: event.courseCode,
    componentLabel: event.component
      ? SESSION_COMPONENT_LABEL[event.component]
      : undefined,
    mode: event.mode,
    // A row you navigated to is not necessarily today's, so it always reads as
    // the scheduled span rather than counting down like the Home card.
    timeLabel: 'Time',
    timeValue: `${formatClock(event.startMinutes)}–${formatClock(event.endMinutes, true)}`,
    room: event.room ?? 'Room TBA',
    professor: event.professor ?? '—',
    professorFpid: event.professorFpid,
    eventId: event.id,
  };
}

type Props = {
  session: CourseMeeting;
};

/** One label/value line in the meeting block. */
function DetailRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text
        variant="bodySmall"
        style={[styles.rowLabel, { color: theme.color.text.subtle }]}
      >
        {label}
      </Text>
      <Text
        variant="bodySmall"
        style={[styles.rowValue, { color: theme.color.text.primary }]}
      >
        {value}
      </Text>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text variant="heading3" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

/**
 * Instructor, with their headshot and a link to their faculty page.
 *
 * Rendered only once the profile resolves. A broken avatar or a dead link is
 * worse than the plain name already listed in the meeting block above, so
 * nothing appears while loading or after a 404 — the name is never lost.
 */
/**
 * Sits inside "This class", under the key/value rows — the instructor is one
 * of that block's facts, and as its own section it read as a separate topic.
 * No `Section` wrapper for the same reason.
 */
function InstructorCard({ profile }: { profile: FacultyProfile }) {
  const theme = useTheme();
  const todayTheme = useTodayTheme();

  return (
    <View style={styles.instructorBlock}>
      <Pressable
        onPress={() => {
          // Nothing to recover to if it fails; the row simply stays put.
          Linking.openURL(profile.profileUrl).catch(() => {});
        }}
        accessibilityRole="link"
        accessibilityLabel={`${profile.firstName} ${profile.lastName}, ${profile.title}. Opens their faculty profile.`}
        style={({ pressed }) => [
          todayShadowSoft,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <View
          style={[styles.instructorRow, cardEdge(theme.color.borderSubtle)]}
        >
          <GlassSurface
            corner={CARD_CORNER}
            tint={CARD_GLASS_TINT}
            intensity={CARD_BLUR_INTENSITY}
            fallback={todayTheme.cardBackground}
          />
          {profile.photoUrl ? (
            <Image source={{ uri: profile.photoUrl }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatar,
                { backgroundColor: `${theme.color.primary}14` },
              ]}
            />
          )}

          <View style={styles.instructorText}>
            <Text variant="bodySmall" style={styles.instructorName}>
              {profile.firstName} {profile.lastName}
            </Text>
            <Text
              variant="caption"
              numberOfLines={2}
              style={{ color: theme.color.text.secondary }}
            >
              {profile.title}
            </Text>
          </View>

          {/* Brand and larger — the only affordance saying the card opens. */}
          <MaterialSymbol
            icon={msChevronRight}
            size={24}
            color={theme.color.primary}
          />
        </View>
      </Pressable>
    </View>
  );
}

/**
 * Two-up quick actions, replacing the design's single CTA.
 *
 * Only offered when they can actually do something: Directions needs a room
 * on campus, Email needs an address off the faculty profile. An online class
 * with an unmatched instructor shows neither rather than a dead row.
 */
/**
 * Rule under every key/value row. Darker than a hairline border on a card:
 * with the cards gone these rules are the only thing structuring the page, so
 * they have to read on their own.
 */
const DETAIL_DIVIDER = 'rgba(0, 0, 0, 0.12)';

/** Widths chosen so the block reads as a paragraph, not a progress bar. */
const SKELETON_LINES = ['96%', '99%', '92%', '61%'] as const;

/** One clock for every placeholder, so nothing shimmers out of step. */
function useSkeletonPulse() {
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 820, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse]);

  return useAnimatedStyle(() => ({ opacity: pulse.value }));
}

/**
 * Placeholder for a key/value row, carrying the same rule as a real one so
 * the list keeps its height and the rows below do not shift on arrival.
 */
function SkeletonDetailRow() {
  const theme = useTheme();
  const pulseStyle = useSkeletonPulse();
  const bar = { backgroundColor: theme.color.borderSubtle };

  return (
    <Animated.View style={[styles.row, pulseStyle]}>
      <View style={[styles.skeletonLine, bar, { width: 62 }]} />
      <View style={[styles.skeletonLine, bar, { width: 34 }]} />
    </Animated.View>
  );
}

/** Placeholder for the instructor card, matched to its resting height. */
function SkeletonInstructorCard() {
  const theme = useTheme();
  const pulseStyle = useSkeletonPulse();
  const bar = { backgroundColor: theme.color.borderSubtle };

  return (
    <Animated.View style={[styles.instructorBlock, pulseStyle]}>
      <View style={styles.skeletonInstructorRow}>
        <View style={[styles.skeletonAvatar, bar]} />
        <View style={styles.skeletonInstructorText}>
          <View style={[styles.skeletonLine, bar, { width: 132 }]} />
          <View style={[styles.skeletonLine, bar, { width: 196 }]} />
        </View>
      </View>
    </Animated.View>
  );
}

/**
 * Stands in for About + Requirements while the catalog resolves.
 *
 * Rendered where those sections will land rather than as a status line at the
 * foot of the page: the two-hop course lookup takes long enough to notice, and
 * the page was reflowing around content that appeared above the message.
 *
 * One shared value drives every bar, so they breathe together instead of
 * shimmering independently.
 */
function CourseDetailSkeleton() {
  const theme = useTheme();
  const pulseStyle = useSkeletonPulse();
  const bar = { backgroundColor: theme.color.borderSubtle };

  return (
    <>
      <Animated.View style={[styles.skeletonBlock, pulseStyle]}>
        {SKELETON_LINES.map((width) => (
          <View
            key={width}
            style={[styles.skeletonLine, bar, { width: width as `${number}%` }]}
          />
        ))}
      </Animated.View>

      <Section title="Requirements">
        <Animated.View style={pulseStyle}>
          {[0, 1].map((i) => (
            <View key={i} style={styles.skeletonRow}>
              <View style={[styles.skeletonLine, bar, { width: 74 }]} />
              <View style={[styles.skeletonLine, bar, { width: 52 }]} />
            </View>
          ))}
        </Animated.View>
      </Section>
    </>
  );
}

function QuickActions({
  buildingCode,
  email,
}: {
  buildingCode: string | null;
  email: string | null;
}) {
  const theme = useTheme();
  const todayTheme = useTodayTheme();
  /*
    The body is rendered from two different stacks (Today's sheet and the
    Schedule push), so it cannot name one stack's param list. Directions
    crosses to the Campus tab either way, which is a navigator neither stack
    types — hence the untyped handle for this one call.
  */
  const navigation =
    useNavigation<NavigationProp<Record<string, object | undefined>>>();

  if (!buildingCode && !email) return null;

  const Action = ({
    icon,
    label,
    onPress,
  }: {
    icon: MsIconDefinition;
    label: string;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.actionShadow,
        todayShadowSoft,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.action, cardEdge(theme.color.borderSubtle)]}>
        <GlassSurface
          corner={CARD_CORNER}
          tint={CARD_GLASS_TINT}
          intensity={CARD_BLUR_INTENSITY}
          fallback={todayTheme.cardBackground}
        />
        <MaterialSymbol icon={icon} size={22} color={theme.color.primary} />
        <Text variant="caption" style={styles.actionLabel}>
          {label}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.actionRow}>
      {buildingCode ? (
        <Action
          icon={msMap}
          label="Directions"
          onPress={() =>
            navigation.navigate('Campus', {
              screen: 'CampusHome',
              params: { focusBuildingId: buildingCode },
            })
          }
        />
      ) : null}
      {email ? (
        <Action
          icon={msMail}
          label="Email"
          onPress={() => {
            Linking.openURL(`mailto:${email}`).catch(() => {});
          }}
        />
      ) : null}
    </View>
  );
}

/**
 * Every meeting of this course in the week, not just the one you tapped.
 *
 * The design's point is that a course is a pattern — two slots a week, one of
 * which is today. Derived from the timetable rather than the catalog: Open
 * Data's schedule endpoint returned no rows for these courses.
 */
function CourseSchedule({
  courseCode,
  currentEventId,
}: {
  courseCode: string;
  currentEventId?: string;
}) {
  const theme = useTheme();
  const now = useNow();
  const todayKey = getDayKey(now);

  const meetings = useMemo(
    () => MOCK_WEEK_EVENTS.filter((e) => e.courseCode === courseCode),
    [courseCode]
  );
  if (meetings.length === 0) return null;

  return (
    <Section title="Schedule">
      {/* Bare, matching "This class" — the row dividers carry the structure. */}
      <View>
        {meetings.map((meeting, i) => {
          const isToday = meeting.dayKey === todayKey;
          return (
            <View
              key={meeting.id}
              style={[styles.scheduleRow, i > 0 ? styles.rowDivider : null]}
            >
              <View
                style={[
                  styles.dayBadge,
                  {
                    backgroundColor: isToday
                      ? theme.color.primary
                      : theme.color.backgroundSubtle,
                  },
                ]}
              >
                <Text
                  variant="caption"
                  style={{
                    fontWeight: '700',
                    color: isToday
                      ? theme.color.text.inverse
                      : theme.color.text.primary,
                  }}
                >
                  {SHORT_DAY[meeting.dayKey] ?? meeting.dayKey}
                </Text>
              </View>

              <View style={styles.scheduleText}>
                <Text variant="bodySmall" style={styles.scheduleTime}>
                  {formatClock(meeting.startMinutes)}–
                  {formatClock(meeting.endMinutes, true)}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: theme.color.text.secondary }}
                >
                  {meeting.room === 'Online'
                    ? 'Online'
                    : `Room ${meeting.room ?? 'TBA'}`}
                </Text>
              </View>

              {meeting.id === currentEventId ? (
                <Text
                  variant="caption"
                  color="brand"
                  style={[
                    styles.nowPill,
                    { backgroundColor: `${theme.color.primary}12` },
                  ]}
                >
                  This class
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </Section>
  );
}

/**
 * Building code out of a room label — "LB-625" is building LB. Online and
 * TBA rooms have no building, so Directions is not offered for them.
 */
function roomBuildingCode(room: string): string | null {
  const match = /^([A-Z]{1,3})-/.exec(room.trim());
  return match ? match[1] : null;
}

/** Lines shown before the description is cut off. */
const DESCRIPTION_COLLAPSED_LINES = 5;

/**
 * Calendar descriptions run to a full paragraph or more, which buried the
 * sections under it. Collapsed by default, with the toggle offered only once
 * the text has actually been measured as longer — a "Read more" under three
 * lines of text is just noise.
 */
function CourseDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [measured, setMeasured] = useState(false);

  return (
    <View style={styles.descriptionBlock}>
      <Text
        variant="body"
        color="secondary"
        style={styles.description}
        numberOfLines={expanded ? undefined : DESCRIPTION_COLLAPSED_LINES}
      >
        {text}
      </Text>

      {/*
        Hidden twin, measured once and then dropped.

        The visible copy cannot report this: `onTextLayout` gives the lines it
        actually drew, and with `numberOfLines` set that can never exceed the
        limit — so asking it whether it overflowed always answers no, and the
        toggle never appeared. This copy is unclipped, so its line count is the
        real one. Absolute with both edges pinned so it wraps at the same width.
      */}
      {!measured ? (
        <Text
          variant="body"
          style={[styles.description, styles.descriptionMeasure]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          onTextLayout={(e) => {
            setOverflows(e.nativeEvent.lines.length > DESCRIPTION_COLLAPSED_LINES);
            setMeasured(true);
          }}
        >
          {text}
        </Text>
      ) : null}

      {overflows ? (
        <Pressable
          onPress={() => setExpanded((open) => !open)}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          hitSlop={8}
        >
          <Text variant="bodySmall" color="brand" style={styles.readMore}>
            {expanded ? 'Read less' : 'Read more'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Short weekday for the schedule badge. */
const SHORT_DAY: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

/**
 * The body of the session detail sheet.
 *
 * Meeting facts come off the timetable and are always present. Everything
 * below — calendar description, credits, prerequisites, enrolment — is
 * fetched from Concordia Open Data and rendered only once it arrives, so the
 * sheet is never blocked on the network: the part you opened it for is on
 * screen immediately.
 */
export function CourseDetailBody({ session }: Props) {
  const theme = useTheme();
  const {
    data: course,
    isLoading,
    isError,
  } = useCourseDetail(session.courseCode);
  const { data: profile, isLoading: profileLoading } = useFacultyProfile(
    session.professorFpid,
  );
  const instructorEmail = profile?.email || null;

  /* Online classes have no room to name — the timetable puts "Online" there. */
  const isOnline = session.mode === 'OL';

  return (
    <>
      {isLoading ? <CourseDetailSkeleton /> : null}

      {/* No heading: it sits under the course title, which already says this. */}
      {course?.description ? <CourseDescription text={course.description} /> : null}

      <QuickActions
        buildingCode={roomBuildingCode(session.room)}
        email={instructorEmail}
      />

      <Section title="This class">
        {/*
          Bare, unlike the cards below it: these are the facts you already saw
          on the hero, so boxing them a second time gave the page two competing
          openings. The rows read as a continuation of the title instead.
        */}
        <View>
          {session.componentLabel ? (
            <DetailRow label="Type" value={session.componentLabel} />
          ) : null}
          <DetailRow label={session.timeLabel} value={session.timeValue} />
          <DetailRow
            label={isOnline ? 'Delivery' : 'Room'}
            value={session.room}
          />
          {session.mode && !isOnline ? (
            <DetailRow label="Delivery" value={DELIVERY_LABEL[session.mode]} />
          ) : null}
          {/*
            Credits arrive with the catalog, everything above it comes off the
            timetable. Without a placeholder the list rendered four rows and
            grew a fifth a beat later, nudging the instructor card down.
          */}
          {isLoading ? (
            <SkeletonDetailRow />
          ) : course?.credits != null ? (
            <DetailRow
              label="Credits"
              value={course.credits.toFixed(2).replace(/\.00$/, '')}
            />
          ) : null}
        </View>

        {/* The instructor is a fact of this class, not a topic of its own. */}
        {profileLoading ? (
          <SkeletonInstructorCard />
        ) : profile ? (
          <InstructorCard profile={profile} />
        ) : null}
      </Section>

      <CourseSchedule
        courseCode={session.courseCode}
        currentEventId={session.eventId}
      />

      {course && (course.prerequisites || course.crosslisted) ? (
        <Section title="Requirements">
          <View>
            {course.crosslisted ? (
              <DetailRow label="Cross-listed" value={course.crosslisted} />
            ) : null}
          </View>
          {course.prerequisites ? (
            <Text variant="body" color="secondary" style={styles.prerequisites}>
              {course.prerequisites}
            </Text>
          ) : null}
        </Section>
      ) : null}

      {course?.enrolment ? (
        <Section title="Enrolment">
          <View>
            <DetailRow
              label="Enrolled"
              value={`${course.enrolment.enrolled} of ${course.enrolment.capacity}`}
            />
            {course.enrolment.waitlisted > 0 ? (
              <DetailRow
                label="Waitlisted"
                value={String(course.enrolment.waitlisted)}
              />
            ) : null}
          </View>
          {/*
            The capacity is the course total across every section, not this
            meeting's room — say so rather than letting it read as the seat
            count for the lecture you are looking at.
          */}
          <Text
            variant="caption"
            style={[styles.note, { color: theme.color.text.subtle }]}
          >
            Across all sections this term.
          </Text>
        </Section>
      ) : null}

      {isError ? (
        <Text
          variant="caption"
          style={[styles.note, { color: theme.color.text.subtle }]}
        >
          Course details are unavailable right now.
        </Text>
      ) : null}
    </>
  );
}

/** Card fill and hairline, both appearance-dependent. */
/**
 * Every card on this page is glass now, so they no longer carry a fill of
 * their own — `GlassSurface` paints behind the content and this just supplies
 * the edge that keeps a card legible against the page.
 */
function cardEdge(border: string) {
  return {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: border,
    borderRadius: 12,
    borderCurve: 'continuous' as const,
    overflow: 'hidden' as const,
  };
}

/** Corner geometry handed to the glass fill so it matches the card. */
const CARD_CORNER = { borderRadius: 12, borderCurve: 'continuous' as const };

const AVATAR = 52;

const styles = StyleSheet.create({
  instructorBlock: {
    paddingTop: 14,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
  },
  instructorText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  instructorName: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  },
  instructorTitle: {
    fontSize: 15.5,
    lineHeight: 21,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionShadow: {
    flex: 1,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 7,
    paddingVertical: 13,
  },
  actionLabel: {
    fontWeight: '600',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DETAIL_DIVIDER,
  },
  dayBadge: {
    width: 42,
    height: 42,
    borderRadius: 11,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleText: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  scheduleTime: {
    fontWeight: '600',
  },
  nowPill: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
    fontWeight: '700',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  card: {
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  /** For cards whose rows pad themselves — stacking both double-indents them. */
  cardFlush: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 10,
    /* Under every row including the last — a ruled list, not separators. */
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DETAIL_DIVIDER,
  },
  rowLabel: {
    fontSize: 14,
    lineHeight: 19,
  },
  rowValue: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'right',
  },
  descriptionMeasure: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    opacity: 0,
    zIndex: -1,
  },
  descriptionBlock: {
    gap: 8,
  },
  /** Off-screen measuring copy — laid out, never seen. */
  measure: {
    position: 'absolute',
    opacity: 0,
    left: 0,
    right: 0,
  },
  readMore: {
    fontWeight: '600',
  },
  description: {
    /*
      The longest read on the page, and now the first thing under the title —
      sized for prose, not for a meta row. Leading tracks the size at ~1.5 so
      the paragraph keeps its rhythm.
    */
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '500',
  },
  prerequisites: {
    fontSize: 14,
    lineHeight: 21,
  },
  skeletonBlock: {
    gap: 9,
  },
  skeletonLine: {
    height: 13,
    borderRadius: 6,
  },
  skeletonInstructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  skeletonAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  skeletonInstructorText: {
    flex: 1,
    gap: 9,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
  },
  note: {
    fontSize: 12.5,
    lineHeight: 17,
  },
});
