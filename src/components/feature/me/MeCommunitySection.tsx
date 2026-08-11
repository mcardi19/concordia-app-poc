import React from 'react';
import { StyleSheet, View } from 'react-native';
import { semanticSpacing } from '@/design-system/tokens';
import type { MeCommunity, MeFavouriteService } from '@/types/profile';
import { MeCollectionCard } from './MeCollectionCard';
import { MeSectionLabel } from './MeSectionLabel';

type Props = {
  communities: MeCommunity[];
  favourites: MeFavouriteService[];
  onOpenCommunities: () => void;
  onOpenFavourites: () => void;
};

/** "Campus & community" — two collection cards that open sheets. */
export function MeCommunitySection({
  communities,
  favourites,
  onOpenCommunities,
  onOpenFavourites,
}: Props) {
  return (
    <View style={styles.section}>
      <MeSectionLabel>Campus &amp; community</MeSectionLabel>

      <View style={styles.cards}>
        <MeCollectionCard
          heading="Your communities"
          subtitle={`${communities.length} clubs & memberships`}
          shape="circle"
          items={communities.map((c) => ({
            id: c.id,
            monogram: c.monogram,
            tint: c.tint,
          }))}
          onPress={onOpenCommunities}
        />

        <MeCollectionCard
          heading="Favourite services"
          subtitle={`${favourites.length} saved`}
          shape="rounded"
          items={favourites.map((f) => ({ id: f.id, monogram: f.monogram }))}
          onPress={onOpenFavourites}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingTop: 40,
  },
  cards: {
    gap: 8,
  },
});
