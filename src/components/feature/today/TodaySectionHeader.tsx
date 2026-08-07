import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { MaterialSymbol, msChevronRightSemibold } from '@/components/icons';
import { Text } from '@/components/design-system';
import { fonts } from '@/design-system/fonts';
import { useTheme } from '@/design-system/theme';

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
        variant="body"
        style={{
          fontFamily: fonts.interSemiBold,
          fontSize: 20,
          lineHeight: 20,
          letterSpacing: -0.4,
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
            style={{
              fontFamily: fonts.interMedium,
              letterSpacing: 0.2,
              fontSize: 11,
              lineHeight: 11 * 1.2,
            }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
