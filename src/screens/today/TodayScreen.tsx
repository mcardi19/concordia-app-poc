import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/design-system';
import {
  CURTAIN_BLUR_DEPTH,
  CURTAIN_FADE_DEPTH,
  CURTAIN_FADE_IN,
  ScrollCurtain,
} from '@/components/design-system/ScrollCurtain';
import {
  ATTENTION_ITEMS,
  CAMPUS_TODAY,
  LATEST_UPDATES,
  usePinnedChipCatalog,
  TodayAttentionList,
  TodayCampusCarousel,
  TodayPinnedAddDrawer,
  TodayPinnedChips,
  TodaySectionHeader,
  TodaySessionCard,
  useTodaySession,
  TodayUpdatesCarousel,
  type PinnedChip,
} from '@/components/feature/today';
import { useTheme } from '@/design-system/theme';
import { GREETING_BLOCK_HEIGHT, HomeGreetingLarge } from '@/navigation/HomeHeaderTitle';
import { useNow } from '@/hooks';
import { HomeHeaderBar, HOME_HEADER_BAND } from '@/navigation/HomeHeaderBar';
import { reportTabBarScrollOffset } from '@/navigation/tabBarMinimize';
import { useTabBarContentPadding } from '@/navigation/tabBarInset';
import type { TodayStackScreenProps } from '@/navigation/types';
import { useTodayTheme } from './todayTheme';

type Props = TodayStackScreenProps<'Today'>;

/** Space between the in-flow greeting and the session card. */
const GREETING_TO_CARD_GAP = 8;
/** Same as the home ScrollView `gap` — used to compute the session-post snap. */
const SECTION_GAP = 40;
/** Extra space left above Pinned when the session card snaps away. */
const SNAP_ABOVE_PINNED = 24;
/**
 * Travel (pt) that has to be projected before a release counts as directional.
 * Below this the gesture is a twitch, and the post settles to whichever rest
 * position it is nearer.
 */
const SNAP_DIRECTION_EPSILON = 4;
/**
 * Android has no `targetContentOffset`, so momentum has to be projected from
 * the release velocity (points/ms) instead. Deliberately short: it only has to
 * resolve the direction of travel and roughly where it lands, and iOS — the
 * platform this screen is tuned on — never uses it.
 */
const ANDROID_MOMENTUM_PROJECTION_MS = 150;

const WEEKDAYS_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;
const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** e.g. Sunday, September 6 */
function formatHomeDateLong(date: Date): string {
  return `${WEEKDAYS_LONG[date.getDay()]}, ${MONTHS_LONG[date.getMonth()]} ${date.getDate()}`;
}

/** e.g. Sun, Sep 6 */
function formatHomeDateShort(date: Date): string {
  return `${WEEKDAYS_SHORT[date.getDay()]}, ${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
}

export function TodayScreen({ navigation }: Props) {
  const theme = useTheme();
  const todayTheme = useTodayTheme();
  const PAGE_BG = todayTheme.pageBackground;
  const insets = useSafeAreaInsets();
  const tabBarPadding = useTabBarContentPadding();
  const inset = theme.spacing.screenHorizontal;
  const todaySession = useTodaySession();
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastTabMinimizeYRef = useRef(0);
  const { chips: defaultChips, catalog: pinnedChipCatalog } = usePinnedChipCatalog();
  const [isPinnedEditing, setIsPinnedEditing] = useState(false);
  /*
    Only ids are kept in state — a chip's iconColor depends on the active
    theme, so storing full chip objects would freeze whichever colors were
    current when a chip was pinned instead of tracking theme changes.
  */
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => defaultChips.map((chip) => chip.id));
  const pinnedChips = useMemo(
    () =>
      pinnedIds
        .map((id) => pinnedChipCatalog.find((chip) => chip.id === id))
        .filter((chip): chip is PinnedChip => Boolean(chip)),
    [pinnedIds, pinnedChipCatalog],
  );
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  /**
   * Pinned's own top edge in content coordinates, straight off its layout,
   * rather than reconstructed from the hero block's height. The derived
   * version had to restate the container's `paddingTop` and the flex `gap` to
   * agree with the real position, and silently drifted from it whenever either
   * changed.
   */
  const pinnedTopRef = useRef(0);
  const dragStartYRef = useRef(0);

  const gradientOpacity = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [...CURTAIN_FADE_IN, 9999],
        outputRange: [0, 1, 1],
        extrapolate: 'clamp',
      }),
    [scrollY],
  );

  /* Live clock so the date rolls over at midnight rather than at next launch. */
  const now = useNow();
  const dateLabelLong = useMemo(() => formatHomeDateLong(now), [now]);
  const dateLabelShort = useMemo(() => formatHomeDateShort(now), [now]);

  /*
    Sized to the action-chrome band the screen draws over itself (Home
    sets `headerShown: false`), plus the curtain's own depths past it. The blur
    stops well short of the colour fade on purpose — a BlurView has a hard
    bottom edge, so it has to end while the wash above still has enough body to
    hide the seam.
  */
  const chromeBandHeight = insets.top + HOME_HEADER_BAND;
  const gradientHeight = chromeBandHeight + CURTAIN_FADE_DEPTH;
  const curtainBlurHeight = chromeBandHeight + CURTAIN_BLUR_DEPTH;

  /*
    One coordinate space for everything below.

    The ScrollView is `contentInsetAdjustmentBehavior="never"` and holds its
    own `paddingTop`, so the resting `contentOffset.y` is 0 and the raw offset
    already *is* the distance from the top. That matters beyond tidiness:
    `scrollTo` takes raw content offset, so a target computed in any other
    space lands somewhere else and then fights the bounce. The inset-adjusted
    reading this used to do belongs to `"automatic"`, where the resting offset
    is negative.

    Clamped at 0 so the top rubber-band reads as "at the top" rather than
    driving the fades backwards.
  */
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = Math.max(0, event.nativeEvent.contentOffset.y);
      // The only per-frame write. Both titles interpolate off this value, so
      // scrolling drives the fade without re-rendering the screen.
      scrollY.setValue(y);

      reportTabBarScrollOffset(y, lastTabMinimizeYRef.current);
      lastTabMinimizeYRef.current = y;
    },
    [scrollY],
  );

  /**
   * The offset that puts Pinned's header just under the Home chrome, with
   * `SNAP_ABOVE_PINNED` of air above it. 0 until Pinned has laid out.
   */
  const pinnedRestOffset = useCallback(() => {
    const pinnedTop = pinnedTopRef.current;
    if (pinnedTop <= 0) return 0;
    return Math.max(0, pinnedTop - chromeBandHeight - SNAP_ABOVE_PINNED);
  }, [chromeBandHeight]);

  const onScrollBeginDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      dragStartYRef.current = Math.max(0, event.nativeEvent.contentOffset.y);
    },
    [],
  );

  /**
   * The session card is a discrete “post”. Down from it always lands on
   * Pinned. Up from Pinned (or from anywhere that would come to rest inside
   * the post region) lands back on the card. Past Pinned the page is free.
   *
   * Decided here and nowhere else. iOS hands us `targetContentOffset` — where
   * its own deceleration *would* come to rest — so the whole gesture can be
   * resolved at the moment the finger lifts, before any momentum is visible.
   * Snapping again from `onMomentumScrollEnd` is what produced the overshoot:
   * a flick was allowed to decelerate somewhere first and then got dragged
   * back, which reads as a rubber-band. Acting on the projection instead means
   * a slow drag and a hard flick take the same path to the same two offsets,
   * and the deceleration is cancelled rather than raced.
   */
  const onScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const pinAt = pinnedRestOffset();
      if (pinAt <= 1) return;

      const { contentOffset, velocity, targetContentOffset } = event.nativeEvent;
      /* iOS only; Android falls back to projecting the release velocity. */
      const projected =
        targetContentOffset?.y ??
        contentOffset.y + (velocity?.y ?? 0) * ANDROID_MOMENTUM_PROJECTION_MS;

      const start = dragStartYRef.current;
      const travel = projected - start;
      /* Inside the post region, i.e. the card is still at least partly up. */
      const startedInPost = start < pinAt - SNAP_DIRECTION_EPSILON;
      const restsInPost = projected < pinAt - SNAP_DIRECTION_EPSILON;

      let target: number | null = null;
      if (travel > SNAP_DIRECTION_EPSILON) {
        // Leaving the card in either a nudge or a flick lands on Pinned.
        // Started at or past it already: the rest of the page is free.
        if (startedInPost) target = pinAt;
      } else if (travel < -SNAP_DIRECTION_EPSILON) {
        // Up out of Pinned, or up into the post region from further down.
        if (restsInPost || start <= pinAt + SNAP_DIRECTION_EPSILON) target = 0;
      } else if (restsInPost) {
        // Released without real travel — settle to the nearer rest position.
        target = projected > pinAt / 2 ? pinAt : 0;
      }

      if (target == null) return;
      // Already coming to rest there — including the top bounce, whose
      // projection is 0. Let the platform finish rather than interrupting it.
      if (Math.abs(projected - target) < 2) return;

      dragStartYRef.current = target;
      scrollRef.current?.scrollTo({ y: target, animated: true });
    },
    [pinnedRestOffset],
  );

  const handleChipPress = useCallback(
    (chip: PinnedChip) => {
      if (chip.account) {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'Account',
            ...(chip.accountRoute ? { params: { screen: chip.accountRoute } } : {}),
          }),
        );
        return;
      }
      if (!chip.tab) return;

      if (chip.campusRoute) {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'Campus',
            params: { screen: chip.campusRoute },
          }),
        );
        return;
      }
      navigation.dispatch(CommonActions.navigate({ name: chip.tab }));
    },
    [navigation],
  );

  const handleChipDelete = useCallback((chip: PinnedChip) => {
    Alert.alert(
      'Remove pin?',
      `Remove ${chip.label} from Pinned?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPinnedIds((current) => current.filter((id) => id !== chip.id));
          },
        },
      ],
    );
  }, []);

  const addableChips = useMemo(() => {
    const pinnedIdSet = new Set(pinnedIds);
    return pinnedChipCatalog.filter((chip) => !pinnedIdSet.has(chip.id));
  }, [pinnedIds, pinnedChipCatalog]);

  const handleAddChip = useCallback((chip: PinnedChip) => {
    setPinnedIds((current) => (current.includes(chip.id) ? current : [...current, chip.id]));
  }, []);

  return (
    <Screen
      edges={[]}
      padded={false}
      style={{ backgroundColor: todayTheme.pageBackground }}
    >
      <View style={{ flex: 1 }} collapsable={false}>
        <LinearGradient
          pointerEvents="none"
          colors={[todayTheme.pageWash, todayTheme.pageWash, todayTheme.pageBackground]}
          locations={[0, 0.18, 0.48]}
          style={styles.pageWash}
        />
        <Animated.ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            paddingTop: chromeBandHeight + theme.spacing.sm,
            paddingBottom: tabBarPadding,
            gap: SECTION_GAP,
          }}
          contentInsetAdjustmentBehavior="never"
          scrollEventThrottle={1}
          onScroll={onScroll}
          onScrollBeginDrag={onScrollBeginDrag}
          onScrollEndDrag={onScrollEndDrag}
          showsVerticalScrollIndicator={false}
        >
          <View collapsable={false} style={{ paddingHorizontal: inset }}>
            <View
              style={{
                height: GREETING_BLOCK_HEIGHT,
                marginBottom: GREETING_TO_CARD_GAP,
              }}
            >
              <HomeGreetingLarge
                dateLabel={dateLabelLong}
                color={theme.color.text.primary}
                subtitleColor={theme.color.text.subtler}
                scrollY={scrollY}
              />
            </View>
            <TodaySessionCard session={todaySession} />
          </View>

          <View
            collapsable={false}
            /* `layout.y` is already in content coordinates — container
               padding and the flex gap are baked in, which is the point. */
            onLayout={(event) => {
              pinnedTopRef.current = event.nativeEvent.layout.y;
            }}
            style={{ paddingHorizontal: inset }}
          >
            <TodaySectionHeader
              title="Pinned"
              actionLabel={isPinnedEditing ? 'Done' : 'Edit'}
              onActionPress={() => setIsPinnedEditing((current) => !current)}
            />
            <TodayPinnedChips
              chips={pinnedChips}
              isEditing={isPinnedEditing}
              onChipPress={handleChipPress}
              onChipDelete={handleChipDelete}
              onAddPress={() => setIsAddDrawerOpen(true)}
            />
          </View>

          <View style={{ paddingHorizontal: inset }}>
            <TodaySectionHeader title="Needs attention" showChevron marginBottom={8} />
            <TodayAttentionList items={ATTENTION_ITEMS} />
          </View>

          <View>
            <View style={{ paddingHorizontal: inset }}>
              <TodaySectionHeader title="Latest updates" showChevron />
            </View>
            <TodayUpdatesCarousel items={LATEST_UPDATES} />
          </View>

          <View>
            <View style={{ paddingHorizontal: inset }}>
              <TodaySectionHeader
                title="Campus events"
                showChevron
                onPress={() => navigation.navigate('CampusToday')}
              />
            </View>
            <TodayCampusCarousel items={CAMPUS_TODAY} />
          </View>
        </Animated.ScrollView>

        <ScrollCurtain
          color={PAGE_BG}
          height={gradientHeight}
          blurHeight={curtainBlurHeight}
          blurred
          opacity={gradientOpacity}
        />

        <HomeHeaderBar
          onEmergency={() => navigation.navigate('Emergency')}
          onSearch={() => navigation.navigate('Search')}
          onNotifications={() =>
            navigation.dispatch(
              CommonActions.navigate('Account', { screen: 'Notifications' }),
            )
          }
          onProfile={() => navigation.dispatch(CommonActions.navigate('Account'))}
          dateLabel={dateLabelShort}
          scrollY={scrollY}
        />
      </View>

      <TodayPinnedAddDrawer
        visible={isAddDrawerOpen}
        options={addableChips}
        onSelect={handleAddChip}
        onClose={() => setIsAddDrawerOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  /** Pinned to the viewport so the wash stays while the page scrolls. */
  pageWash: {
    position: 'absolute',
    top: -240,
    right: 0,
    bottom: 0,
    left: 0,
  },
});
