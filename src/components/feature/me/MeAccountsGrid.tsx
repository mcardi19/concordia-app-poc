import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { MaterialSymbol, meAccountSymbols } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { meTheme } from '@/screens/me/meTheme';
import type { MeAccountTile } from '@/types/profile';
import { MeSectionLabel } from './MeSectionLabel';

type Props = {
  tiles: MeAccountTile[];
  onTilePress?: (tile: MeAccountTile) => void;
};

/** "My accounts" — 2×2 stored-value and entitlement tiles. */
export function MeAccountsGrid({ tiles, onTilePress }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <MeSectionLabel>My accounts</MeSectionLabel>

      <View style={styles.grid}>
        {tiles.map((tile) => {
          const interactive = tile.route != null;
          return (
            <Pressable
              key={tile.id}
              disabled={!interactive}
              onPress={interactive ? () => onTilePress?.(tile) : undefined}
              accessibilityRole={interactive ? 'button' : undefined}
              accessibilityLabel={`${tile.label}: ${tile.value}`}
              style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.9 : 1 }]}
            >
              <View
                style={[
                  styles.iconTile,
                  // 14/255 alpha wash of the brand, per the design's `${brand}14`.
                  { backgroundColor: `${theme.color.primary}14` },
                ]}
              >
                <MaterialSymbol
                  icon={meAccountSymbols[tile.icon]}
                  size={19}
                  color={theme.color.primary}
                />
              </View>

              <Text
                variant="caption"
                style={{ fontSize: 11.5, fontWeight: '600', color: meTheme.labelText }}
              >
                {tile.label}
              </Text>
              <Text
                variant="bodySmall"
                numberOfLines={1}
                style={{
                  fontSize: 16,
                  lineHeight: 17,
                  fontWeight: '600',
                  letterSpacing: -0.6,
                  color: meTheme.valueText,
                  marginTop: 3,
                }}
              >
                {tile.value}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 48,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    // Two per row, accounting for the 8pt gap.
    width: '48%',
    flexGrow: 1,
    backgroundColor: meTheme.cardBackground,
    borderRadius: 8,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: meTheme.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 11,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  iconTile: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
});
