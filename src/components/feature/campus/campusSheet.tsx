import React, { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import type { MsIconDefinition } from 'material-symbols-react-native';
import {
  CARD_GLASS_TINT,
  CardGlass,
  SHEET_GLASS_TINT,
  SheetGlass,
} from '@/components/design-system/GlassSurface';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import { MaterialSymbol } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { HEADER_BAR_BUTTON_SIZE, HEADER_ICON_SIZE } from '@/navigation/HeaderIconButton';

/**
 * The Campus map's sheet chrome, shared by the building drawer and the search
 * results drawer.
 *
 * Both are the same panel over the same map, so the glass, the corner, the
 * snap points and the spring live here rather than being copied — a sheet
 * that settled differently depending on what opened it would read as a bug.
 */

export const SHEET_DISMISS_DISTANCE = 120;
export const SHEET_SPRING = { damping: 22, stiffness: 220, mass: 0.9 };
export const SHEET_PEEK_HEIGHT_RATIO = 0.38;
export const SHEET_EXPANDED_HEIGHT_RATIO = 0.78;
/*
  The glass itself lives in the design system: the academic date screen wants
  the same card material, and a second definition would drift from this one.
  Re-exported so the drawers here keep importing their chrome from one place.
*/
export { CARD_GLASS_TINT, CardGlass, SHEET_GLASS_TINT, SheetGlass };

/** Larger than `theme.radius.xl` (12) so the sheet reads as a rounded iOS panel. */
export const SHEET_CORNER_RADIUS = 32;

/** Drop shadow lifting the sheet off the map. */
export const sheetShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  android: { elevation: 12 },
});

export function GlassIconButton({
  icon,
  label,
  onPress,
}: {
  icon: MsIconDefinition;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  const useGlass = useMemo(() => canUseLiquidGlass(), []);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButtonOuter,
        { transform: [{ scale: pressed ? 0.94 : 1 }] },
      ]}
    >
      {useGlass ? (
        <GlassView
          isInteractive
          glassEffectStyle="regular"
          colorScheme="light"
          tintColor="rgba(255,255,255,0.35)"
          style={styles.iconButtonSurface}
        >
          <MaterialSymbol icon={icon} size={HEADER_ICON_SIZE} color={theme.color.text.brand} />
        </GlassView>
      ) : (
        <View
          style={[styles.iconButtonSurface, { backgroundColor: 'rgba(255,255,255,0.82)' }]}
        >
          <MaterialSymbol icon={icon} size={HEADER_ICON_SIZE} color={theme.color.text.brand} />
        </View>
      )}
    </Pressable>
  );
}

/** The grab handle every sheet opens with. */
export function SheetHandle() {
  const theme = useTheme();
  return (
    <View style={styles.handleRow}>
      <View style={[styles.handle, { backgroundColor: theme.color.border }]} />
    </View>
  );
}

export const sheetStyles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
  },
});

const styles = StyleSheet.create({
  handleRow: {
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  iconButtonOuter: {
    width: HEADER_BAR_BUTTON_SIZE,
    height: HEADER_BAR_BUTTON_SIZE,
    borderRadius: HEADER_BAR_BUTTON_SIZE / 2,
  },
  iconButtonSurface: {
    width: HEADER_BAR_BUTTON_SIZE,
    height: HEADER_BAR_BUTTON_SIZE,
    borderRadius: HEADER_BAR_BUTTON_SIZE / 2,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
