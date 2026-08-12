import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { semanticSpacing } from '@/design-system/tokens';
import { meTheme } from '@/screens/me/meTheme';
import type { MeStatusCard } from '@/types/profile';
import { MeGlassCard } from './MeGlassCard';

type Props = {
  cards: MeStatusCard[];
  onCardPress?: (card: MeStatusCard) => void;
};

/** Two-up headline figures (Finances, Library) sitting under the ID card. */
export function MeStatusGrid({ cards, onCardPress }: Props) {
  return (
    <View style={styles.grid}>
      {cards.map((card) => {
        const interactive = card.route != null;
        return (
          <MeGlassCard
            key={card.id}
            onPress={interactive ? () => onCardPress?.(card) : undefined}
            accessibilityLabel={`${card.label}: ${card.stat}, ${card.subtitle}`}
            radius={10}
            style={styles.card}
            contentStyle={styles.cardContent}
          >
            <Text
              variant="caption"
              style={{ fontSize: 13, fontWeight: '600', color: meTheme.labelText }}
            >
              {card.label}
            </Text>
            <Text
              variant="heading3"
              numberOfLines={1}
              style={{
                fontSize: 22,
                lineHeight: 26,
                fontWeight: '700',
                letterSpacing: -0.5,
                color: meTheme.headingText,
                marginTop: 6,
              }}
            >
              {card.stat}
            </Text>
            <Text
              variant="caption"
              style={{
                fontSize: 11.5,
                lineHeight: 13,
                color: meTheme.metaText,
                marginTop: 16,
              }}
            >
              {card.subtitle}
            </Text>
          </MeGlassCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 24,
  },
  card: {
    flex: 1,
  },
  cardContent: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
});
