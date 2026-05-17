import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/design-system';
import { useCardSurface } from '@/design-system/theme';
import { useTheme } from '@/design-system/theme';
import type { AccountBalanceSummary } from '@/types/profile';

type Props = {
  balances: AccountBalanceSummary;
  onMealPlanPress?: () => void;
  onBearBucksPress?: () => void;
};

function BalanceCard({
  label,
  amount,
  subtitle,
  onPress,
}: {
  label: string;
  amount: number;
  subtitle: string;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const cardStyle = useCardSurface('low', { flex: 1, padding: theme.spacing.md });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...cardStyle,
        opacity: pressed ? 0.92 : 1,
      })}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <Text variant="caption" color="secondary" style={{ letterSpacing: 0.8, marginBottom: 4 }}>
        {label}
      </Text>
      <Text variant="heading2" color="brand" style={{ fontSize: 32, lineHeight: 36 }}>
        ${amount}
      </Text>
      <Text variant="bodySmall" color="secondary" style={{ marginTop: 4 }}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

export function BalanceSummaryCards({ balances, onMealPlanPress, onBearBucksPress }: Props) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', marginBottom: theme.spacing.lg }}>
      <BalanceCard
        label="Meal plan"
        amount={balances.mealPlanAmount}
        subtitle={balances.mealPlanSubtitle}
        onPress={onMealPlanPress}
      />
      <View style={{ width: theme.spacing.sm }} />
      <BalanceCard
        label="Bear bucks"
        amount={balances.bearBucksAmount}
        subtitle={balances.bearBucksSubtitle}
        onPress={onBearBucksPress}
      />
    </View>
  );
}
