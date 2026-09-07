import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { MeBottomSheet } from '@/components/feature/me';
import {
  CAMPUS_EVENT_FILTERS,
  CAMPUS_EVENT_FORMAT_LABEL,
  type CampusEventCategory,
  type CampusEventFormat,
} from '@/components/feature/today/todayData';
import { useTheme } from '@/design-system/theme';
import { searchTheme } from '@/screens/search/searchTheme';

export type FormatFilter = CampusEventFormat | 'all';
export type CostFilter = 'all' | 'free' | 'paid';

const FORMAT_OPTIONS: { id: FormatFilter; label: string }[] = [
  { id: 'all', label: 'Any' },
  { id: 'in-person', label: CAMPUS_EVENT_FORMAT_LABEL['in-person'] },
  { id: 'hybrid', label: CAMPUS_EVENT_FORMAT_LABEL.hybrid },
  { id: 'online', label: CAMPUS_EVENT_FORMAT_LABEL.online },
];

const COST_OPTIONS: { id: CostFilter; label: string }[] = [
  { id: 'all', label: 'Any' },
  { id: 'free', label: 'Free' },
  { id: 'paid', label: 'Paid' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  category: CampusEventCategory | 'all';
  onCategory: (id: CampusEventCategory | 'all') => void;
  format: FormatFilter;
  onFormat: (id: FormatFilter) => void;
  cost: CostFilter;
  onCost: (id: CostFilter) => void;
  onReset: () => void;
  canReset: boolean;
};

type ChipSetProps<T extends string> = {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
};

function ChipSet<T extends string>({ label, options, value, onChange }: ChipSetProps<T>) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <Text variant="bodySmall" style={[styles.sectionLabel, { color: searchTheme.metaText }]}>
        {label}
      </Text>
      <View style={styles.chipWrap}>
        {options.map((option) => {
          const on = option.id === value;
          return (
            <Pressable
              key={option.id}
              onPress={() => onChange(option.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={option.label}
              style={[
                styles.chip,
                on
                  ? {
                      backgroundColor: theme.color.primary,
                      borderColor: theme.color.primary,
                    }
                  : {
                      backgroundColor: searchTheme.cardBackground,
                      borderColor: searchTheme.cardBorder,
                    },
              ]}
            >
              <Text
                variant="bodySmall"
                style={[
                  styles.chipLabel,
                  { color: on ? theme.color.text.inverse : searchTheme.bodyText },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Filter sheet for Campus events — category, format, and cost. */
export function CampusEventFilterSheet({
  visible,
  onClose,
  category,
  onCategory,
  format,
  onFormat,
  cost,
  onCost,
  onReset,
  canReset,
}: Props) {
  const theme = useTheme();

  return (
    <MeBottomSheet
      visible={visible}
      title="Filters"
      onClose={onClose}
      trailing={
        <Pressable
          onPress={onReset}
          disabled={!canReset}
          accessibilityRole="button"
          accessibilityLabel="Reset filters"
          hitSlop={8}
          style={({ pressed }) => ({ opacity: !canReset ? 0.35 : pressed ? 0.6 : 1 })}
        >
          <Text
            variant="body"
            style={[styles.reset, { color: theme.color.primary }]}
          >
            Reset
          </Text>
        </Pressable>
      }
    >
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
      >
        <ChipSet
          label="Category"
          options={CAMPUS_EVENT_FILTERS}
          value={category}
          onChange={onCategory}
        />
        <ChipSet
          label="Format"
          options={FORMAT_OPTIONS}
          value={format}
          onChange={onFormat}
        />
        <ChipSet
          label="Cost"
          options={COST_OPTIONS}
          value={cost}
          onChange={onCost}
        />
      </ScrollView>
    </MeBottomSheet>
  );
}

const styles = StyleSheet.create({
  reset: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
  },
  body: {
    gap: 20,
    paddingBottom: 8,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
