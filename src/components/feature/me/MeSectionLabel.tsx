import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import {
  SECTION_ACTION_TEXT,
  SECTION_HEADING_TEXT,
} from '@/components/feature/today/TodaySectionHeader';

type Props = {
  children: string;
  /** Optional trailing affordance ("See all"). */
  action?: string;
  onActionPress?: () => void;
};

/**
 * Section heading — Home's (`TodaySectionHeader`), from the same constants
 * rather than a second copy of its numbers, which is how this one ended up a
 * step heavier than Home when that changed.
 */
export function MeSectionLabel({ children, action, onActionPress }: Props) {
  return (
    <View style={styles.row}>
      <Text
        variant="heading3"
        style={{
          ...SECTION_HEADING_TEXT,
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
            style={SECTION_ACTION_TEXT}
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
