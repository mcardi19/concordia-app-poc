import React, { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { Text } from '@/components/design-system';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import { MaterialSymbol, msBadge, msChevronRight } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { meTheme } from '@/screens/me/meTheme';
import type { StudentProfile } from '@/types/profile';

type Props = {
  profile: StudentProfile;
  onPress?: () => void;
};

/**
 * The card straddles the masthead edge, so clear glass sampled burgundy on its
 * top half and grey on its bottom. A near-opaque white tint keeps it reading as
 * one solid card across the seam.
 */
const CARD_GLASS_TINT = 'rgba(255, 255, 255, 0.82)';

/** Deterministic bar widths — the design cycles a fixed 20-step pattern. */
const BAR_WIDTHS = [1, 1, 2, 1, 3, 1, 2, 1, 1, 2, 1, 1, 3, 2, 1, 1, 2, 1, 2, 1];
const BAR_COUNT = 60;

function Barcode() {
  return (
    <View style={styles.barcode}>
      {Array.from({ length: BAR_COUNT }).map((_, index) => (
        <View
          key={index}
          style={{
            width: BAR_WIDTHS[index % BAR_WIDTHS.length],
            height: '100%',
            marginRight: 3.3,
            backgroundColor: meTheme.barcode,
          }}
        />
      ))}
    </View>
  );
}

/**
 * Student ID summary. Overlaps the hero's lower edge (negative margin applied
 * by the screen), so it must paint above it. Whole card is one press target;
 * liquid glass when available (no parent opacity — that flattens the effect).
 */
export function MeIdCardRow({ profile, onPress }: Props) {
  const theme = useTheme();
  const glass = useMemo(() => canUseLiquidGlass(), []);

  const body = (
    <>
      <View style={styles.row}>
        <View style={[styles.iconTile, { backgroundColor: theme.color.primary }]}>
          <MaterialSymbol icon={msBadge} size={22} color={theme.color.text.inverse} />
        </View>

        <View style={styles.rowText}>
          <Text
            variant="bodySmall"
            style={{ fontSize: 15, fontWeight: '600', color: meTheme.headingText }}
          >
            Student ID
          </Text>
          <Text
            variant="caption"
            style={{ fontSize: 12.5, color: meTheme.metaText, marginTop: 1 }}
          >
            {formatStudentId(profile.studentId)} · Tap to scan
          </Text>
        </View>

        <MaterialSymbol icon={msChevronRight} size={24} color={meTheme.chevronStrong} />
      </View>

      <View style={styles.barcodeWrap}>
        <Barcode />
      </View>
    </>
  );

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Student ID — tap to scan"
        style={({ pressed }) => [
          styles.shadowWrap,
          { shadowColor: theme.color.primary, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        {glass ? (
          <GlassView
            isInteractive
            glassEffectStyle="regular"
            colorScheme="light"
            tintColor={CARD_GLASS_TINT}
            style={styles.card}
          >
            {body}
          </GlassView>
        ) : (
          <View style={[styles.card, styles.cardFallback]}>{body}</View>
        )}
      </Pressable>
    </View>
  );
}

function formatStudentId(id: string): string {
  const digits = id.replace(/\D/g, '');
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    // Above the hero gradient it overlaps.
    zIndex: 2,
  },
  /** Shadow lives outside the glass so `overflow: hidden` does not clip it. */
  shadowWrap: {
    borderRadius: 8,
    borderCurve: 'continuous',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.13,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  card: {
    borderRadius: 8,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  /** Only applied when liquid glass is unavailable. */
  cardFallback: {
    backgroundColor: meTheme.cardBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: meTheme.cardBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconTile: {
    width: 42,
    height: 42,
    borderRadius: 9,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  barcodeWrap: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  barcode: {
    flexDirection: 'row',
    height: 22,
    overflow: 'hidden',
  },
});
