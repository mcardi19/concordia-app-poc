import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialSymbol } from '@/components/icons';
import { Text } from '@/components/design-system';
import { useTheme } from '@/design-system/theme';
import { useTodayTheme } from '@/screens/today/todayTheme';
import type { AttentionItem } from './todayData';
import { todayShadowSoft } from './todayShadows';

type Props = {
  items: AttentionItem[];
  onActionPress?: (item: AttentionItem) => void;
};

/**
 * Same row treatment as Search “Browse services”: white icon chip + inset
 * hairline, no grouped card. Stacked, not paged.
 */
export function TodayAttentionList({ items, onActionPress }: Props) {
  const theme = useTheme();
  const todayTheme = useTodayTheme();

  return (
    <View style={styles.list}>
      {items.map((item) => {
        return (
          <View key={item.id} style={styles.row}>
            <View
              style={[
                styles.icon,
                todayShadowSoft,
                { backgroundColor: todayTheme.cardBackground },
              ]}
            >
              <MaterialSymbol icon={item.icon} size={26} color={theme.color.primary} />
            </View>
            <View style={[styles.body, styles.bodyRule]}>
              <View style={styles.text}>
                <Text variant="body" style={styles.title}>
                  {item.title}
                </Text>
                <Text variant="body" numberOfLines={1} style={styles.subtitle}>
                  {item.subtitle}
                </Text>
              </View>
              <Pressable
                onPress={() => onActionPress?.(item)}
                accessibilityRole="button"
                accessibilityLabel={item.actionLabel}
                style={({ pressed }) => [
                  styles.pill,
                  { backgroundColor: `${theme.color.primary}1A`, opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Text variant="body" color="brand" style={styles.pillLabel}>
                  {item.actionLabel}
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 13,
    paddingTop: 14,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 14,
  },
  bodyRule: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.22)',
  },
  title: {
    fontSize: 16,
    lineHeight: 16 * 1.25,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 15 * 1.4,
    color: '#7A7A7C',
    marginTop: 2,
  },
  pill: {
    borderRadius: 8,
    borderCurve: 'continuous',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillLabel: {
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 15 * 1.2,
    letterSpacing: -0.2,
  },
});
