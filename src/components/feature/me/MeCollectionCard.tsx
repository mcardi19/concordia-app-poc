import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { MaterialSymbol, msChevronRight } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { meTheme } from '@/screens/me/meTheme';
import { MeGlassCard } from './MeGlassCard';

/** One entry in the overlapping preview stack. */
export type MeStackItem = {
  id: string;
  monogram: string;
  /** Circle fill. Omitted entries use the neutral service chip. */
  tint?: string;
};

type Props = {
  heading: string;
  subtitle: string;
  items: MeStackItem[];
  /** `circle` for people/clubs, `rounded` for services. */
  shape: 'circle' | 'rounded';
  onPress?: () => void;
};

const CHIP = 40;
const MAX_VISIBLE = 3;

function StackChip({
  item,
  shape,
  overlap,
}: {
  item: MeStackItem;
  shape: 'circle' | 'rounded';
  overlap: boolean;
}) {
  const theme = useTheme();
  const tinted = item.tint != null;

  return (
    <View
      style={[
        styles.chip,
        {
          borderRadius: shape === 'circle' ? CHIP / 2 : 10,
          backgroundColor: item.tint ?? meTheme.stackFill,
          marginLeft: overlap ? -12 : 0,
        },
      ]}
    >
      <Text
        variant="caption"
        style={{
          fontSize: shape === 'circle' ? 14 : 13,
          lineHeight: 16,
          fontWeight: '700',
          color: tinted ? theme.color.text.inverse : theme.color.primary,
        }}
      >
        {item.monogram}
      </Text>
    </View>
  );
}

/**
 * Collection summary card — heading, count, and an overlapping preview stack
 * with a +N remainder. Tapping opens the full list in a sheet rather than
 * pushing a screen that would hold only a handful of rows.
 */
export function MeCollectionCard({ heading, subtitle, items, shape, onPress }: Props) {
  const visible = items.slice(0, MAX_VISIBLE);
  const remainder = items.length - visible.length;

  return (
    <MeGlassCard
      onPress={onPress}
      accessibilityLabel={`${heading}, ${subtitle}`}
      contentStyle={styles.cardContent}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text
            variant="bodySmall"
            style={{ fontSize: 17, fontWeight: '600', color: meTheme.headingText }}
          >
            {heading}
          </Text>
          <Text
            variant="caption"
            style={{ fontSize: 12.5, color: meTheme.metaText, marginTop: 2 }}
          >
            {subtitle}
          </Text>
        </View>
        <MaterialSymbol icon={msChevronRight} size={18} color={meTheme.chevron} />
      </View>

      <View style={styles.stack}>
        {visible.map((item, index) => (
          <StackChip key={item.id} item={item} shape={shape} overlap={index > 0} />
        ))}
        {remainder > 0 ? (
          <View
            style={[
              styles.chip,
              {
                borderRadius: shape === 'circle' ? CHIP / 2 : 10,
                backgroundColor: meTheme.stackFill,
                marginLeft: -12,
              },
            ]}
          >
            <Text
              variant="caption"
              style={{
                fontSize: 13,
                lineHeight: 14,
                fontWeight: '700',
                color: meTheme.metaText,
              }}
            >
              +{remainder}
            </Text>
          </View>
        ) : null}
      </View>
    </MeGlassCard>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  stack: {
    flexDirection: 'row',
    marginTop: 12,
  },
  chip: {
    width: CHIP,
    height: CHIP,
    borderCurve: 'continuous',
    borderWidth: 2.5,
    borderColor: meTheme.stackRing,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
});
