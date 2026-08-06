import React, { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
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
  const tabBarInset = useFloatingTabBarScrollInset();
  const inset = theme.spacing.screenHorizontal;

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
      edges={['top']}
      padded={false}
      style={{ backgroundColor: todayTheme.pageBackground }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: tabBarInset,
          gap: 36,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: inset }}>
          <TodayMasthead greeting={getGreeting()} dateLabel={formatMastheadDate()} />
        </View>

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
      </ScrollView>
    </Screen>
  );
}
