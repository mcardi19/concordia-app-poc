import React from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import type { MsIconDefinition } from 'material-symbols-react-native';
import { Text } from '@/components/design-system';
import { MaterialSymbol, msChevronRight } from '@/components/icons';
import { radiusStyle, useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { useMeTheme } from '@/screens/me/meTheme';

export type MeSettingsRow = {
  id: string;
  label: string;
  icon?: MsIconDefinition;
  /** Trailing value ("On", "English", "v2.4.0"). */
  value?: string;
  /** Renders a switch instead of a chevron. */
  toggle?: boolean;
  onToggle?: (next: boolean) => void;
  onPress?: () => void;
  /** Destructive — sign out. Tints the label and drops the chevron. */
  danger?: boolean;
};

type Props = {
  /** Sentence-case group heading. Omitted for an ungrouped card. */
  label?: string;
  rows: MeSettingsRow[];
  /** Rule above the heading. Off for a group with nothing above it. */
  topRule?: boolean;
};

const ICON_SIZE = 34;

/**
 * A settings group — heading plus its rows.
 *
 * No card around the rows: they sit straight on the page and run full width,
 * matching the notifications inbox. The rules do the grouping instead, and
 * they are inset to the label so they read as separating entries rather than
 * boxing them in.
 */
export function MeSettingsGroup({ label, rows, topRule = true }: Props) {
  const theme = useTheme();
  const me = useMeTheme();

  return (
    <View
      style={[
        styles.block,
        topRule
          ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: me.rowDivider }
          : null,
      ]}
    >
      {label ? (
        <Text variant="body" style={[styles.groupLabel, { color: me.headingText }]}>
          {label}
        </Text>
      ) : null}

      {rows.map((row, index) => {
        const last = index === rows.length - 1;
        const tint = row.danger ? me.danger : theme.color.primary;
        /*
          A toggle owns its own hit target, so the row must not also be one.
          Tested against null, not truthiness — an off toggle is `false`,
          which would otherwise make the row pressable again.
        */
        const interactive = row.onPress != null && row.toggle == null;

        const content = (
          <>
            {row.icon ? (
              <View style={[styles.icon, radiusStyle(9), { backgroundColor: `${tint}1A` }]}>
                <MaterialSymbol icon={row.icon} size={18} color={tint} />
              </View>
            ) : null}

            {/*
              Label, value and trailing control share one column so the rule
              can hang off it — starting at the label, clear of the icon.
            */}
            <View
              style={[
                styles.rowContent,
                !last
                  ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: me.listDivider }
                  : null,
              ]}
            >
              <Text
                variant="body"
                numberOfLines={1}
                style={[styles.label, { color: row.danger ? me.danger : me.headingText }]}
              >
                {row.label}
              </Text>

              {row.value ? (
                <Text variant="body" style={[styles.value, { color: me.metaText }]}>
                  {row.value}
                </Text>
              ) : null}

              {row.toggle != null ? (
                <Switch
                  value={row.toggle}
                  onValueChange={row.onToggle}
                  trackColor={{ true: theme.color.primary, false: me.chipIdleBorder }}
                  accessibilityLabel={row.label}
                />
              ) : null}

              {/* Destructive rows are the end of the line, not a drill-down. */}
              {!row.danger && row.toggle == null ? (
                <MaterialSymbol icon={msChevronRight} size={20} color={me.chevron} />
              ) : null}
            </View>
          </>
        );

        return interactive ? (
          <Pressable
            key={row.id}
            onPress={row.onPress}
            accessibilityRole="button"
            accessibilityLabel={row.value ? `${row.label}, ${row.value}` : row.label}
            style={({ pressed }) => [styles.row, pressed ? { opacity: 0.6 } : null]}
          >
            {content}
          </Pressable>
        ) : (
          <View key={row.id} style={styles.row}>
            {content}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    paddingTop: 16,
    marginTop: 12,
  },
  /*
    Sentence case, so no overline tracking — that spacing exists to open up
    all-caps and just reads loose on mixed case.
  */
  groupLabel: {
    fontSize: 15.5,
    fontWeight: '600',
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: semanticSpacing.screenHorizontal,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  /** Carries the row's vertical padding, so its rule lands on the row edge. */
  rowContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    minHeight: 56,
  },
  label: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
  },
});
