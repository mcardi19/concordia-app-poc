import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';

type Props = {
  children: string;
  /** Optional trailing affordance ("See all"). */
  action?: string;
  onActionPress?: () => void;
};

/**
 * Section heading — matches Home (`TodaySectionHeader`) type and spacing.
 */
export function MeSectionLabel({ children, action, onActionPress }: Props) {
  return (
    <View style={styles.row}>
      <Text
        variant="heading3"
        style={{
          fontSize: 22,
          lineHeight: 22,
          ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
        }}
      >
        {children}
      </Text>
      {action ? (
        <Pressable onPress={onActionPress} accessibilityRole="button" hitSlop={8}>
          <Text
            variant="caption"
            color="brand"
            style={{
              fontWeight: '600',
              letterSpacing: -0.1,
              fontSize: 14,
              lineHeight: 22,
            }}
          >
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});
