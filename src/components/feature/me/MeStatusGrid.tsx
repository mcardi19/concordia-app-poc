import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { meTheme } from '@/screens/me/meTheme';
import type { MeStatusCard } from '@/types/profile';

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
          <Pressable
            key={card.id}
            disabled={!interactive}
            onPress={interactive ? () => onCardPress?.(card) : undefined}
            accessibilityRole={interactive ? 'button' : undefined}
            accessibilityLabel={`${card.label}: ${card.stat}, ${card.subtitle}`}
            style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}
          >
            <Text
              variant="caption"
              style={{ fontSize: 11.5, fontWeight: '600', color: meTheme.labelText }}
            >
              {card.label}
            </Text>
            <Text
              variant="heading3"
              numberOfLines={1}
              style={{
                fontSize: 20,
                lineHeight: 20,
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
                fontSize: 10,
                lineHeight: 13,
                color: meTheme.metaText,
                marginTop: 16,
              }}
            >
              {card.subtitle}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  card: {
    flex: 1,
    backgroundColor: meTheme.cardBackground,
    borderRadius: 10,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: meTheme.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 12,
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
});
