import React from 'react';
import { Animated, Pressable, View } from 'react-native';
import { MaterialSymbol, msSearch, msSecurity } from '@/components/icons';
import { Text } from '@/components/design-system';
import { fonts } from '@/design-system/fonts';
import { useTheme } from '@/design-system/theme';
import { todayTheme } from '@/screens/today/todayTheme';
import { todayShadowSoft } from './todayShadows';

type Props = {
  greeting: string;
  dateLabel: string;
  titleOpacity?: Animated.Value | Animated.AnimatedInterpolation<number>;
  onSecurityPress?: () => void;
  onSearchPress?: () => void;
};

export function TodayMasthead({
  greeting,
  dateLabel,
  titleOpacity,
  onSecurityPress,
  onSearchPress,
}: Props) {
  const theme = useTheme();

  const actionButtonStyle = {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: todayTheme.pageBackground,
    borderWidth: 1,
    borderColor: theme.color.background,
    ...todayShadowSoft,
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          { flex: 1, paddingRight: theme.spacing.sm },
          titleOpacity != null ? { opacity: titleOpacity } : null,
        ]}
      >
        <Text
          variant="body"
          style={{
            fontFamily: fonts.interSemiBold,
            fontSize: 27,
            lineHeight: 27 * 1.02,
            letterSpacing: -1.2,
            marginBottom: 0,
          }}
        >
          {greeting}
        </Text>
        <Text
          variant="body"
          color="subtle"
          style={{
            fontFamily: fonts.interSemiBold,
            fontSize: 16,
            lineHeight: 16 * 1.2,
            letterSpacing: -0.4,
          }}
        >
          {dateLabel}
        </Text>
      </Animated.View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          style={actionButtonStyle}
          onPress={onSecurityPress}
          accessibilityRole="button"
          accessibilityLabel="Security"
        >
          <MaterialSymbol icon={msSecurity} size={24} color={theme.color.primary} />
        </Pressable>
        <Pressable
          style={actionButtonStyle}
          onPress={onSearchPress}
          accessibilityRole="button"
          accessibilityLabel="Search"
        >
          <MaterialSymbol icon={msSearch} size={24} color={theme.color.primary} />
        </Pressable>
      </View>
    </View>
  );
}
