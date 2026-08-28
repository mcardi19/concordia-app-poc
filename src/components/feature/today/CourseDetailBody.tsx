import React, { useMemo, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';
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
function InstructorCard({ profile }: { profile: FacultyProfile }) {
  const theme = useTheme();
  const todayTheme = useTodayTheme();

  return (
    <Section title="Instructor">
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

          <MaterialSymbol
            icon={msChevronRight}
            size={18}
            color={theme.color.text.subtle}
          />
        </View>
      </Pressable>
    </Section>
  );
}

/**
 * Two-up quick actions, replacing the design's single CTA.
 *
 * Only offered when they can actually do something: Directions needs a room
 * on campus, Email needs an address off the faculty profile. An online class
 * with an unmatched instructor shows neither rather than a dead row.
 */
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
  const todayTheme = useTodayTheme();
  const now = useNow();
  const todayKey = getDayKey(now);

  const meetings = useMemo(
    () => MOCK_WEEK_EVENTS.filter((e) => e.courseCode === courseCode),
    [courseCode]
  );
  if (meetings.length === 0) return null;

  return (
    <Section title="Schedule">
      <View
        style={[
          styles.card,
          styles.cardFlush,
          cardEdge(theme.color.borderSubtle),
        ]}
      >
        <GlassSurface
          corner={CARD_CORNER}
          tint={CARD_GLASS_TINT}
          intensity={CARD_BLUR_INTENSITY}
          fallback={todayTheme.cardBackground}
        />
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

  return (
    <View style={styles.descriptionBlock}>
      <Text
        variant="body"
        color="secondary"
        style={styles.description}
        numberOfLines={expanded ? undefined : DESCRIPTION_COLLAPSED_LINES}
        // Fires with the unclipped line count, so this measures the full text
        // rather than what is currently on screen.
        onTextLayout={(e) => {
          if (e.nativeEvent.lines.length > DESCRIPTION_COLLAPSED_LINES)
            setOverflows(true);
        }}
      >
        {text}
      </Text>

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
  const todayTheme = useTodayTheme();
  const {
    data: course,
    isLoading,
    isError,
  } = useCourseDetail(session.courseCode);
  const { data: profile } = useFacultyProfile(session.professorFpid);
  const instructorEmail = profile?.email || null;

  /* Online classes have no room to name — the timetable puts "Online" there. */
  const isOnline = session.mode === 'OL';

  return (
    <>
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
          <DetailRow label="Instructor" value={session.professor} />
        </View>
      </Section>

      <QuickActions
        buildingCode={roomBuildingCode(session.room)}
        email={instructorEmail}
      />

      {course?.description ? (
        <Section title="About this course">
          <CourseDescription text={course.description} />
        </Section>
      ) : null}

      <CourseSchedule
        courseCode={session.courseCode}
        currentEventId={session.eventId}
      />

      {profile ? <InstructorCard profile={profile} /> : null}

      {course && (course.credits != null || course.prerequisites) ? (
        <Section title="Requirements">
          <View style={[styles.card, cardEdge(theme.color.borderSubtle)]}>
            <GlassSurface
              corner={CARD_CORNER}
              tint={CARD_GLASS_TINT}
              intensity={CARD_BLUR_INTENSITY}
              fallback={todayTheme.cardBackground}
            />
            {course.credits != null ? (
              <DetailRow
                label="Credits"
                value={course.credits.toFixed(2).replace(/\.00$/, '')}
              />
            ) : null}
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
          <View style={[styles.card, cardEdge(theme.color.borderSubtle)]}>
            <GlassSurface
              corner={CARD_CORNER}
              tint={CARD_GLASS_TINT}
              intensity={CARD_BLUR_INTENSITY}
              fallback={todayTheme.cardBackground}
            />
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

      {isLoading ? (
        <Text
          variant="caption"
          style={[styles.note, { color: theme.color.text.subtle }]}
        >
          Loading course details…
        </Text>
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
    fontSize: 14,
    lineHeight: 19,
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
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
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
    /* The longest read on the page — sized for prose, not for a meta row. */
    fontSize: 17,
    lineHeight: 26,
  },
  prerequisites: {
    fontSize: 14,
    lineHeight: 21,
  },
  note: {
    fontSize: 12.5,
    lineHeight: 17,
  },
});
