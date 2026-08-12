import React from 'react';
import { View } from 'react-native';
import { msSecurity } from '@/components/icons';
import { HeaderIconButton } from './HeaderIconButton';
import { HeaderProfileButton } from './HeaderProfileButton';

type Props = {
  onSecurityPress?: () => void;
};

/**
 * Header trailing actions for Today (Security + Profile). Search left this row
 * when it became its own tab; the profile disc took its slot.
 */
export function TodayHeaderActions({ onSecurityPress }: Props) {
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
      <HeaderProfileButton />
    </View>
  );
}
