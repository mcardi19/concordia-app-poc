import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { Text } from '@/components/design-system';
import {
  CURTAIN_BLUR_DEPTH,
  CURTAIN_FADE_DEPTH,
  CURTAIN_FADE_IN,
  ScrollCurtain,
} from '@/components/design-system/ScrollCurtain';
import { MaterialSymbol } from '@/components/icons';
import { radiusStyle, useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import {
  filterNotificationGroups,
  isUnread,
  notificationFilterCount,
  notificationGroups,
  NOTIFICATION_FILTERS,
  type NotificationFilter,
  type NotificationItem,
} from './notificationsData';
import { useMeTheme } from './meTheme';
import type { MeStackScreenProps } from '@/navigation/types';

type Props = MeStackScreenProps<'Notifications'>;

const ICON_SIZE = 40;
const ROW_PADDING_TOP = 14;

/**
 * 05a · Notifications — the inbox, reached from the bell in the Me masthead.
 *
 * Distinct from notification *preferences*: this is what arrived, not what is
 * allowed to arrive. Read state lives here rather than in a store because
 * nothing outside this screen consumes it yet — the unread badge on the
 * masthead is still the static count from `accountData`.
 */
export function NotificationsScreen({ navigation }: Props) {
  const theme = useTheme();
  const me = useMeTheme();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(() => new Set());

  /*
    The header is transparent, so the curtain is what keeps content legible as
    it passes underneath. RN's `Animated` rather than Reanimated because
    `ScrollCurtain` takes an `Animated.AnimatedInterpolation` — the same value
    Home and search already drive it with.
  */
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

  const unreadCount = notificationFilterCount(notificationGroups, 'unread', readIds) ?? 0;

  /*
    Marking read happens here rather than on the detail screen: this screen
    owns that state, and opening one is what makes it read, so the same tap
    can do both.
  */
  const openNotification = useCallback(
    (id: string) => {
      setReadIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      navigation.navigate('NotificationDetail', { id });
    },
    [navigation],
  );

  const groups = useMemo(
    () => filterNotificationGroups(notificationGroups, filter, readIds),
    [filter, readIds],
  );

  return (
    <View style={[styles.root, { backgroundColor: me.pageBackground }]}>
      <Animated.ScrollView
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + 4 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        /* The curtain replaces the bar's own background, so content must run
           under it rather than being inset below it. */
        contentInsetAdjustmentBehavior="never"
      >
      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {NOTIFICATION_FILTERS.map((chip) => {
          const on = chip.id === filter;
          const count = notificationFilterCount(notificationGroups, chip.id, readIds);
          return (
            <Pressable
              key={chip.id}
              onPress={() => setFilter(chip.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={count != null ? `${chip.label}, ${count}` : chip.label}
              style={({ pressed }) => [
                styles.chip,
                radiusStyle(7),
                {
                  backgroundColor: on ? theme.color.primary : me.chipIdleBackground,
                  borderColor: on ? theme.color.primary : me.chipIdleBorder,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                variant="caption"
                style={[styles.chipLabel, { color: on ? '#FFFFFF' : me.headingText }]}
              >
                {chip.label}
              </Text>
              {count != null ? (
                <Text
                  variant="caption"
                  style={[
                    styles.chipCount,
                    { color: on ? 'rgba(255,255,255,0.75)' : me.metaText },
                  ]}
                >
                  {count}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {groups.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="body" style={{ color: me.headingText, fontWeight: '600' }}>
            Nothing here
          </Text>
          <Text variant="bodySmall" style={[styles.emptyBody, { color: me.metaText }]}>
            No notifications match this filter.
          </Text>
        </View>
      ) : (
        groups.map((group, groupIndex) => (
          <View
            key={group.id}
            style={[
              styles.group,
              /* The rule separates one group from the previous one, so the
                 first has nothing to divide from — there it would just read
                 as an edge on the filter row above. */
              groupIndex > 0
                ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: me.rowDivider }
                : null,
            ]}
          >
            <Text variant="caption" style={[styles.groupLabel, { color: me.metaText }]}>
              {group.label}
            </Text>

            {group.items.map((item, index) => (
              <NotificationRow
                key={item.id}
                item={item}
                unread={isUnread(item, readIds)}
                last={index === group.items.length - 1}
                onPress={() => openNotification(item.id)}
              />
            ))}
          </View>
        ))
      )}

      <Text variant="caption" style={[styles.footer, { color: me.metaText }]}>
        {unreadCount === 0
          ? 'You’re caught up. Manage notification types in Settings.'
          : 'Manage notification types in Settings.'}
        </Text>
      </Animated.ScrollView>

      {/* Above the list, below the bar — drawn only once content scrolls up. */}
      <ScrollCurtain
        color={me.pageBackground}
        height={headerHeight + CURTAIN_FADE_DEPTH}
        blurHeight={headerHeight + CURTAIN_BLUR_DEPTH}
        blurred
        opacity={curtainOpacity}
      />
    </View>
  );
}

function NotificationRow({
  item,
  unread,
  last,
  onPress,
}: {
  item: NotificationItem;
  unread: boolean;
  last: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const me = useMeTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${unread ? 'Unread. ' : ''}${item.title}. ${item.body}. ${item.time}`}
      style={({ pressed }) => [
        styles.row,
        /* With the dot gone, the wash is the only thing marking unread. */
        unread ? { backgroundColor: `${theme.color.primary}0D` } : null,
        pressed ? { opacity: 0.65 } : null,
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          radiusStyle(9),
          { backgroundColor: `${theme.color.primary}1A` },
        ]}
      >
        <MaterialSymbol icon={item.icon} size={19} color={theme.color.primary} />
      </View>

      {/*
        The rule lives on the text column, not the row, so it starts where the
        copy starts and leaves the icon gutter clear — and it stays aligned
        without hard-coding the width of everything to its left.
      */}
      <View
        style={[
          styles.rowText,
          !last
            ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: me.listDivider }
            : null,
        ]}
      >
        <View style={styles.rowHead}>
          {/* Read titles step back a weight; unread holds the full one. */}
          <Text
            variant="bodySmall"
            numberOfLines={2}
            style={[
              styles.rowTitle,
              { color: me.headingText, fontWeight: unread ? '600' : '500' },
            ]}
          >
            {item.title}
          </Text>
          <Text variant="caption" style={[styles.rowTime, { color: me.metaText }]}>
            {item.time}
          </Text>
        </View>

        <Text variant="caption" style={[styles.rowBody, { color: me.metaText }]}>
          {item.body}
        </Text>

        {item.action ? (
          <View
            style={[
              styles.action,
              radiusStyle(6),
              { backgroundColor: theme.color.primary },
            ]}
          >
            <Text variant="caption" style={styles.actionLabel}>
              {item.action} →
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  chipScroll: {
    flexGrow: 0,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 4,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipLabel: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  chipCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  /*
    The rule runs full width while the item rules are inset, so the wider line
    reads as the bigger break — group above item — without needing to be any
    heavier. It sits above the padding, leaving air between it and the label.
    Applied per-group rather than here, since the first group has none.
  */
  group: {
    paddingTop: 16,
  },
  /*
    Sentence case, so no overline tracking: the 0.3 letter-spacing exists to
    open up all-caps, and on mixed case it just reads loose. Set a size larger
    than the caps version too — lowercase loses apparent weight at the same
    point size.
  */
  groupLabel: {
    fontSize: 15.5,
    fontWeight: '600',
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingBottom: 8,
  },
  /*
    No card: the rows sit straight on the page and run full width, so an
    unread row's wash reaches both edges the way a mail inbox does.
  */
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: ROW_PADDING_TOP,
    /** The gap below the copy is the text column's, so its rule sits at the
        bottom of the row rather than floating inside it. */
    paddingBottom: 0,
  },
  rowIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 14,
  },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  rowTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  },
  rowTime: {
    fontSize: 12,
    flexShrink: 0,
  },
  rowBody: {
    fontSize: 15.5,
    lineHeight: 21,
    marginTop: 4,
  },
  action: {
    alignSelf: 'flex-start',
    marginTop: 11,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: semanticSpacing.screenHorizontal,
  },
  emptyBody: {
    marginTop: 6,
    textAlign: 'center',
  },
  footer: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: semanticSpacing.screenHorizontal + 6,
  },
});
