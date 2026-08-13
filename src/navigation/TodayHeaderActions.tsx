import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from '@/components/design-system';
import { msPerson, msSecurity } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { meNotificationCount } from '@/screens/me/accountData';
import { HeaderIconButton } from './HeaderIconButton';

type Props = {
  onSecurityPress?: () => void;
};

/**
 * Header trailing actions for Today on Android. iOS builds the same pair as
 * native bar-button items in `TodayStack` — that is the only way to give each
 * its own liquid-glass capsule, since a React view in `headerRight` gets one
 * platter drawn around the whole slot.
 */
export function TodayHeaderActions({ onSecurityPress }: Props) {
  const theme = useTheme();
  const navigation = useNavigation();
  const badge = meNotificationCount;

  return (
    <View style={styles.row}>
      <HeaderIconButton
        icon={msSecurity}
        accessibilityLabel="Security"
        onPress={onSecurityPress}
      />

      <View>
        <HeaderIconButton
          icon={msPerson}
          accessibilityLabel={badge > 0 ? `Profile, ${badge} notifications` : 'Profile'}
          onPress={() => navigation.navigate('MeHome' as never)}
        />
        {badge > 0 ? (
          <View style={[styles.badge, { borderColor: theme.color.background }]}>
            <Text
              variant="caption"
              style={{ fontSize: 10, lineHeight: 12, fontWeight: '700', color: '#FFFFFF' }}
            >
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5342A',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});
