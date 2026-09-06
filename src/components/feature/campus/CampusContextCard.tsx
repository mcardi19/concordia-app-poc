import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { todayShadowMedium } from '@/components/feature/today/todayShadows';
import {
  MaterialSymbol,
  msCloseSemibold,
  msDirections,
  msDirectionsWalk,
  msScheduleClock,
} from '@/components/icons';
import { radiusStyle, useTheme } from '@/design-system/theme';
import type { CampusContextCard as CardModel } from '@/services/campus/campusContext';
import { CardGlass, GlassIconButton } from './campusSheet';

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
    <View style={[styles.card, todayShadowMedium, radiusStyle(CARD_RADIUS)]}>
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

          <GlassIconButton icon={msCloseSemibold} label="Dismiss" onPress={onDismiss} />
        </View>

        <View style={[styles.metaRow, { backgroundColor: `${accent}0F` }]}>
          <Text
            variant="caption"
            numberOfLines={1}
            style={[styles.metaText, { color: accent, fontWeight: '700' }]}
          >
            {card.meta.location}
          </Text>
          <View style={[styles.metaRule, { backgroundColor: theme.color.border }]} />
          <Text
            variant="caption"
            numberOfLines={1}
            style={[styles.metaText, { color: theme.color.text.secondary }]}
          >
            {card.meta.time}
          </Text>
        </View>

        <Pressable
          onPress={onPrimaryPress}
          accessibilityRole="button"
          accessibilityLabel={card.primaryAction}
          style={({ pressed }) => [
            styles.action,
            // Tinted by the card's own accent, so an amber card does not
            // throw a burgundy shadow.
            { backgroundColor: accent, shadowColor: accent, opacity: pressed ? 0.85 : 1 },
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
  card: {
    alignSelf: 'stretch',
    width: '100%',
  },
  clip: {
    overflow: 'hidden',
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
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
    fontSize: 13,
    lineHeight: 16,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderCurve: 'continuous',
  },
  metaRule: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginHorizontal: 12,
    marginVertical: 2,
  },
  /*
    Each half is `flex: 1`, so the two are the same width by construction and
    the divider lands dead centre. Centring the label makes that visible —
    left-aligned, a short room code against a longer walk time read as two
    unequal segments even though the boxes match.
  */
  metaText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderCurve: 'continuous',
    // The card's one call to action, and it sat flat on the glass.
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 8,
  },
  actionLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
