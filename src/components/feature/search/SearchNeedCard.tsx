import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { MaterialSymbol, msArrowForward } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { searchTheme } from '@/screens/search/searchTheme';
import { SearchSurface } from './SearchSurface';
import type { SearchNeed } from './searchDiscoveryData';

const CARD_WIDTH = 208;
const QUESTION_LINE_HEIGHT = 22;

type Props = {
  needs: SearchNeed[];
  onSelect: (need: SearchNeed) => void;
};

/**
 * "Browse by need" rail — plain-language questions for students who cannot
 * name the service. Tapping one seeds the query rather than deep-linking, so
 * the result lands in the same list as a typed search.
 */
export function SearchNeedRail({ needs, onSelect }: Props) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}
      keyboardShouldPersistTaps="handled"
      snapToInterval={CARD_WIDTH + 10}
      decelerationRate="fast"
    >
      {needs.map((need) => (
        <Pressable
          key={need.question}
          onPress={() => onSelect(need)}
          accessibilityRole="button"
          accessibilityLabel={`${need.question} ${need.destination}`}
          style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
        >
          <SearchSurface style={styles.surface} radius={14}>
            <View style={[styles.icon, { backgroundColor: `${theme.color.primary}16` }]}>
              <MaterialSymbol icon={need.icon} size={20} color={theme.color.primary} />
            </View>

            <Text variant="body" style={styles.question}>
              {need.question}
            </Text>

            {/* Destination pinned to the base so cards align across the rail. */}
            <View style={styles.destinationRow}>
              <Text
                variant="bodySmall"
                numberOfLines={1}
                color="brand"
                style={styles.destination}
              >
                {need.destination}
              </Text>
              <MaterialSymbol icon={msArrowForward} size={16} color={theme.color.primary} />
            </View>
          </SearchSurface>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: {
    gap: 10,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingVertical: 4,
    alignItems: 'stretch',
  },
  card: {
    width: CARD_WIDTH,
  },
  surface: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  question: {
    fontSize: 16,
    lineHeight: QUESTION_LINE_HEIGHT,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: searchTheme.headingText,
    /* Two lines' worth either way, so every card's rule sits at one height. */
    minHeight: QUESTION_LINE_HEIGHT * 2,
    marginBottom: 7,
  },
  destinationRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: searchTheme.rowDivider,
  },
  destination: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
});
