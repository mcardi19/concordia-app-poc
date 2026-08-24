import React, { useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { Text } from '@/components/design-system';
import {
  CURTAIN_BLUR_DEPTH,
  CURTAIN_FADE_DEPTH,
  CURTAIN_FADE_IN,
  ScrollCurtain,
} from '@/components/design-system/ScrollCurtain';
import { MaterialSymbol, msNotifications } from '@/components/icons';
import { radiusStyle, useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import {
  findNotification,
  notificationGroupLabel,
  NOTIFICATION_CATEGORY_LABEL,
} from './notificationsData';
import { useMeTheme } from './meTheme';
import type { MeStackScreenProps } from '@/navigation/types';

type Props = MeStackScreenProps<'NotificationDetail'>;

const ICON_SIZE = 52;

/**
 * One notification, opened from the inbox.
 *
 * The feed carries a title, a body and a time and nothing else, so this shows
 * those at a readable size rather than padding the page with invented detail.
 * Marking read stays with the list — it owns that state, and it marks on the
 * same tap that brings you here.
 */
export function NotificationDetailScreen({ route }: Props) {
  const theme = useTheme();
  const me = useMeTheme();
  const { id } = route.params;

  const item = findNotification(id);
  const groupLabel = notificationGroupLabel(id);

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

  /* Defensive: the id comes from route params, which outlive the feed. */
  if (!item) {
    return (
      <View style={[styles.root, styles.missing, { backgroundColor: me.pageBackground }]}>
        <Text variant="body" style={{ color: me.headingText, fontWeight: '600' }}>
          Notification unavailable
        </Text>
        <Text variant="bodySmall" style={[styles.missingBody, { color: me.metaText }]}>
          This notification is no longer in your inbox.
        </Text>
      </View>
    );
  }

  const received = groupLabel ? `${groupLabel} · ${item.time}` : item.time;

  return (
    <View style={[styles.root, { backgroundColor: me.pageBackground }]}>
      <Animated.ScrollView
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + 8 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        contentInsetAdjustmentBehavior="never"
      >
        <View style={[styles.icon, radiusStyle(14), { backgroundColor: `${theme.color.primary}1A` }]}>
          <MaterialSymbol icon={item.icon} size={26} color={theme.color.primary} />
        </View>

        <Text variant="caption" style={[styles.overline, { color: theme.color.primary }]}>
          {NOTIFICATION_CATEGORY_LABEL[item.category]}
        </Text>

        <Text variant="heading2" style={[styles.title, { color: me.headingText }]}>
          {item.title}
        </Text>

        <Text variant="bodySmall" style={[styles.received, { color: me.metaText }]}>
          {received}
        </Text>

        <View style={[styles.rule, { backgroundColor: me.listDivider }]} />

        <Text variant="body" style={[styles.body, { color: me.headingText }]}>
          {item.body}
        </Text>

        {/*
          Rendered because the feed carries the action, but it has nowhere to
          go yet — the screens these would open (payment plan, room change)
          are not built.
        */}
        {item.action ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.action}
            style={({ pressed }) => [
              styles.action,
              radiusStyle(10),
              { backgroundColor: theme.color.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text variant="body" style={styles.actionLabel}>
              {item.action}
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.footerRow}>
          <MaterialSymbol icon={msNotifications} size={16} color={me.metaText} />
          <Text variant="caption" style={[styles.footer, { color: me.metaText }]}>
            Manage notification types in Settings.
          </Text>
        </View>
      </Animated.ScrollView>

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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingBottom: 48,
  },
  missing: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: semanticSpacing.screenHorizontal,
  },
  missingBody: {
    marginTop: 6,
    textAlign: 'center',
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  overline: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.5,
    marginTop: 6,
  },
  received: {
    fontSize: 14,
    marginTop: 8,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 20,
  },
  body: {
    fontSize: 17,
    lineHeight: 25,
  },
  action: {
    alignSelf: 'flex-start',
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
  },
  footer: {
    flex: 1,
    minWidth: 0,
    fontSize: 12.5,
    lineHeight: 18,
  },
});
