import React, { useCallback, useRef, useState } from 'react';
import { Animated, View, type LayoutChangeEvent } from 'react-native';
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
  TodayMasthead,
  TodayPinnedChips,
  TodaySectionHeader,
  TodaySessionCard,
  TodayUpdatesCarousel,
  type PinnedChip,
} from '@/components/feature/today';
import { useTheme } from '@/design-system/theme';
import { useFloatingTabBarScrollInset } from '@/navigation/FloatingTabBar';
import type { TodayStackScreenProps } from '@/navigation/types';
import { todayTheme } from './todayTheme';

type Props = TodayStackScreenProps<'Today'>;

/** Fade greeting/date out before the session card scrolls into that space. */
const TITLE_FADE_DISTANCE = 20;
/** Fade masthead gradient in as content scrolls underneath. */
const GRADIENT_FADE_DISTANCE = 24;
/** Clear space between masthead content and the session card. */
const MASTHEAD_GAP = 20;
/** How far the masthead gradient extends past the actions over the content. */
const MASTHEAD_OVERLAP = 56;

const PAGE_BG = todayTheme.pageBackground;
const PAGE_BG_TRANSPARENT = 'rgba(247, 247, 248, 0)';

function formatMastheadDate(date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function getGreeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function TodayScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useFloatingTabBarScrollInset();
  const inset = theme.spacing.screenHorizontal;

  const [mastheadHeight, setMastheadHeight] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, TITLE_FADE_DISTANCE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const gradientOpacity = scrollY.interpolate({
    inputRange: [0, GRADIENT_FADE_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

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

  const handleMastheadLayout = useCallback((event: LayoutChangeEvent) => {
    setMastheadHeight(event.nativeEvent.layout.height);
  }, []);

  const handleScroll = useRef(
    Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
      useNativeDriver: true,
    }),
  ).current;

  return (
    <Screen
      edges={[]}
      padded={false}
      style={{ backgroundColor: todayTheme.pageBackground }}
    >
      <View style={{ flex: 1 }}>
        <View
          onLayout={handleMastheadLayout}
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: gradientOpacity,
            }}
          >
            <LinearGradient
              colors={[
                PAGE_BG,
                'rgba(247, 247, 248, 0.92)',
                'rgba(247, 247, 248, 0.7)',
                'rgba(247, 247, 248, 0.4)',
                'rgba(247, 247, 248, 0.15)',
                PAGE_BG_TRANSPARENT,
              ]}
              locations={[0, 0.22, 0.42, 0.62, 0.82, 1]}
              style={{ flex: 1 }}
            />
          </Animated.View>
          <View
            pointerEvents="box-none"
            style={{
              paddingHorizontal: inset,
              paddingTop: insets.top + theme.spacing.sm,
              paddingBottom: MASTHEAD_GAP + MASTHEAD_OVERLAP,
            }}
          >
            <TodayMasthead
              greeting={getGreeting()}
              dateLabel={formatMastheadDate()}
              titleOpacity={titleOpacity}
            />
          </View>
        </View>

        <Animated.ScrollView
          contentContainerStyle={{
            // Leave the gradient fade overlapping the top of the session card.
            paddingTop:
              Math.max((mastheadHeight || insets.top + theme.spacing.sm + 92) - MASTHEAD_OVERLAP, 0),
            paddingBottom: tabBarInset,
            gap: 36,
          }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
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
      </View>
    </Screen>
  );
}
