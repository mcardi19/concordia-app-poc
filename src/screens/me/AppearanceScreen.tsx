import React from 'react';
import { Pressable, View } from 'react-native';
import { Screen, Text } from '@/components/design-system';
import { MaterialSymbol, msCheck } from '@/components/icons';
import { useAppearance, useCardSurface, useTheme } from '@/design-system/theme';
import type { AppearancePreference } from '@/state/appearanceStore';
import type { MeStackScreenProps } from '@/navigation/types';

type Props = MeStackScreenProps<'Appearance'>;

const OPTIONS: { value: AppearancePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function AppearanceScreen(_props: Props) {
  void _props;
  const theme = useTheme();
  const { preference, setPreference } = useAppearance();
  const cardStyle = useCardSurface('none', { padding: 0, overflow: 'hidden' });

  return (
    <Screen>
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
        Choose how Concordia looks, or match your device&rsquo;s system setting.
      </Text>

      <View style={cardStyle}>
        {OPTIONS.map((option, index) => {
          const active = preference === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.md,
                backgroundColor: pressed ? theme.color.backgroundSubtle : theme.color.background,
                borderBottomWidth: index < OPTIONS.length - 1 ? 1 : 0,
                borderBottomColor: theme.color.borderSubtle,
              })}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={option.label}
            >
              <Text variant="body" style={{ fontWeight: '500' }}>
                {option.label}
              </Text>
              {active ? (
                <MaterialSymbol icon={msCheck} size={22} color={theme.color.primary} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
