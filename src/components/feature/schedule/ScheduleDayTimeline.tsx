import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import { ScheduleEventBlock } from './ScheduleEventBlock';
import type { ScheduleEvent } from './scheduleTypes';
import {
  TIMELINE_END_HOUR,
  TIMELINE_START_HOUR,
  HOUR_ROW_HEIGHT,
  eventBlockHeight,
  formatNowLabel,
  formatTimelineHour,
  getEventStatus,
  getNowLineTop,
  getTimelineHeight,
  minutesToTop,
} from './scheduleUtils';

const TIMELINE_LABEL_WIDTH = 36;

type Props = {
  events: ScheduleEvent[];
  selectedDate: Date;
  now?: Date;
};

export function ScheduleDayTimeline({ events, selectedDate, now = new Date() }: Props) {
  const theme = useTheme();
  const timelineHeight = getTimelineHeight();
  const hours = useMemo(
    () =>
      Array.from(
        { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR },
        (_, i) => TIMELINE_START_HOUR + i
      ),
    []
  );

  const nowTop = getNowLineTop(now);
  const nowLabel = formatNowLabel(now);
  const showNow = nowTop != null && selectedDate.toDateString() === now.toDateString();

  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ width: TIMELINE_LABEL_WIDTH, height: timelineHeight }}>
        {hours.map((hour) => (
          <View key={hour} style={{ height: HOUR_ROW_HEIGHT, justifyContent: 'flex-start' }}>
            <Text variant="caption" color="subtle" style={{ marginTop: -6 }}>
              {formatTimelineHour(hour)}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flex: 1, height: timelineHeight, position: 'relative' }}>
        {hours.map((hour, index) => (
          <View
            key={hour}
            style={{
              position: 'absolute',
              top: index * HOUR_ROW_HEIGHT,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: theme.color.borderSubtle,
            }}
          />
        ))}

        {showNow ? (
          <View
            style={{
              position: 'absolute',
              top: nowTop,
              left: 0,
              right: 0,
              flexDirection: 'row',
              alignItems: 'center',
              zIndex: 2,
            }}
            pointerEvents="none"
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                borderCurve: 'continuous',
                backgroundColor: theme.color.primary,
                marginRight: 4,
              }}
            />
            <View style={{ flex: 1, height: 2, backgroundColor: theme.color.primary }} />
          </View>
        ) : null}

        {events.map((event) => {
          const status = getEventStatus(event, now, selectedDate);
          const top = minutesToTop(event.startMinutes);
          const height = eventBlockHeight(event.startMinutes, event.endMinutes);
          const blockNowLabel = status === 'active' ? nowLabel : undefined;

          return (
            <View
              key={event.id}
              style={{
                position: 'absolute',
                top: Math.max(top - (status === 'active' && blockNowLabel ? 18 : 0), 0),
                left: 0,
                right: 0,
                zIndex: status === 'active' ? 3 : 1,
              }}
            >
              <ScheduleEventBlock
                event={event}
                status={status}
                height={height}
                nowLabel={blockNowLabel}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}
