import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/design-system';
import {
  CourseDetailBody,
  meetingFromEvent,
} from '@/components/feature/today/CourseDetailBody';
import { MOCK_WEEK_EVENTS } from '@/components/feature/schedule/scheduleMockData';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { scheduleTheme } from '@/components/feature/schedule/scheduleTheme';
import type { ScheduleStackScreenProps } from '@/navigation/types';

type Props = ScheduleStackScreenProps<'CourseDetail'>;

/**
 * A timetable meeting, opened from the Schedule.
 *
 * The same body as the Home session sheet, without the hero photo or the
 * status pill: both belong to the Home card, which is answering "what is on
 * right now". Reached from the timetable, the question is about the course,
 * so the page opens on the facts and the calendar entry instead.
 *
 * An ordinary pushed screen rather than the expanding sheet — the sheet's
 * whole shape exists to grow out of the card it was tapped on, and there is no
 * such card here.
 */
export function CourseDetailScreen({ route }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const event = useMemo(
    () => MOCK_WEEK_EVENTS.find((e) => e.id === route.params.eventId),
    [route.params.eventId],
  );

  if (!event) {
    return (
      <View style={styles.root}>
        <Text variant="bodySmall" style={styles.missing}>
          That class is no longer on your timetable.
        </Text>
      </View>
    );
  }

  const meeting = meetingFromEvent(event);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.masthead}>
        <Text variant="caption" style={[styles.eyebrow, { color: theme.color.primary }]}>
          {event.courseCode}
          {meeting.componentLabel ? ` · ${meeting.componentLabel}` : ''}
        </Text>
        <Text variant="heading2" style={styles.title}>
          {event.title}
        </Text>
      </View>

      <CourseDetailBody session={meeting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: scheduleTheme.pageBackground,
  },
  content: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 8,
    gap: 24,
  },
  masthead: {
    gap: 4,
  },
  eyebrow: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  missing: {
    padding: semanticSpacing.screenHorizontal,
  },
});
