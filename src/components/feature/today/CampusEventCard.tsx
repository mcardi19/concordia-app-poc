import React, { useCallback } from 'react';
import {
  Image,
  Pressable,
  Share,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/design-system';
import {
  MaterialSymbol,
  msCalendarAddOnFillSemibold,
  msCalendarAddOnSemibold,
  msIosShareSemibold,
  msLocationOn,
  msScheduleClock,
} from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { SESSION_CARD_RADIUS } from './SessionHero';
import {
  CAMPUS_EVENT_FORMAT_LABEL,
  campusEventCostLabel,
  type CampusTodayItem,
} from './todayData';

const SCRIM_COLORS = [
  'transparent',
  'rgba(0, 0, 0, 0.7)',
  'rgba(0, 0, 0, 1)',
] as const;
const ON_SCRIM = '#FFFFFF';
const ON_SCRIM_MUTED = 'rgba(255, 255, 255, 0.85)';

type Props = {
  item: CampusTodayItem;
  added?: boolean;
  onToggleAdd?: () => void;
  /** Fixed size for carousel tiles; list cards stretch to parent width. */
  style?: StyleProp<ViewStyle>;
  /** Slightly smaller type for the narrower home carousel. */
  compact?: boolean;
};

type PhotoActionProps = {
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityState?: { selected?: boolean };
  compact: boolean;
  backgroundColor: string;
  children: React.ReactNode;
};

function PhotoActionButton({
  onPress,
  accessibilityLabel,
  accessibilityState,
  compact,
  backgroundColor,
  children,
}: PhotoActionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      hitSlop={4}
      style={({ pressed }) => [
        styles.photoAction,
        compact ? styles.photoActionCompact : null,
        { backgroundColor, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {children}
    </Pressable>
  );
}

/**
 * Full-bleed photo event card: dark bottom scrim, title + meta overlaid,
 * share and calendar-add on the trailing edge of the photo.
 */
export function CampusEventCard({
  item,
  added = false,
  onToggleAdd,
  style,
  compact = false,
}: Props) {
  const theme = useTheme();
  const glyphSize = compact ? 20 : 22;

  const onShare = useCallback(() => {
    void Share.share({
      title: item.title,
      message: `${item.title}\n${item.time} · ${item.location}`,
    }).catch(() => undefined);
  }, [item.location, item.time, item.title]);

  return (
    <View style={[styles.card, compact ? styles.cardCompact : styles.cardList, style]}>
      <Image source={item.image} style={styles.image} resizeMode="cover" />
      <LinearGradient
        pointerEvents="none"
        colors={[...SCRIM_COLORS]}
        locations={[0.35, 0.68, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.scrim}
      />
      <View style={styles.imageActions} pointerEvents="box-none">
        <PhotoActionButton
          onPress={onShare}
          accessibilityLabel={`Share ${item.title}`}
          compact={compact}
          backgroundColor="#FFFFFF"
        >
          <MaterialSymbol
            icon={msIosShareSemibold}
            size={glyphSize}
            color={theme.color.primary}
          />
        </PhotoActionButton>
        {onToggleAdd ? (
          <PhotoActionButton
            onPress={onToggleAdd}
            accessibilityLabel={
              added ? 'Remove from schedule' : 'Add to schedule'
            }
            accessibilityState={{ selected: added }}
            compact={compact}
            backgroundColor={added ? theme.color.primary : '#FFFFFF'}
          >
            <MaterialSymbol
              icon={msCalendarAddOnSemibold}
              filled={msCalendarAddOnFillSemibold}
              active={added}
              size={glyphSize}
              color={added ? '#FFFFFF' : theme.color.primary}
            />
          </PhotoActionButton>
        ) : null}
      </View>
      <View style={styles.cardBody} pointerEvents="none">
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
            style={[styles.meta, { color: ON_SCRIM_MUTED }]}
          >
            {item.location}
          </Text>
        </View>
        <Text
          variant="body"
          numberOfLines={1}
          style={[styles.details, { color: ON_SCRIM_MUTED }]}
        >
          {`Cost ${campusEventCostLabel(item.cost)} · Format ${CAMPUS_EVENT_FORMAT_LABEL[item.format]}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: SESSION_CARD_RADIUS,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  cardCompact: {
    height: 220,
  },
  cardList: {
    height: 275,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  imageActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  photoAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActionCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  cardBody: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 16,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
    marginTop: 2,
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
  details: {
    fontSize: 14,
    lineHeight: 14 * 1.35,
    marginTop: 2,
  },
});
