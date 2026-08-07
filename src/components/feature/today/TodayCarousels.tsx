import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import type { CampusTodayItem, UpdateItem } from './todayData';

const UPDATE_CARD_WIDTH = 294;
const CAMPUS_CARD_WIDTH = 170;
const CAROUSEL_GAP = 12;

const horizontalCarouselProps = {
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
            backgroundColor: theme.color.background,
            overflow: 'hidden',
          }}
        >
          <View style={{ height: 136, width: UPDATE_CARD_WIDTH }}>
            <Image
              source={item.image}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            <View style={{ position: 'absolute', top: 10, left: 10 }}>
              <View
                style={{
                  backgroundColor: theme.color.background,
                  borderRadius: 7,
                  paddingHorizontal: 9,
                  paddingVertical: 4,
                }}
              >
                <Text
                  variant="caption"
                  style={{
                    fontWeight: '500',
                    fontSize: 11,
                    lineHeight: 11 * 1.2,
                    letterSpacing: 0.2,
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
                lineHeight: 18 * 1.2,
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
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onPress?.(item)}
          accessibilityRole="button"
          accessibilityLabel={item.title}
          style={{
            width: CAMPUS_CARD_WIDTH,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.color.background,
            overflow: 'hidden',
          }}
        >
          <Image
            source={item.image}
            style={{ width: CAMPUS_CARD_WIDTH, height: 79 }}
            resizeMode="cover"
          />
          <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
            <Text
              variant="body"
              style={{
                fontWeight: '600',
                fontSize: 16,
                lineHeight: 16 * 1.2,
                letterSpacing: -0.4,
              }}
            >
              {item.title}
            </Text>
            <Text
              variant="body"
              color="subtle"
              style={{
                fontWeight: '400',
                fontSize: 13,
                lineHeight: 13 * 1.45,
                marginTop: 4,
              }}
            >
              {item.meta}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
