import React from 'react';
import { View } from 'react-native';
import { msSearch, msSecurity } from '@/components/icons';
import { HeaderIconButton } from './HeaderIconButton';

type Props = {
  onSecurityPress?: () => void;
  onSearchPress?: () => void;
};

/** Header trailing actions for Today (Security + Search). */
export function TodayHeaderActions({ onSecurityPress, onSearchPress }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <HeaderIconButton
        icon={msSecurity}
        accessibilityLabel="Security"
        onPress={onSecurityPress}
      />
      <HeaderIconButton icon={msSearch} accessibilityLabel="Search" onPress={onSearchPress} />
    </View>
  );
}
