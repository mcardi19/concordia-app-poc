import React, { useMemo } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { LoadingState } from '@/components/feature';
import { TodaySurfaceFill } from '@/components/feature/today/TodaySurface';
import { CAMPUS_TODAY } from '@/components/feature/today/todayData';
import { MaterialSymbol, msLocationOn, msScheduleClock } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { useFeaturedEvents } from '@/hooks/useFeaturedEvents';
import { useTabBarContentPadding } from '@/navigation/tabBarInset';
import type { TodayStackScreenProps } from '@/navigation/types';

type Props = TodayStackScreenProps<'CampusToday'>;

/**
 * "Campus today" opened whole — the events page behind the Home carousel.
 *
 * Two sources, kept apart because they are not the same kind of thing. The
 * today list carries a time and a place, which is what makes it answerable
 * ("can I go?"); the featured feed is promotional banner content from AEM
 * with neither, so it cannot be sorted or filtered alongside them and sits
 * below as its own section.
 */
export function CampusTodayScreen({}: Props) {
  const theme = useTheme();
  const tabBarPadding = useTabBarContentPadding();
  const { data: featured, isLoading } = useFeaturedEvents();

  const radius = theme.radius.lg;

  /** Banner blocks with no title are spacers in the feed, not events. */
  const featuredEvents = useMemo(
    () => (featured ?? []).filter((event) => event.title.trim().length > 0),
    [featured],
  );

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: tabBarPadding + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text variant="body" color="subtle" style={styles.intro}>
        {`${CAMPUS_TODAY.length} happening on campus today`}
      </Text>

      <View style={styles.list}>
        {CAMPUS_TODAY.map((item) => (
          <View
            key={item.id}
            style={[styles.card, { borderRadius: radius }]}
          >
            <TodaySurfaceFill radius={radius} />

            <Image source={item.image} style={styles.image} resizeMode="cover" />

            <View style={styles.cardBody}>
              <Text variant="body" numberOfLines={2} style={styles.title}>
                {item.title}
              </Text>

              <View style={styles.metaRow}>
                <MaterialSymbol icon={msScheduleClock} size={16} color={theme.color.primary} />
                <Text variant="body" numberOfLines={1} style={styles.meta}>
                  {item.time}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <MaterialSymbol icon={msLocationOn} size={16} color={theme.color.primary} />
                <Text variant="body" color="subtle" numberOfLines={1} style={styles.meta}>
                  {item.location}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/*
        Only rendered when it has something to say. The banner endpoint
        currently 404s, so an always-on section would put a permanent error
        under a page whose primary content is fine — and today's events do not
        depend on the feed. It reappears on its own once the URL resolves.
      */}
      {isLoading || featuredEvents.length > 0 ? (
        <Text variant="heading3" style={styles.sectionHeading}>
          Featured
        </Text>
      ) : null}

      {isLoading ? <LoadingState /> : null}

      <View style={styles.list}>
        {featuredEvents.map((event) => (
          <Pressable
            key={event.id}
            onPress={() => event.url && Linking.openURL(event.url)}
            disabled={!event.url}
            accessibilityRole={event.url ? 'link' : undefined}
            accessibilityLabel={event.subtitle ? `${event.title}. ${event.subtitle}` : event.title}
            style={({ pressed }) => [
              styles.card,
              styles.featuredCard,
              { borderRadius: radius, opacity: pressed && event.url ? 0.85 : 1 },
            ]}
          >
            <TodaySurfaceFill radius={radius} />

            <View style={styles.cardBody}>
              <Text variant="body" style={styles.title}>
                {event.title}
              </Text>
              {event.subtitle ? (
                <Text variant="body" color="subtle" style={styles.featuredSubtitle}>
                  {event.subtitle}
                </Text>
              ) : null}
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
  },
  intro: {
    paddingHorizontal: 16,
    fontSize: 14,
    lineHeight: 14 * 1.4,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
  },
  card: {
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 132,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 17 * 1.2,
    letterSpacing: -0.4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  meta: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 14 * 1.3,
  },
  sectionHeading: {
    paddingHorizontal: 16,
    paddingTop: 28,
    letterSpacing: -0.4,
  },
  featuredCard: {
    /* No image: the banner feed's art is a background, not a photo. */
    minHeight: 0,
  },
  featuredSubtitle: {
    fontSize: 14,
    lineHeight: 14 * 1.4,
    marginTop: 4,
  },
});
