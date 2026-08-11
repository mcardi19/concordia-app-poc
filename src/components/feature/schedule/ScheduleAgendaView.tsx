import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { ScheduleAllDayBanner } from './ScheduleAllDayBanner';
import { scheduleTheme } from './scheduleTheme';
import type { ScheduleAllDayItem, ScheduleEvent } from './scheduleTypes';
import { formatClock, groupEventsByDay } from './scheduleUtils';

type Props = {
  events: ScheduleEvent[];
  /** Supplies the date shown beside the weekday on each day divider. */
  weekDates?: Date[];
  allDayItems: ScheduleAllDayItem[];
  /** Day key that should read as "Today". */
  todayKey: string;
  onSelectEvent?: (event: ScheduleEvent) => void;
};

/** Left gutter carrying start over end time — the "scan rail". */
function TimeColumn({ event, strong }: { event: ScheduleEvent; strong?: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.timeCol}>
      <Text
        variant="bodySmall"
        style={{
          fontSize: 13.5,
          fontWeight: '500',
          letterSpacing: -0.2,
          color: strong ? theme.color.primary : scheduleTheme.timeText,
        }}
      >
        {formatClock(event.startMinutes, true)}
      </Text>
      <Text
        variant="caption"
        style={{
          fontSize: 11,
          fontWeight: '500',
          color: scheduleTheme.timeSubText,
          marginTop: 2,
        }}
      >
        {formatClock(event.endMinutes)}
      </Text>
    </View>
  );
}

/** The in-session entry — a raised card, but still inside the time rail. */
function NowRow({
  event,
  onPress,
}: {
  event: ScheduleEvent;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <TimeColumn event={event} strong />
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Now: ${event.courseCode}, ${event.title}`}
        style={styles.nowCard}
      >
        <View style={[styles.rail, { backgroundColor: theme.color.primary }]} />

        <Text variant="caption" style={{ fontSize: 12, color: scheduleTheme.timeSubText }}>
          <Text
            variant="caption"
            style={{ fontSize: 12, fontWeight: '700', color: theme.color.primary }}
          >
            NOW ·{' '}
          </Text>
          <Text
            variant="caption"
            style={{ fontSize: 12, fontWeight: '600', color: theme.color.primary }}
          >
            {event.courseCode}
          </Text>
          {event.kind === 'study' ? ' · Study group' : ' · Lecture'}
        </Text>

        <Text
          variant="bodySmall"
          style={{
            fontSize: 16.5,
            fontWeight: '600',
            letterSpacing: -0.2,
            color: scheduleTheme.headingText,
            marginTop: 3,
          }}
        >
          {event.title}
        </Text>

        <Text variant="caption" style={{ fontSize: 12.5, color: '#6A6A6C', marginTop: 8 }}>
          <Text
            variant="caption"
            style={{ fontSize: 12.5, fontWeight: '600', color: '#1A1A1C' }}
          >
            {event.room}
          </Text>
          {event.professor ? ` · ${event.professor}` : ''}
        </Text>

        <View style={styles.actions}>
          <View style={[styles.actionPrimary, { backgroundColor: theme.color.primary }]}>
            <Text
              variant="bodySmall"
              style={{ fontSize: 13, fontWeight: '600', color: theme.color.text.inverse }}
            >
              Course details
            </Text>
          </View>
          <View style={styles.actionSecondary}>
            <Text variant="bodySmall" style={{ fontSize: 13, fontWeight: '600', color: '#1A1A1C' }}>
              Message
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

function AgendaRow({
  event,
  onPress,
}: {
  event: ScheduleEvent;
  onPress?: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${event.courseCode}, ${event.title}`}
      style={[styles.row, styles.plainRow, { opacity: event.done ? 0.5 : 1 }]}
    >
      <TimeColumn event={event} />
      <View style={styles.plainBody}>
        <View
          style={[
            styles.rail,
            styles.railPlain,
            { backgroundColor: theme.color.primary },
          ]}
        />
        <Text
          variant="caption"
          style={{
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.2,
            color: theme.color.primary,
          }}
        >
          {event.kind === 'study' ? 'Study group' : event.courseCode}
        </Text>
        <Text
          variant="bodySmall"
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: scheduleTheme.bodyText,
            marginTop: 3,
          }}
        >
          {event.title}
        </Text>
        <Text variant="caption" style={{ fontSize: 12, color: scheduleTheme.metaText, marginTop: 2 }}>
          {event.room}
          {event.professor ? ` · ${event.professor}` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * 02a · Agenda — chronological across days. Everything hangs off one left time
 * rail so the eye can scan start times without re-reading each card.
 */
export function ScheduleAgendaView({
  events,
  weekDates,
  allDayItems,
  todayKey,
  onSelectEvent,
}: Props) {
  const theme = useTheme();
  const groups = groupEventsByDay(events, weekDates);

  return (
    <View style={styles.root}>
      {groups.map((group, index) => {
        const isToday = group.dayKey === todayKey;
        return (
          <View key={group.dayKey} style={{ paddingTop: index === 0 ? 14 : 22 }}>
            <View style={styles.dayDivider}>
              <Text
                variant="bodySmall"
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: isToday ? theme.color.primary : scheduleTheme.dividerText,
                }}
              >
                {isToday ? 'Today' : group.weekdayLabel}
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: isToday ? theme.color.primary : scheduleTheme.dividerMuted,
                }}
              >
                {group.dateLabel}
              </Text>
            </View>

            {isToday && allDayItems.length > 0 ? (
              <ScheduleAllDayBanner items={allDayItems} showGutterLabel />
            ) : null}

            {group.events.map((event) =>
              event.now ? (
                <NowRow
                  key={event.id}
                  event={event}
                  onPress={() => onSelectEvent?.(event)}
                />
              ) : (
                <AgendaRow
                  key={event.id}
                  event={event}
                  onPress={() => onSelectEvent?.(event)}
                />
              ),
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
  },
  dayDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    marginBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 8,
  },
  plainRow: {
    paddingVertical: 6,
  },
  timeCol: {
    width: 62,
    paddingTop: 1,
  },
  nowCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: scheduleTheme.allDayFill,
    borderRadius: 8,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(145, 35, 56, 0.15)',
    padding: 15,
    paddingLeft: 24,
    marginTop: -2,
    overflow: 'hidden',
    shadowColor: '#912338',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  plainBody: {
    flex: 1,
    minWidth: 0,
    backgroundColor: scheduleTheme.allDayFill,
    borderRadius: 8,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(145, 35, 56, 0.15)',
    paddingLeft: 18,
    paddingRight: 15,
    paddingTop: 8,
    paddingBottom: 9,
  },
  rail: {
    position: 'absolute',
    left: 7,
    top: 8,
    bottom: 8,
    width: 2,
    borderRadius: 2,
  },
  railPlain: {
    top: 3,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  actionPrimary: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  actionSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F3',
    borderRadius: 8,
    borderCurve: 'continuous',
  },
});
