import React from 'react';
import { StyleSheet, View } from 'react-native';
import { msSearch, msSecurity } from '@/components/icons';
import { HeaderIconButton } from './HeaderIconButton';

type Props = {
  onSecurityPress?: () => void;
  onSearchPress?: () => void;
};

/**
 * Header trailing actions for Today on Android. iOS builds the same pair as
 * native bar-button items in `TodayStack` — that is the only way to give each
 * its own liquid-glass capsule, since a React view in `headerRight` gets one
 * platter drawn around the whole slot.
 */
export function TodayHeaderActions({ onSecurityPress, onSearchPress }: Props) {
  return (
    <View style={styles.row}>
      <HeaderIconButton
        icon={msSecurity}
        accessibilityLabel="Security"
        onPress={onSecurityPress}
      />
      <HeaderIconButton icon={msSearch} accessibilityLabel="Search" onPress={onSearchPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
