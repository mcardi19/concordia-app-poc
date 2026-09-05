import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import { CampusEventCard } from './CampusEventCard';
import type { CampusTodayItem, UpdateItem } from './todayData';
import { TodaySurfaceFill } from './TodaySurface';

const UPDATE_CARD_WIDTH = 294;
const UPDATE_IMAGE_HEIGHT = 152;
const CAMPUS_CARD_WIDTH = 260;
const CAMPUS_CARD_HEIGHT = 220;
const CAROUSEL_GAP = 14;

/**
 * The badge sits on a photo thumbnail, not the page — fixed regardless of
 * app theme, same reasoning as `SessionHero`'s on-scrim colors.
 */
const ON_PHOTO_BADGE_BG = 'rgba(255,255,255,0.92)';
const ON_PHOTO_BADGE_BORDER = 'rgba(0,0,0,0.08)';
const ON_PHOTO_BADGE_TEXT = '#1A1A1A';

/** Shared so other flows' carousels snap identically to Home's. */
export const horizontalCarouselProps = {
  horizontal: true as const,
  showsHorizontalScrollIndicator: false,
  showsVerticalScrollIndicator: false,
  decelerationRate: 'fast' as const,
  snapToAlignment: 'start' as const,
  disableIntervalMomentum: true,
  removeClippedSubviews: false,
  /** Lock to X once the gesture chooses a direction (iOS). */
  directionalLockEnabled: true,
  /** Prevent vertical rubber-banding inside the horizontal carousel. */
  alwaysBounceVertical: false,
  overScrollMode: 'never' as const,
};

type UpdatesProps = {
  items: UpdateItem[];
  onPress?: (item: UpdateItem) => void;
};

export function TodayUpdatesCarousel({ items, onPress }: UpdatesProps) {
  const theme = useTheme();

  return (
    <ScrollView
      {...horizontalCarouselProps}
      snapToInterval={UPDATE_CARD_WIDTH + CAROUSEL_GAP}
      contentContainerStyle={{
        gap: CAROUSEL_GAP,
        paddingLeft: theme.spacing.screenHorizontal,
        paddingRight: theme.spacing.screenHorizontal,
        alignItems: 'flex-start',
      }}
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onPress?.(item)}
          accessibilityRole="button"
          accessibilityLabel={item.title}
          style={{
            width: UPDATE_CARD_WIDTH,
            borderRadius: theme.radius.lg,
            borderCurve: 'continuous',
            overflow: 'hidden',
          }}
        >
          <TodaySurfaceFill radius={theme.radius.lg} />

          <View style={{ height: UPDATE_IMAGE_HEIGHT, width: UPDATE_CARD_WIDTH }}>
            <Image
              source={item.image}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            <View style={{ position: 'absolute', top: 10, left: 10 }}>
              <View
                style={{
                  backgroundColor: ON_PHOTO_BADGE_BG,
                  borderRadius: 7,
                  borderCurve: 'continuous',
                  paddingHorizontal: 9,
                  paddingVertical: 4,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: ON_PHOTO_BADGE_BORDER,
                }}
              >
                <Text
                  variant="caption"
                  style={{
                    fontWeight: '500',
                    fontSize: 11,
                    lineHeight: 11 * 1.2,
                    letterSpacing: 0.2,
                    color: ON_PHOTO_BADGE_TEXT,
                  }}
                >
                  {item.badge}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
            <Text
              variant="body"
              color="brand"
              style={{
                fontWeight: '500',
                fontSize: 15,
                lineHeight: 15 * 1.2,
                marginBottom: 4,
              }}
            >
              {item.eyebrow}
            </Text>
            <Text
              variant="body"
              style={{
                fontWeight: '600',
                fontSize: 18,
                lineHeight: 18 * 1.25,
                letterSpacing: -0.4,
              }}
            >
              {item.title}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

type CampusProps = {
  items: CampusTodayItem[];
  onPress?: (item: CampusTodayItem) => void;
};

export function TodayCampusCarousel({ items, onPress }: CampusProps) {
  const theme = useTheme();
  const [addedIds, setAddedIds] = useState<Set<string>>(() => new Set());

  return (
    <ScrollView
      {...horizontalCarouselProps}
      snapToInterval={CAMPUS_CARD_WIDTH + CAROUSEL_GAP}
      contentContainerStyle={{
        gap: CAROUSEL_GAP,
        paddingLeft: theme.spacing.screenHorizontal,
        paddingRight: theme.spacing.screenHorizontal,
        alignItems: 'flex-start',
      }}
    >
      {items.map((item) => {
        const added = addedIds.has(item.id);
        return (
          <Pressable
            key={item.id}
            onPress={() => onPress?.(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}, ${item.location}, ${item.time}`}
          >
            <CampusEventCard
              item={item}
              radius={theme.radius.lg}
              compact
              added={added}
              onToggleAdd={() => {
                Alert.alert(
                  added ? 'On your schedule' : 'Add to schedule?',
                  added
                    ? `Remove “${item.title}” from your schedule?`
                    : `Add “${item.title}” to your schedule?`,
                  [
                    { text: added ? 'Keep' : 'Not now', style: 'cancel' },
                    {
                      text: added ? 'Remove' : 'Add',
                      style: added ? 'destructive' : 'default',
                      onPress: () => {
                        setAddedIds((prev) => {
                          const next = new Set(prev);
                          if (added) next.delete(item.id);
                          else next.add(item.id);
                          return next;
                        });
                      },
                    },
                  ],
                );
              }}
              style={{ width: CAMPUS_CARD_WIDTH, height: CAMPUS_CARD_HEIGHT }}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
