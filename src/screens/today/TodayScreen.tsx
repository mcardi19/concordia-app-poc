import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
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
import {
  nextTopBaseline,
  scrollDistanceFromTop,
} from '@/navigation/homeScrollTitle';
import { HomeHeaderBar, HOME_HEADER_BAND } from '@/navigation/HomeHeaderBar';
import { reportTabBarScrollOffset } from '@/navigation/tabBarMinimize';
import { useTabBarScrollInset } from '@/navigation/tabBarInset';
import type { TodayStackScreenProps } from '@/navigation/types';
import { useTodayTheme } from './todayTheme';

type Props = TodayStackScreenProps<'Today'>;

/** Space between the in-flow greeting and the session card. */
const GREETING_TO_CARD_GAP = 8;

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
  const tabBarInset = useTabBarScrollInset();
  const inset = theme.spacing.screenHorizontal;
  const todaySession = useTodaySession();
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastTabMinimizeYRef = useRef(0);
  const insetTopRef = useRef(0);
  const topBaselineRef = useRef<number | null>(null);
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

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentInset } = event.nativeEvent;
      /*
        iOS reports `adjustedContentInset` — safe area and transparent header
        folded in — but React Native's typings omit it. It is the value that
        matters: `contentInset` alone is 0 under automatic inset adjustment.
      */
      const adjusted = (
        event.nativeEvent as NativeScrollEvent & {
          adjustedContentInset?: { top?: number };
        }
      ).adjustedContentInset;
      const reportedInset = adjusted?.top ?? contentInset?.top ?? 0;
      if (reportedInset > 0) {
        insetTopRef.current = reportedInset;
      }
      topBaselineRef.current = nextTopBaseline(
        contentOffset.y,
        topBaselineRef.current,
      );

      const y = scrollDistanceFromTop(
        contentOffset.y,
        insetTopRef.current,
        topBaselineRef.current,
      );
      // The only per-frame write. Both titles interpolate off this value, so
      // scrolling drives the fade without re-rendering the screen.
      scrollY.setValue(y);

      reportTabBarScrollOffset(y, lastTabMinimizeYRef.current);
      lastTabMinimizeYRef.current = y;
    },
    [scrollY],
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
        <Animated.ScrollView
          contentContainerStyle={{
            // Clear the self-drawn action chrome (the native header is
            // hidden). Safe-area top is still handled by the automatic inset.
            paddingTop: HOME_HEADER_BAND + theme.spacing.sm,
            paddingBottom: tabBarInset,
            gap: 40,
          }}
          contentInsetAdjustmentBehavior="automatic"
          scrollEventThrottle={1}
          onScroll={onScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: inset }}>
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

          <View style={{ paddingHorizontal: inset }}>
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
            <TodaySectionHeader title="Needs attention" showChevron />
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
