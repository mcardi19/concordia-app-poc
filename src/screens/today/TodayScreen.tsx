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
import { HomeCompactTitle, HomeLargeTitle } from '@/navigation/HomeHeaderTitle';
import {
  largeHomeOpacityForScroll,
  nextTopBaseline,
  scrollDistanceFromTop,
} from '@/navigation/homeScrollTitle';
import { HEADER_BAR_BUTTON_SIZE } from '@/navigation/HeaderIconButton';
import { reportTabBarScrollOffset } from '@/navigation/tabBarMinimize';
import { useTabBarScrollInset } from '@/navigation/tabBarInset';
import type { TodayStackScreenProps } from '@/navigation/types';
import { todayTheme } from './todayTheme';

type Props = TodayStackScreenProps<'Today'>;

/** Masthead veil turns on with scroll and stays while scrolled. */
const GRADIENT_FADE_IN = [0, 20] as const;
const MASTHEAD_OVERLAP = 56;

const PAGE_BG = todayTheme.pageBackground;
const PAGE_BG_TRANSPARENT = 'rgba(247, 247, 248, 0)';

export function TodayScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarScrollInset();
  const inset = theme.spacing.screenHorizontal;
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastTabMinimizeYRef = useRef(0);
  const insetTopRef = useRef(0);
  const topBaselineRef = useRef<number | null>(null);
  const [largeHomeOpacity, setLargeHomeOpacity] = useState(1);

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
      unstable_headerLeftItems: () => [],
    });
  }, [navigation, scrollY, theme.color.text.primary]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentInset, adjustedContentInset } = event.nativeEvent;
      const reportedInset = adjustedContentInset?.top ?? contentInset?.top ?? 0;
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
      scrollY.setValue(y);
      const nextOpacity = largeHomeOpacityForScroll(y);
      setLargeHomeOpacity((prev) =>
        Math.abs(prev - nextOpacity) < 0.02 ? prev : nextOpacity,
      );

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

        {Platform.OS === 'ios' && largeHomeOpacity > 0.02 ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: insets.top,
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
              opacity={largeHomeOpacity}
            />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
