import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { MaterialSymbol, msBadge, msChevronRight } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { meTheme } from '@/screens/me/meTheme';
import type { StudentProfile } from '@/types/profile';

type Props = {
  profile: StudentProfile;
  onPress?: () => void;
};

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
 * by the screen), so it must paint above it.
 */
export function MeIdCardRow({ profile, onPress }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Student ID — tap to scan"
        style={({ pressed }) => [
          styles.card,
          { shadowColor: theme.color.primary, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <View style={styles.row}>
          <View style={[styles.iconTile, { backgroundColor: theme.color.primary }]}>
            <MaterialSymbol icon={msBadge} size={17} color={theme.color.text.inverse} />
          </View>

          <View style={styles.rowText}>
            <Text
              variant="bodySmall"
              style={{ fontSize: 13.5, fontWeight: '600', color: meTheme.headingText }}
            >
              Student ID
            </Text>
            <Text
              variant="caption"
              style={{ fontSize: 11, color: meTheme.metaText, marginTop: 1 }}
            >
              {formatStudentId(profile.studentId)} · Tap to scan
            </Text>
          </View>

          <MaterialSymbol icon={msChevronRight} size={18} color={meTheme.chevron} />
        </View>

        <View style={styles.barcodeWrap}>
          <Barcode />
        </View>
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
  card: {
    backgroundColor: meTheme.cardBackground,
    borderRadius: 8,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: meTheme.cardBorder,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.13,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconTile: {
    width: 34,
    height: 34,
    borderRadius: 7,
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
