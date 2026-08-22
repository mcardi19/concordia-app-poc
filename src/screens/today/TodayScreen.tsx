import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/design-system';
import { CURTAIN_FADE_IN, ScrollCurtain } from '@/components/design-system/ScrollCurtain';
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
import { HomeCompactTitle, HomeLargeTitle } from '@/navigation/HomeHeaderTitle';
import {
  nextTopBaseline,
  scrollDistanceFromTop,
} from '@/navigation/homeScrollTitle';
import { HEADER_BAR_BUTTON_SIZE, HEADER_CHROME_TOP_GAP } from '@/navigation/HeaderIconButton';
import { reportTabBarScrollOffset } from '@/navigation/tabBarMinimize';
import { useTabBarScrollInset } from '@/navigation/tabBarInset';
import type { TodayStackScreenProps } from '@/navigation/types';
import { useTodayTheme } from './todayTheme';

type Props = TodayStackScreenProps<'Today'>;

/** Masthead veil turns on with scroll and stays while scrolled. */
const MASTHEAD_OVERLAP = 56;

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

  const gradientHeight = insets.top + HEADER_CHROME_TOP_GAP + HEADER_BAR_BUTTON_SIZE + MASTHEAD_OVERLAP;

  useLayoutEffect(() => {
    if (Platform.OS !== 'ios') return;

    navigation.setOptions({
      title: '',
      headerTransparent: true,
      headerShadowVisible: false,
      headerStyle: undefined,
      /*
        iOS 26 blurs content passing under the header itself. `headerBlurEffect`
        is the alternative and gives the bar a real material — better for the
        compact title, but it draws over this screen's own large-title overlay,
        which lives beneath the native header. Documented as conflicting, so
        only one; this is the one that keeps both states working.
      */
      scrollEdgeEffects: { top: 'soft' },
      headerTitle: () => (
        <HomeCompactTitle color={theme.color.text.primary} scrollY={scrollY} />
      ),
      unstable_headerLeftItems: () => [],
    });
  }, [navigation, scrollY, theme.color.text.primary]);

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
      if (!chip.tab) return;

      if (chip.meRoute) {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'Me',
            params: { screen: chip.meRoute },
          }),
        );
        return;
      }
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
            paddingTop: theme.spacing.sm,
            paddingBottom: tabBarInset,
            gap: 40,
          }}
          contentInsetAdjustmentBehavior="automatic"
          scrollEventThrottle={1}
          onScroll={onScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: inset }}>
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
              <TodaySectionHeader title="Campus today" showChevron />
            </View>
            <TodayCampusCarousel items={CAMPUS_TODAY} />
          </View>
        </Animated.ScrollView>

        <ScrollCurtain color={PAGE_BG} height={gradientHeight} opacity={gradientOpacity} />

        {/*
          Mounted for the life of the screen, not while it happens to be
          visible. Gating on opacity unmounted and remounted it mid-scroll,
          rebuilding its animated nodes at the moment they were being driven.
        */}
        {Platform.OS === 'ios' ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: insets.top + HEADER_CHROME_TOP_GAP,
              left: inset,
              right: inset,
              zIndex: 12,
              height: HEADER_BAR_BUTTON_SIZE,
              justifyContent: 'center',
            }}
          >
            <HomeLargeTitle
              color={theme.color.text.primary}
              scrollY={scrollY}
            />
          </View>
        ) : null}

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
