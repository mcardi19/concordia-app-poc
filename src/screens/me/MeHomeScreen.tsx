import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Screen } from '@/components/design-system';
import {
  AccountHeader,
  AccountSettingsList,
  BalanceSummaryCards,
  DegreeProgressSection,
  StudentIdCard,
} from '@/components/feature/me';
import { useTheme } from '@/design-system/theme';
import { useAuthStore } from '@/state/authStore';
import { useAccountBalance } from '@/hooks/useAccountBalance';
import { sumAccountBalance } from '@/api/balance';
import type { MeStackScreenProps } from '@/navigation/types';
import type { AccountBalanceSummary, SettingsRow } from '@/types/profile';
import {
  accountSettingsRows,
  defaultBalanceSummary,
  defaultDegreeProgress,
  profileFromAuthUser,
} from './accountData';

type Props = MeStackScreenProps<'MeHome'>;

export function MeHomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const { data: balanceData } = useAccountBalance();

  const profile = useMemo(() => profileFromAuthUser(user), [user]);

  const balances: AccountBalanceSummary = useMemo(() => {
    const total = balanceData?.tutAccountList ? sumAccountBalance(balanceData.tutAccountList) : null;
    if (total == null || total === 0) return defaultBalanceSummary;
    return {
      ...defaultBalanceSummary,
      mealPlanAmount: Math.round(total),
      mealPlanSubtitle: `~$${(total / 27).toFixed(2)}/day`,
    };
  }, [balanceData]);

  const handleSettingsRow = (row: SettingsRow) => {
    switch (row.route) {
      case 'Grades':
        navigation.navigate('Grades');
        break;
      case 'Balance':
        navigation.navigate('Balance');
        break;
      case 'Profile':
        navigation.navigate('Profile');
        break;
      default:
        navigation.navigate('Settings');
    }
  };

  return (
    <Screen edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <AccountHeader onSettingsPress={() => navigation.navigate('Settings')} />

        <StudentIdCard profile={profile} />

        <BalanceSummaryCards
          balances={balances}
          onMealPlanPress={() => navigation.navigate('Balance')}
          onBearBucksPress={() => navigation.navigate('Balance')}
        />

        <DegreeProgressSection progress={defaultDegreeProgress} />

        <AccountSettingsList rows={accountSettingsRows} onRowPress={handleSettingsRow} />
      </ScrollView>
    </Screen>
  );
}
