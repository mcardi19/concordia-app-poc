import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/design-system';
import { MaterialSymbol, featureSymbols, msChevronRight, type FeatureSymbolKey } from '@/components/icons';
import { useCardSurface } from '@/design-system/theme';
import { useTheme } from '@/design-system/theme';

type Props = {
  title: string;
  subtitle: string;
  icon: FeatureSymbolKey;
  onPress: () => void;
};

export function HomeFeatureCard({ title, subtitle, icon, onPress }: Props) {
  const theme = useTheme();
  const cardStyle = useCardSurface('none');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        opacity: pressed ? 0.9 : 1,
        ...cardStyle,
      })}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.color.backgroundMuted,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.md,
        }}
      >
        <MaterialSymbol icon={featureSymbols[icon]} size={24} color={theme.color.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="body" style={{ fontWeight: '600' }}>
          {title}
        </Text>
        <Text variant="bodySmall" color="secondary">
          {subtitle}
        </Text>
      </View>
      <MaterialSymbol icon={msChevronRight} size={24} color={theme.color.text.subtle} />
    </Pressable>
  );
}
