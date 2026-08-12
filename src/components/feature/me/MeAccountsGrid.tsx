import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { MaterialSymbol, meAccountSymbols } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { meTheme } from '@/screens/me/meTheme';
import type { MeAccountTile } from '@/types/profile';
import { MeGlassCard } from './MeGlassCard';
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
            <MeGlassCard
              key={tile.id}
              onPress={interactive ? () => onTilePress?.(tile) : undefined}
              accessibilityLabel={`${tile.label}: ${tile.value}`}
              style={styles.tile}
              contentStyle={styles.tileContent}
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
                style={{ fontSize: 13, fontWeight: '600', color: meTheme.labelText }}
              >
                {tile.label}
              </Text>
              <Text
                variant="bodySmall"
                numberOfLines={1}
                style={{
                  fontSize: 17,
                  lineHeight: 17,
                  fontWeight: '600',
                  letterSpacing: -0.6,
                  color: meTheme.valueText,
                  marginTop: 3,
                }}
              >
                {tile.value}
              </Text>
            </MeGlassCard>
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
  },
  tileContent: {
    paddingHorizontal: 12,
    paddingVertical: 11,
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
