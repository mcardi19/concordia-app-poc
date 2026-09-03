import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/design-system';
import {
  CURTAIN_BLUR_DEPTH,
  CURTAIN_FADE_DEPTH,
  CURTAIN_FADE_IN,
  ScrollCurtain,
} from '@/components/design-system/ScrollCurtain';
import {
  CourseDetailBody,
  meetingFromEvent,
} from '@/components/feature/today/CourseDetailBody';
import { MOCK_WEEK_EVENTS } from '@/components/feature/schedule/scheduleMockData';
import { SESSION_COMPONENT_LABEL } from '@/components/feature/schedule/scheduleTypes';
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
export function CourseDetailScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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

  const event = useMemo(
    () => MOCK_WEEK_EVENTS.find((e) => e.id === route.params.eventId),
    [route.params.eventId],
  );

  /*
    The header names what kind of meeting this is — Lecture, Tutorial, Lab.
    Set here rather than in the navigator because it varies per event, and the
    navigator would have to repeat this lookup to know it.

    `useLayoutEffect` so the title is in place on the first painted frame; a
    plain effect lets the header render empty and then fill in mid-push.
  */
  useLayoutEffect(() => {
    if (!event) return;
    navigation.setOptions({
      // "Course" alone would not say which meeting; the component alone would
      // not say what kind of thing you opened.
      title: event.component
        ? `Course · ${SESSION_COMPONENT_LABEL[event.component]}`
        : // Study and TA blocks carry no teaching component.
          'Study block',
    });
  }, [navigation, event]);

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
    <View style={styles.root}>
      <Animated.ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + 8, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
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
      </Animated.ScrollView>

      {/* Above the content, below the bar — drawn only once content scrolls up. */}
      <ScrollCurtain
        color={scheduleTheme.pageBackground}
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
    backgroundColor: scheduleTheme.pageBackground,
  },
  content: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
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
