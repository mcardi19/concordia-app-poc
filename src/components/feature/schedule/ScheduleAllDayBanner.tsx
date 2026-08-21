import React, { useCallback, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, UIManager, View } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import {
  GRID_INSET,
  RAIL_LABEL_WEIGHT,
  RAIL_WIDTH,
  scheduleTheme,
} from './scheduleTheme';
import type { ScheduleAllDayItem } from './scheduleTypes';

type Props = {
  items: ScheduleAllDayItem[];
  /** Renders the compact "All day" gutter label used by the timeline views. */
  showGutterLabel?: boolean;
  /** Opens one entry's detail. */
  onSelect?: (item: ScheduleAllDayItem) => void;
};

/** "+1 more academic date", "+2 more academic dates". */
function moreLabel(count: number): string {
  return `+${count} more academic date${count === 1 ? '' : 's'}`;
}

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Institutional all-day entries — the day's academic dates.
 *
 * Collapsed, only the highest-priority entry is drawn, with a card peeking out
 * behind it to show there are more. That is the honest default: on March 1st
 * six things are true at once, and six stacked cards would push the timetable
 * off screen for a day whose events have no times at all.
 *
 * Tapping the stack expands it in place rather than pushing a list screen,
 * because the question "what else is today" is answered by three more lines,
 * not by a navigation. Once expanded, each row is its own target into detail.
 */
export function ScheduleAllDayBanner({ items, showGutterLabel, onSelect }: Props) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((open) => !open);
  }, []);

  if (items.length === 0) {
    return null;
  }

  const [first] = items;
  const more = items.length - 1;
  const shown = expanded ? items : [first];

  /*
    Collapsed, the whole first card opens the stack — the hidden dates are
    what it is standing in for, so the card is the affordance and the label
    below only says how many. Once open it goes back to being one date among
    the others, and "Show less" takes over the collapsing.
  */
  const card = (item: ScheduleAllDayItem, index: number) => {
    const opensStack = index === 0 && more > 0 && !expanded;
    return (
    <Pressable
      key={item.id}
      onPress={() => (opensStack ? toggle() : onSelect?.(item))}
      accessibilityRole="button"
      accessibilityState={opensStack ? { expanded: false } : undefined}
      accessibilityLabel={
        opensStack
          ? `${item.kind}: ${item.title}, and ${moreLabel(more)}`
          : `${item.kind}: ${item.title}`
      }
      style={({ pressed }) => [
        styles.card,
        { borderColor: `${theme.color.primary}26`, opacity: pressed ? 0.72 : 1 },
        index > 0 ? styles.cardStacked : null,
      ]}
    >
      <View style={styles.cardText}>
        <Text
          variant="caption"
          style={[styles.kind, { color: theme.color.primary }]}
        >
          {item.kind}
        </Text>
        <Text variant="bodySmall" numberOfLines={expanded ? 2 : 1} style={styles.title}>
          {item.title}
        </Text>
        {expanded && item.detail ? (
          <Text variant="caption" numberOfLines={2} style={styles.detail}>
            {item.detail}
          </Text>
        ) : null}

        {/*
          Collapsed this is a caption, not a target — the card around it is
          already the target. Expanded it becomes one, because by then the
          card itself belongs to its own date again.
        */}
        {index === 0 && more > 0 ? (
          expanded ? (
            <Pressable
              onPress={toggle}
              accessibilityRole="button"
              accessibilityState={{ expanded: true }}
              accessibilityLabel="Show fewer academic dates"
              hitSlop={8}
              style={({ pressed }) => [styles.moreRow, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Text variant="caption" style={[styles.moreLabel, { color: theme.color.primary }]}>
                Show less
              </Text>
            </Pressable>
          ) : (
            <Text
              variant="caption"
              style={[styles.moreLabel, styles.moreRow, { color: theme.color.primary }]}
            >
              {moreLabel(more)}
            </Text>
          )
        ) : null}
      </View>
    </Pressable>
    );
  };

  const banner = (
    <View>
      <View style={styles.stackWrap}>
        {/*
          The peeking card is the whole affordance for a collapsed stack — it
          says "there is another one underneath" in the shape of the thing
          underneath. It goes away once they are all drawn.
        */}
        {more > 0 && !expanded ? (
          <View style={[styles.stackedCard, { borderColor: `${theme.color.primary}1A` }]} />
        ) : null}

        {shown.map(card)}
      </View>
    </View>
  );

  if (!showGutterLabel) {
    return banner;
  }

  return (
    <View style={styles.gutterRow}>
      <View style={styles.gutter}>
        {/*
          Sits in the hour rail's column, styled as one of its labels — the
          all-day row is the top of the same time axis, so its label belongs
          in the same gutter rather than inside the card.
        */}
        <Text variant="caption" numberOfLines={1} style={styles.gutterLabel}>
          All day
        </Text>
      </View>
      <View style={styles.gutterBody}>{banner}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  stackWrap: {
    position: 'relative',
  },
  // Peeks out below the front card to imply depth.
  stackedCard: {
    position: 'absolute',
    left: 11,
    right: 11,
    top: 8,
    bottom: -6,
    backgroundColor: scheduleTheme.allDayStackFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: scheduleTheme.allDayFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    borderCurve: 'continuous',
    // Same insets as a timeline block, so both texts start on one line.
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 11,
  },
  cardStacked: {
    marginTop: 6,
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  kind: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 14.5,
    fontWeight: '600',
    color: scheduleTheme.headingText,
    marginTop: 2,
  },
  detail: {
    fontSize: 11.5,
    lineHeight: 15,
    color: scheduleTheme.metaText,
    marginTop: 3,
  },
  moreRow: {
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  moreLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  gutterRow: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  /** Matches `ScheduleHourRail` so the label lines up with the hour labels. */
  gutter: {
    width: RAIL_WIDTH,
    paddingTop: 12,
    paddingRight: 4,
  },
  gutterLabel: {
    fontSize: 11.5,
    textAlign: 'right',
    letterSpacing: 0.2,
    fontWeight: RAIL_LABEL_WEIGHT,
    color: scheduleTheme.railLabel,
  },
  gutterBody: {
    flex: 1,
    minWidth: 0,
    marginLeft: GRID_INSET,
  },
});
