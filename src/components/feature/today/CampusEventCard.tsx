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
import {
  CAMPUS_EVENT_FORMAT_LABEL,
  campusEventCostLabel,
  type CampusTodayItem,
} from './todayData';

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
 * Photo event card: image on top, title and meta below — not overlaid.
 * Share and calendar-add sit on the trailing edge of the photo.
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
  const glyphSize = compact ? 20 : 22;

  const onShare = useCallback(() => {
    void Share.share({
      title: item.title,
      message: `${item.title}\n${item.time} · ${item.location}`,
    }).catch(() => undefined);
  }, [item.location, item.time, item.title]);

  return (
    <View style={[styles.card, style]}>
      <View
        style={[
          styles.imageFrame,
          compact ? styles.imageFrameCompact : styles.imageFrameList,
          { borderRadius: radius },
        ]}
      >
        <Image source={item.image} style={styles.image} resizeMode="cover" />
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
      </View>
      <View style={styles.caption}>
        <Text
          variant="body"
          numberOfLines={2}
          style={[
            styles.title,
            compact ? styles.titleCompact : null,
            { color: theme.color.text.primary },
          ]}
        >
          {item.title}
        </Text>
        <View style={styles.metaRow}>
          <MaterialSymbol
            icon={msScheduleClock}
            size={compact ? 14 : 16}
            color={theme.color.text.subtle}
          />
          <Text
            variant="body"
            numberOfLines={1}
            style={[styles.metaTime, { color: theme.color.text.secondary }]}
          >
            {item.time}
          </Text>
          <View style={styles.metaLocationIcon}>
            <MaterialSymbol
              icon={msLocationOn}
              size={compact ? 14 : 16}
              color={theme.color.text.subtle}
            />
          </View>
          <Text
            variant="body"
            numberOfLines={1}
            style={[styles.meta, { color: theme.color.text.secondary }]}
          >
            {item.location}
          </Text>
        </View>
        <Text
          variant="body"
          numberOfLines={1}
          style={[styles.details, { color: theme.color.text.secondary }]}
        >
          {`Cost ${campusEventCostLabel(item.cost)} · Format ${CAMPUS_EVENT_FORMAT_LABEL[item.format]}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'visible',
  },
  imageFrame: {
    width: '100%',
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  imageFrameCompact: {
    height: 160,
  },
  imageFrameList: {
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  caption: {
    paddingTop: 10,
    gap: 2,
  },
  title: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 18 * 1.2,
    letterSpacing: -0.3,
  },
  titleCompact: {
    fontSize: 16,
    lineHeight: 16 * 1.2,
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
