import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { MaterialSymbol, msChevronRightSemibold } from '@/components/icons';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import { primitiveFontWeight } from '@/design-system/tokens/primitive';

/**
 * Home's section heading, exported so the search screens use the same one
 * rather than a copy that drifts. `heading3` supplies the family and weight;
 * these override its size, which is why the number has to be shared.
 */
export const SECTION_HEADING_TEXT = {
  fontSize: 22,
  lineHeight: 22,
  // A step down from `heading3`'s bold — at 22pt over a list, bold reads as
  // shouting rather than structure.
  fontWeight: primitiveFontWeight.semiBold,
} as const;

/** The trailing link or count beside a section heading. */
export const SECTION_ACTION_TEXT = {
  fontWeight: '600' as const,
  letterSpacing: -0.1,
  fontSize: 14,
  lineHeight: 22,
};

type Props = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  showChevron?: boolean;
  onPress?: () => void;
};

export function TodaySectionHeader({
  title,
  actionLabel,
  onActionPress,
  showChevron = false,
  onPress,
}: Props) {
  const theme = useTheme();

  const heading = (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      <Text
        variant="heading3"
        style={{
          ...SECTION_HEADING_TEXT,
          ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
        }}
      >
        {title}
      </Text>
      {showChevron ? (
        <View style={{ marginBottom: -1 }}>
          <MaterialSymbol icon={msChevronRightSemibold} size={22} color={theme.color.primary} />
        </View>
      ) : null}
    </View>
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}
    >
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={title}
          hitSlop={8}
        >
          {heading}
        </Pressable>
      ) : (
        heading
      )}
      {actionLabel ? (
        <Pressable onPress={onActionPress} accessibilityRole="button" hitSlop={8}>
          <Text
            variant="caption"
            color="brand"
            style={SECTION_ACTION_TEXT}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
