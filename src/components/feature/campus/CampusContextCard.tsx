import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { todayShadowMedium } from '@/components/feature/today/todayShadows';
import {
  MaterialSymbol,
  msClose,
  msDirections,
  msDirectionsWalk,
  msScheduleClock,
} from '@/components/icons';
import { radiusStyle, useTheme } from '@/design-system/theme';
import type { CampusContextCard as CardModel } from '@/services/campus/campusContext';
import { CardGlass } from './campusSheet';

const CARD_RADIUS = 24;

/** Tones from the design's priority model. */
const TONE_COLOR = {
  brand: undefined,
  amber: '#9A5B00',
  slate: '#3F5A73',
} as const;

type Props = {
  card: CardModel;
  onPrimaryPress: () => void;
  onDismiss: () => void;
};

/**
 * The map's contextual card — the design's "temporary assistant layer".
 *
 * Same floating surface as the quick card it replaces, so the bottom of the
 * map keeps one shape whichever of them is up. Dismissible on purpose: the
 * design's rule is that a card gets out of the way, and the only ones built
 * here are Priority 2, which is the tier that may be dismissed.
 */
export function CampusContextCard({ card, onPrimaryPress, onDismiss }: Props) {
  const theme = useTheme();
  const accent = TONE_COLOR[card.tone] ?? theme.color.primary;
  const icon = card.eyebrow.startsWith('Time to go') ? msScheduleClock : msDirectionsWalk;

  return (
    <View style={[todayShadowMedium, radiusStyle(CARD_RADIUS)]}>
      <View style={[styles.clip, radiusStyle(CARD_RADIUS)]}>
        <CardGlass radius={CARD_RADIUS} />

        <View style={styles.headRow}>
          <View style={[styles.icon, { backgroundColor: `${accent}1A` }]}>
            <MaterialSymbol icon={icon} size={20} color={accent} />
          </View>

          <View style={styles.headText}>
            <Text variant="caption" style={[styles.eyebrow, { color: accent }]}>
              {card.eyebrow}
            </Text>
            <Text variant="body" numberOfLines={2} style={styles.title}>
              {card.title}
            </Text>
            {card.detail ? (
              <Text variant="bodySmall" color="secondary" numberOfLines={1}>
                {card.detail}
              </Text>
            ) : null}
          </View>

          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            hitSlop={8}
            style={({ pressed }) => [
              styles.dismiss,
              { backgroundColor: theme.color.backgroundSubtle, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <MaterialSymbol icon={msClose} size={15} color={theme.color.text.secondary} />
          </Pressable>
        </View>

        {card.meta.length > 0 ? (
          <View style={[styles.metaRow, { backgroundColor: `${accent}0F` }]}>
            {card.meta.map((item, index) => (
              <React.Fragment key={item}>
                {index > 0 ? (
                  <View style={[styles.metaDot, { backgroundColor: theme.color.border }]} />
                ) : null}
                <Text
                  variant="caption"
                  numberOfLines={1}
                  style={[
                    styles.metaText,
                    index === 0
                      ? { color: accent, fontWeight: '700' }
                      : { color: theme.color.text.secondary },
                  ]}
                >
                  {item}
                </Text>
              </React.Fragment>
            ))}
          </View>
        ) : null}

        <Pressable
          onPress={onPrimaryPress}
          accessibilityRole="button"
          accessibilityLabel={card.primaryAction}
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: accent, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <MaterialSymbol icon={msDirections} size={18} color={theme.color.text.inverse} />
          <Text variant="bodySmall" style={styles.actionLabel}>
            {card.primaryAction}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: -0.3,
    marginTop: 2,
    marginBottom: 2,
  },
  dismiss: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderCurve: 'continuous',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },
  metaText: {
    fontSize: 12,
    lineHeight: 15,
    flexShrink: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  actionLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
