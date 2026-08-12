import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  MeAccountsGrid,
  MeCollectionSheet,
  MeCommunitySection,
  MeHeaderChrome,
  MeIdCardRow,
  MeProfileHero,
  MeStatusGrid,
  ID_CARD_OVERLAP,
  heroStretch,
  type MeCollectionRow,
} from '@/components/feature/me';
import { reportTabBarScrollOffset } from '@/navigation/tabBarMinimize';
import { useTabBarContentPadding } from '@/navigation/tabBarInset';
import { useAuthStore } from '@/state/authStore';
import { useAccountBalance } from '@/hooks/useAccountBalance';
import { sumAccountBalance } from '@/api/balance';
import type { MeStackScreenProps } from '@/navigation/types';
import type { MeAccountTile, MeDestination, MeStatusCard } from '@/types/profile';
import {
  meAccountTiles,
  meCommunities,
  meFavouriteServices,
  meNotificationCount,
  meProfileStats,
  meStatusCards,
  profileFromAuthUser,
} from './accountData';
import { meTheme } from './meTheme';

type Props = MeStackScreenProps<'MeHome'>;

type OpenCollection = 'communities' | 'favourites' | null;

export function MeHomeScreen({ navigation }: Props) {
  const tabBarPadding = useTabBarContentPadding();
  const user = useAuthStore((s) => s.user);
  const { data: balanceData } = useAccountBalance();

  const scrollY = useSharedValue(0);
  const lastTabMinimizeY = useSharedValue(0);

  /**
   * Measured rather than assumed: the card's height moves with the type scale,
   * and half of it is what puts the masthead edge across its midpoint. The
   * hero reserves the same figure, so both stay in step.
   */
  const [idCardHeight, setIdCardHeight] = useState(ID_CARD_OVERLAP * 2);
  const idCardOverlap = Math.round(idCardHeight / 2);

  const [open, setOpen] = useState<OpenCollection>(null);
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(
    () => new Set([...meCommunities, ...meFavouriteServices].map((item) => item.id)),
  );

  const profile = useMemo(() => profileFromAuthUser(user), [user]);

  /**
   * The app sets `StatusBar style="auto"`, which resolves to dark glyphs — the
   * burgundy hero runs under the status bar, so this tab needs light ones.
   * Scoped to focus so the other tabs keep the default.
   */
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('auto');
    }, []),
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      scrollY.value = y;
      runOnJS(reportTabBarScrollOffset)(y, lastTabMinimizeY.value);
      lastTabMinimizeY.value = y;
    },
  });

  /**
   * Hold the grey section's top edge against the stretched masthead edge: the
   * rubber-band has already carried it down by the full pull, so give back
   * everything past the damped stretch. The ID card rides this wrapper, which
   * is what keeps it straddling the header edge at a constant offset.
   */
  const bodyStyle = useAnimatedStyle(() => {
    const pull = Math.max(0, -scrollY.value);
    return { transform: [{ translateY: heroStretch(scrollY.value) - pull }] };
  });

  /**
   * Everything below the ID card keeps travelling with the finger — undoing
   * the wrapper's offset restores the full pull — so the gap between the ID
   * card and the cards below opens as the header grows. The uncovered strip
   * this leaves at the very bottom of the grey sits far off-screen: top
   * overscroll only happens with the page scrolled to the top.
   */
  const bodyContentStyle = useAnimatedStyle(() => {
    const pull = Math.max(0, -scrollY.value);
    return { transform: [{ translateY: pull - heroStretch(scrollY.value) }] };
  });

  /** Live balance replaces the design's static figure when the API returns one. */
  const statusCards: MeStatusCard[] = useMemo(() => {
    const total = balanceData?.tutAccountList
      ? sumAccountBalance(balanceData.tutAccountList)
      : null;
    if (total == null || total === 0) {
      return meStatusCards;
    }
    return meStatusCards.map((card) =>
      card.id === 'finances'
        ? { ...card, stat: `$${Math.round(total).toLocaleString('en-CA')}` }
        : card,
    );
  }, [balanceData]);

  const go = useCallback(
    (route: MeDestination | undefined) => {
      if (route) {
        navigation.navigate(route);
      }
    },
    [navigation],
  );

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const sheetRows: MeCollectionRow[] = useMemo(() => {
    if (open === 'communities') {
      return meCommunities.map((c) => ({
        id: c.id,
        name: c.name,
        subtitle: c.subtitle,
        monogram: c.monogram,
        tint: c.tint,
      }));
    }
    if (open === 'favourites') {
      return meFavouriteServices.map((f) => ({
        id: f.id,
        name: f.name,
        subtitle: f.subtitle,
        monogram: f.monogram,
      }));
    }
    return [];
  }, [open]);

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        // 1, not 16: the hero pins content against the rubber-band, so an
        // event per frame is required — at 16ms the pinned content lags the
        // scroll on a 120Hz display and visibly jitters.
        scrollEventThrottle={1}
        onScroll={onScroll}
        // Hero runs under the status bar; safe-area is handled inside the masthead.
        contentInsetAdjustmentBehavior="never"
      >
        <MeProfileHero
          profile={profile}
          stats={meProfileStats}
          scrollY={scrollY}
          idCardOverlap={idCardOverlap}
          onEditPress={() => navigation.navigate('Profile')}
        />

        {/*
          Page fill lives on the body, not the ScrollView — iOS rubber-band
          reveals the scroll view background, which must stay primary so the
          masthead wash reads continuous at the top. For the same reason the
          tab-bar inset is padding *inside* the body: as contentContainer
          padding it would expose primary behind the tab bar at the end of
          the page.
        */}
        <Animated.View style={[styles.body, bodyStyle, { paddingBottom: tabBarPadding }]}>
          <View
            style={{ marginTop: -idCardOverlap }}
            onLayout={(e) => setIdCardHeight(e.nativeEvent.layout.height)}
          >
            <MeIdCardRow profile={profile} onPress={() => navigation.navigate('Profile')} />
          </View>

          <Animated.View style={bodyContentStyle}>
            <MeStatusGrid cards={statusCards} onCardPress={(card) => go(card.route)} />

            <MeAccountsGrid
              tiles={meAccountTiles}
              onTilePress={(tile: MeAccountTile) => go(tile.route)}
            />

            <MeCommunitySection
              communities={meCommunities}
              favourites={meFavouriteServices}
              onOpenCommunities={() => setOpen('communities')}
              onOpenFavourites={() => setOpen('favourites')}
            />
          </Animated.View>
        </Animated.View>
      </Animated.ScrollView>

      <MeHeaderChrome
        notificationCount={meNotificationCount}
        onSettingsPress={() => navigation.navigate('Settings')}
      />

      <MeCollectionSheet
        title={
          open === 'communities'
            ? 'Your communities'
            : open === 'favourites'
              ? 'Favourite services'
              : null
        }
        rows={sheetRows}
        shape={open === 'communities' ? 'circle' : 'rounded'}
        savedIds={savedIds}
        onToggleSaved={toggleSaved}
        onClose={() => setOpen(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  /**
   * Carries the page fill. The scroll view must stay transparent: the tab bar
   * keeps a bottom content inset even at `contentInsetAdjustmentBehavior
   * "never"`, and a fill there paints primary into the strip under the bar
   * once the page is scrolled to the end. The top bounce gap needs no fill
   * either — the hero wash stretches up to cover it.
   */
  root: {
    flex: 1,
    backgroundColor: meTheme.pageBackground,
  },
  scroll: {
    flex: 1,
  },
  body: {
    backgroundColor: meTheme.pageBackground,
  },
});
