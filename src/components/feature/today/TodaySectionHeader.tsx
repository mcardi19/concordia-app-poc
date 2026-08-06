import React from 'react';
import { Pressable, View } from 'react-native';
import { MaterialSymbol, msChevronRight } from '@/components/icons';
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
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text
        variant="body"
        style={{
          fontFamily: fonts.interSemiBold,
          fontSize: 18,
          lineHeight: 18 * 1.02,
          letterSpacing: -0.4,
        }}
      >
        {title}
      </Text>
      {showChevron ? (
        <MaterialSymbol icon={msChevronRight} size={18} color={theme.color.primary} />
      ) : null}
    </View>
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 10,
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
