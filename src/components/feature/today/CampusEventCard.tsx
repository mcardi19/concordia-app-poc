import React from 'react';
import { Image, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/design-system';
import {
  MaterialSymbol,
  msCalendarAddOnFillSemibold,
  msCalendarAddOnSemibold,
  msLocationOn,
  msScheduleClock,
} from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import type { CampusTodayItem } from './todayData';

const SCRIM_COLORS = [
  'transparent',
  'rgba(0, 0, 0, 0.7)',
  'rgba(0, 0, 0, 1)',
] as const;
const ON_SCRIM = '#FFFFFF';

type Props = {
  item: CampusTodayItem;
  radius: number;
  added?: boolean;
  onToggleAdd?: () => void;
  /** Fixed size for carousel tiles; list cards stretch to parent width. */
  style?: StyleProp<ViewStyle>;
  /** Slightly smaller type for the narrower home carousel. */
  compact?: boolean;
};

/**
 * Full-bleed photo event card: dark bottom scrim, title + meta overlaid,
 * calendar-add control on the trailing edge.
 */
export function CampusEventCard({
  item,
  radius,
  added = false,
  onToggleAdd,
  style,
  compact = false,
}: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { borderRadius: radius }, style]}>
      <Image source={item.image} style={styles.image} resizeMode="cover" />
      <LinearGradient
        pointerEvents="none"
        colors={[...SCRIM_COLORS]}
        locations={[0.35, 0.68, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.scrim}
      />
      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <View style={styles.copy}>
            <Text
              variant="body"
              numberOfLines={2}
              style={[
                styles.title,
                compact ? styles.titleCompact : null,
                { color: ON_SCRIM },
              ]}
            >
              {item.title}
            </Text>
            <View style={styles.metaRow}>
              <MaterialSymbol
                icon={msScheduleClock}
                size={compact ? 14 : 16}
                color={ON_SCRIM}
              />
              <Text
                variant="body"
                numberOfLines={1}
                style={[styles.metaTime, { color: ON_SCRIM }]}
              >
                {item.time}
              </Text>
              <View style={styles.metaLocationIcon}>
                <MaterialSymbol
                  icon={msLocationOn}
                  size={compact ? 14 : 16}
                  color={ON_SCRIM}
                />
              </View>
              <Text
                variant="body"
                numberOfLines={1}
                style={[styles.meta, { color: 'rgba(255, 255, 255, 0.85)' }]}
              >
                {item.location}
              </Text>
            </View>
          </View>
          {onToggleAdd ? (
            <Pressable
              onPress={onToggleAdd}
              accessibilityRole="button"
              accessibilityState={{ selected: added }}
              accessibilityLabel={
                added ? 'Remove from schedule' : 'Add to schedule'
              }
              style={({ pressed }) => [
                styles.addButton,
                compact ? styles.addButtonCompact : null,
                {
                  backgroundColor: added ? theme.color.primary : ON_SCRIM,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <MaterialSymbol
                icon={msCalendarAddOnSemibold}
                filled={msCalendarAddOnFillSemibold}
                active={added}
                size={compact ? 20 : 22}
                color={added ? ON_SCRIM : theme.color.primary}
              />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderCurve: 'continuous',
    overflow: 'hidden',
    height: 260,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  cardBody: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 22 * 1.2,
    letterSpacing: -0.4,
  },
  titleCompact: {
    fontSize: 18,
    lineHeight: 18 * 1.2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  metaTime: {
    flexShrink: 0,
    fontSize: 14,
    lineHeight: 14 * 1.35,
  },
  metaLocationIcon: {
    marginLeft: 8,
  },
  meta: {
    flexShrink: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 14 * 1.35,
  },
});
