import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import { MaterialSymbol, msSearch } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { HEADER_BAR_BUTTON_SIZE, HEADER_ICON_SIZE } from '@/navigation/HeaderIconButton';
import { HeaderProfileButton } from '@/navigation/HeaderProfileButton';
import { meTheme } from '@/screens/me/meTheme';

type Props = {
  onSearchPress: () => void;
};

/**
 * Campus map chrome. Replaces the inline CampusSearchBar: search is a button
 * that hands off to the Search tab, matching how every other surface reaches
 * it, and the profile disc sits alongside.
 */
export function CampusHeaderChrome({ onSearchPress }: Props) {
  const theme = useTheme();
  const glass = useMemo(() => canUseLiquidGlass(), []);

  const searchButton = (
    <Pressable
      onPress={onSearchPress}
      accessibilityRole="button"
      accessibilityLabel="Search"
      style={styles.fill}
    >
      <MaterialSymbol icon={msSearch} size={HEADER_ICON_SIZE} color={theme.color.primary} />
    </Pressable>
  );

  return (
    <View style={styles.row} pointerEvents="box-none">
      {glass ? (
        <GlassView
          isInteractive
          glassEffectStyle="regular"
          colorScheme="light"
          style={styles.round}
        >
          {searchButton}
        </GlassView>
      ) : (
        <View style={[styles.round, styles.fallback]}>{searchButton}</View>
      )}

      <HeaderProfileButton />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  round: {
    width: HEADER_BAR_BUTTON_SIZE,
    height: HEADER_BAR_BUTTON_SIZE,
    borderRadius: HEADER_BAR_BUTTON_SIZE / 2,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Only applied when liquid glass is unavailable. */
  fallback: {
    backgroundColor: meTheme.cardBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: meTheme.cardBorder,
  },
});
