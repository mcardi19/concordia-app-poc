import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/design-system';
import { fonts } from '@/design-system/fonts';
import { useTheme } from '@/design-system/theme';
import type { CampusTodayItem, UpdateItem } from './todayData';
import { todayShadowMedium, todayShadowSoft } from './todayShadows';

const UPDATE_CARD_WIDTH = 294;
const CAMPUS_CARD_WIDTH = 170;
const CAROUSEL_GAP = 12;
/** Room for card drop-shadows so horizontal ScrollView doesn't clip them. */
const SHADOW_INSET = 20;

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
  style: { overflow: 'visible' as const },
};

type UpdatesProps = {
  items: UpdateItem[];
  onPress?: (item: UpdateItem) => void;
};

export function TodayUpdatesCarousel({ items, onPress }: UpdatesProps) {
  const theme = useTheme();

  return (
    <View style={{ marginVertical: -SHADOW_INSET }}>
      <ScrollView
        {...horizontalCarouselProps}
        snapToInterval={UPDATE_CARD_WIDTH + CAROUSEL_GAP}
        contentContainerStyle={{
          gap: CAROUSEL_GAP,
          paddingLeft: theme.spacing.screenHorizontal,
          paddingRight: theme.spacing.screenHorizontal,
          paddingVertical: SHADOW_INSET,
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
              ...todayShadowSoft,
            }}
          >
            <View style={{ borderRadius: theme.radius.lg, overflow: 'hidden' }}>
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
                        fontFamily: fonts.interMedium,
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
                    fontFamily: fonts.interMedium,
                    fontSize: 13,
                    lineHeight: 13 * 1.2,
                    marginBottom: 4,
                  }}
                >
                  {item.eyebrow}
                </Text>
                <Text
                  variant="body"
                  style={{
                    fontFamily: fonts.interSemiBold,
                    fontSize: 16,
                    lineHeight: 16 * 1.2,
                    letterSpacing: -0.4,
                  }}
                >
                  {item.title}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

type CampusProps = {
  items: CampusTodayItem[];
  onPress?: (item: CampusTodayItem) => void;
};

export function TodayCampusCarousel({ items, onPress }: CampusProps) {
  const theme = useTheme();

  return (
    <View style={{ marginVertical: -SHADOW_INSET }}>
      <ScrollView
        {...horizontalCarouselProps}
        snapToInterval={CAMPUS_CARD_WIDTH + CAROUSEL_GAP}
        contentContainerStyle={{
          gap: CAROUSEL_GAP,
          paddingLeft: theme.spacing.screenHorizontal,
          paddingRight: theme.spacing.screenHorizontal,
          paddingVertical: SHADOW_INSET,
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
              ...todayShadowMedium,
            }}
          >
            <View style={{ borderRadius: theme.radius.lg, overflow: 'hidden' }}>
              <Image
                source={item.image}
                style={{ width: CAMPUS_CARD_WIDTH, height: 79 }}
                resizeMode="cover"
              />
              <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                <Text
                  variant="body"
                  style={{
                    fontFamily: fonts.interSemiBold,
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
                    fontFamily: fonts.interRegular,
                    fontSize: 13,
                    lineHeight: 13 * 1.45,
                    marginTop: 4,
                  }}
                >
                  {item.meta}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
