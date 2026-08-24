import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/design-system';
import { MaterialSymbol, msBookmark, msBookmarkFill } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { meTheme } from '@/screens/me/meTheme';
import { MeBottomSheet } from './MeBottomSheet';

/** A row in the collection sheet. */
export type MeCollectionRow = {
  id: string;
  name: string;
  subtitle: string;
  monogram: string;
  /** Circle fill for clubs; services fall back to the neutral chip. */
  tint?: string;
};

type Props = {
  /** Sheet is presented when non-null. */
  title: string | null;
  rows: MeCollectionRow[];
  shape: 'circle' | 'rounded';
  savedIds: ReadonlySet<string>;
  onToggleSaved: (id: string) => void;
  onRowPress?: (row: MeCollectionRow) => void;
  onClose: () => void;
};

/**
 * Bottom sheet listing a full collection. The panel itself is
 * `MeBottomSheet`, shared with the edit-profile drawer; only the rows are
 * local to this one.
 */
export function MeCollectionSheet({
  title,
  rows,
  shape,
  savedIds,
  onToggleSaved,
  onRowPress,
  onClose,
}: Props) {
  const theme = useTheme();

  return (
    <MeBottomSheet visible={title != null} title={title ?? ''} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.rows}>
              {rows.map((row) => {
                const saved = savedIds.has(row.id);
                const tinted = row.tint != null;
                return (
                  <Pressable
                    key={row.id}
                    onPress={onRowPress ? () => onRowPress(row) : undefined}
                    accessibilityRole={onRowPress ? 'button' : undefined}
                    style={({ pressed }) => [styles.row, { opacity: pressed ? 0.85 : 1 }]}
                  >
                    <View
                      style={[
                        styles.rowIcon,
                        {
                          borderRadius: shape === 'circle' ? 18 : 10,
                          backgroundColor: row.tint ?? meTheme.stackFill,
                        },
                      ]}
                    >
                      <Text
                        variant="caption"
                        style={{
                          fontSize: 13,
                          lineHeight: 15,
                          fontWeight: '700',
                          color: tinted ? theme.color.text.inverse : theme.color.primary,
                        }}
                      >
                        {row.monogram}
                      </Text>
                    </View>

                    <View style={styles.rowText}>
                      <Text
                        variant="bodySmall"
                        numberOfLines={1}
                        style={{
                          fontSize: 15,
                          fontWeight: '600',
                          color: meTheme.headingText,
                        }}
                      >
                        {row.name}
                      </Text>
                      <Text
                        variant="caption"
                        numberOfLines={1}
                        style={{ fontSize: 12.5, color: meTheme.metaText, marginTop: 2 }}
                      >
                        {row.subtitle}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => onToggleSaved(row.id)}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: saved }}
                      accessibilityLabel={saved ? `Unsave ${row.name}` : `Save ${row.name}`}
                      hitSlop={10}
                    >
                      <MaterialSymbol
                        icon={saved ? msBookmarkFill : msBookmark}
                        size={19}
                        color={saved ? theme.color.primary : meTheme.chevron}
                      />
                    </Pressable>
                  </Pressable>
                );
              })}
      </ScrollView>
    </MeBottomSheet>
  );
}

const styles = StyleSheet.create({
  rows: {
    gap: 8,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: meTheme.sheetRowBorder,
    borderRadius: 10,
    borderCurve: 'continuous',
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
});
