import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import {
  MeAccountsGrid,
  MeCollectionSheet,
  MeCommunitySection,
  MeIdCardRow,
  MeProfileHero,
  MeStatusGrid,
  type MeCollectionRow,
} from '@/components/feature/me';
import { useTabBarMinimizeScrollHandler } from '@/navigation/tabBarMinimize';
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

/** ID card overlaps the hero's lower edge. */
const ID_CARD_OVERLAP = -34;

export function MeHomeScreen({ navigation }: Props) {
  const tabBarPadding = useTabBarContentPadding();
  const onTabBarMinimizeScroll = useTabBarMinimizeScrollHandler();
  const user = useAuthStore((s) => s.user);
  const { data: balanceData } = useAccountBalance();

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
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarPadding }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onTabBarMinimizeScroll}
        // Hero runs under the status bar; let it stretch on overscroll.
        contentInsetAdjustmentBehavior="never"
      >
        <MeProfileHero
          profile={profile}
          stats={meProfileStats}
          notificationCount={meNotificationCount}
          onEditPress={() => navigation.navigate('Profile')}
          onSettingsPress={() => navigation.navigate('Settings')}
        />

        <View style={{ marginTop: ID_CARD_OVERLAP }}>
          <MeIdCardRow profile={profile} onPress={() => navigation.navigate('Profile')} />
        </View>

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
      </ScrollView>

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
  root: {
    flex: 1,
    backgroundColor: meTheme.pageBackground,
  },
});
