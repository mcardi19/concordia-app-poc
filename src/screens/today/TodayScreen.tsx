import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/design-system';
import {
  ATTENTION_ITEMS,
  CAMPUS_TODAY,
  LATEST_UPDATES,
  PINNED_CHIPS,
  TODAY_SESSION,
  TodayAttentionList,
  TodayCampusCarousel,
  TodayPinnedChips,
  TodaySectionHeader,
  TodaySessionCard,
  TodayUpdatesCarousel,
  type PinnedChip,
} from '@/components/feature/today';
import { useTheme } from '@/design-system/theme';
import { buildHomeExpandedLeftItems, HomeCompactTitle } from '@/navigation/HomeHeaderTitle';
import { HEADER_BAR_BUTTON_SIZE } from '@/navigation/HeaderIconButton';
import { reportTabBarScrollOffset } from '@/navigation/tabBarMinimize';
import { useTabBarScrollInset } from '@/navigation/tabBarInset';
import type { TodayStackScreenProps } from '@/navigation/types';
import { todayTheme } from './todayTheme';

type Props = TodayStackScreenProps<'Today'>;

/** Masthead veil turns on with scroll and stays while scrolled. */
const GRADIENT_FADE_IN = [0, 20] as const;
const MASTHEAD_OVERLAP = 56;
/** Treat as “at top” within this delta of the resting offset. */
const AT_TOP_EPSILON = 0.5;

const PAGE_BG = todayTheme.pageBackground;
const PAGE_BG_TRANSPARENT = 'rgba(247, 247, 248, 0)';

export function TodayScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarScrollInset();
  const inset = theme.spacing.screenHorizontal;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showLargeHome, setShowLargeHome] = useState(true);
  const showLargeHomeRef = useRef(true);
  /** Raw contentOffset.y when the list is at rest (handles inset quirks). */
  const restOffsetYRef = useRef<number | null>(null);
  const lastTabMinimizeYRef = useRef(0);

  const gradientOpacity = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [...GRADIENT_FADE_IN, 9999],
        outputRange: [0, 1, 1],
        extrapolate: 'clamp',
      }),
    [scrollY],
  );

  const gradientHeight = insets.top + HEADER_BAR_BUTTON_SIZE + MASTHEAD_OVERLAP;

  const setLargeHomeVisible = useCallback((visible: boolean) => {
    if (visible === showLargeHomeRef.current) return;
    showLargeHomeRef.current = visible;
    setShowLargeHome(visible);
  }, []);

  useLayoutEffect(() => {
    if (Platform.OS !== 'ios') return;

    navigation.setOptions({
      title: '',
      headerTransparent: true,
      headerShadowVisible: false,
      headerStyle: undefined,
      headerTitle: () => (
        <HomeCompactTitle color={theme.color.text.primary} scrollY={scrollY} />
      ),
      // Hard-remove (not fade) so the card can never clip mid-glyph.
      unstable_headerLeftItems: () =>
        showLargeHome ? buildHomeExpandedLeftItems(theme.color.text.primary) : [],
    });
  }, [navigation, scrollY, showLargeHome, theme.color.text.primary]);

  const onScrollBeginDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      restOffsetYRef.current = event.nativeEvent.contentOffset.y;
      // Hide immediately when the user starts scrolling down.
      setLargeHomeVisible(false);
    },
    [setLargeHomeVisible],
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const rawY = event.nativeEvent.contentOffset.y;
      reportTabBarScrollOffset(rawY, lastTabMinimizeYRef.current);
      lastTabMinimizeYRef.current = rawY;
      if (restOffsetYRef.current == null) {
        restOffsetYRef.current = rawY;
      }
      const y = Math.max(0, rawY - restOffsetYRef.current);
      scrollY.setValue(y);
      // Only hide here — restore happens when scroll settles back at top.
      if (y > AT_TOP_EPSILON) {
        setLargeHomeVisible(false);
      }
    },
    [scrollY, setLargeHomeVisible],
  );

  const onScrollSettle = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const rawY = event.nativeEvent.contentOffset.y;
      if (restOffsetYRef.current == null) {
        restOffsetYRef.current = rawY;
      }
      const y = Math.max(0, rawY - restOffsetYRef.current);
      scrollY.setValue(y);
      setLargeHomeVisible(y <= AT_TOP_EPSILON);
    },
    [scrollY, setLargeHomeVisible],
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
            gap: 36,
          }}
          contentInsetAdjustmentBehavior="automatic"
          scrollEventThrottle={16}
          onScrollBeginDrag={onScrollBeginDrag}
          onScroll={onScroll}
          onScrollEndDrag={onScrollSettle}
          onMomentumScrollEnd={onScrollSettle}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: inset }}>
            <TodaySessionCard session={TODAY_SESSION} />
          </View>

          <View style={{ paddingHorizontal: inset }}>
            <TodaySectionHeader title="Pinned" actionLabel="Edit" />
            <TodayPinnedChips chips={PINNED_CHIPS} onChipPress={handleChipPress} />
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

        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            height: gradientHeight,
            opacity: gradientOpacity,
          }}
        >
          <LinearGradient
            colors={[
              PAGE_BG,
              'rgba(247, 247, 248, 0.96)',
              'rgba(247, 247, 248, 0.82)',
              'rgba(247, 247, 248, 0.55)',
              'rgba(247, 247, 248, 0.28)',
              'rgba(247, 247, 248, 0.1)',
              PAGE_BG_TRANSPARENT,
            ]}
            locations={[0, 0.22, 0.4, 0.58, 0.74, 0.88, 1]}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </View>
    </Screen>
  );
}
