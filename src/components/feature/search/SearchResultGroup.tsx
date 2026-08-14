import React, { type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import type { MsIconDefinition } from 'material-symbols-react-native';
import { Text } from '@/components/design-system';
import { MaterialSymbol, msChevronRight } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { semanticSpacing } from '@/design-system/tokens';
import { searchTheme } from '@/screens/search/searchTheme';
import { SearchSurface } from './SearchSurface';

/** Sentence-case label above a grouped card, with an optional count and action. */
export function SearchGroupLabel({
  children,
  count,
  action,
  onActionPress,
}: {
  children: string;
  count?: number;
  action?: string;
  onActionPress?: () => void;
}) {
  return (
    <View style={styles.labelRow}>
      <Text variant="caption" style={styles.label}>
        {children}
        {count != null ? <Text style={styles.labelCount}>{`  ${count}`}</Text> : null}
      </Text>
      {action ? (
        <Pressable onPress={onActionPress} accessibilityRole="button" hitSlop={8}>
          <Text variant="caption" color="brand" style={styles.action}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Label + the glass card that holds the rows. */
export function SearchResultGroup({
  label,
  count,
  action,
  onActionPress,
  elevated,
  children,
}: {
  label: string;
  count?: number;
  action?: string;
  onActionPress?: () => void;
  /** Lifts the card off the page on a faint brand shadow — the best match. */
  elevated?: boolean;
  children: ReactNode;
}) {
  const card = <SearchSurface style={styles.card}>{children}</SearchSurface>;

  return (
    <View style={styles.group}>
      <SearchGroupLabel count={count} action={action} onActionPress={onActionPress}>
        {label}
      </SearchGroupLabel>
      {/* The shadow sits on a wrapper: the glass sets `overflow: hidden`, which
          clips a shadow drawn on the surface itself. */}
      {elevated ? <View style={styles.elevated}>{card}</View> : card}
    </View>
  );
}

type RowProps = {
  title: string;
  subtitle?: string;
  icon: MsIconDefinition;
  /** Open/closed line under the subtitle, with its own dot colour. */
  status?: string;
  statusTone?: string;
  /** Substring to mark — the query the row matched on. */
  highlight?: string;
  last?: boolean;
  onPress?: () => void;
};

/**
 * One result. The matched substring is marked rather than the whole title
 * bolded, so a student can see *why* a row came back.
 */
export function SearchResultRow({
  title,
  subtitle,
  icon,
  status,
  statusTone,
  highlight,
  last,
  onPress,
}: RowProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      style={({ pressed }) => [
        styles.row,
        !last ? styles.rowDivider : null,
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: `${theme.color.primary}0E` }]}>
        <MaterialSymbol icon={icon} size={20} color={theme.color.primary} />
      </View>

      <View style={styles.rowText}>
        <Text variant="bodySmall" style={styles.rowTitle}>
          {renderHighlighted(title, highlight, theme.color.primary)}
        </Text>
        {subtitle ? (
          <Text variant="caption" numberOfLines={1} style={styles.rowSubtitle}>
            {subtitle}
          </Text>
        ) : null}
        {status ? (
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusTone ?? searchTheme.statusNeutral },
              ]}
            />
            <Text
              variant="caption"
              style={[styles.statusText, { color: statusTone ?? searchTheme.statusNeutral }]}
            >
              {status}
            </Text>
          </View>
        ) : null}
      </View>

      <MaterialSymbol icon={msChevronRight} size={18} color={searchTheme.chevron} />
    </Pressable>
  );
}

/** Splits a title on the matched query so the hit can be tinted in place. */
function renderHighlighted(title: string, highlight: string | undefined, tint: string) {
  const needle = highlight?.trim();
  if (!needle) return title;
  const at = title.toLowerCase().indexOf(needle.toLowerCase());
  if (at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <Text style={{ color: tint, fontWeight: '700' }}>
        {title.slice(at, at + needle.length)}
      </Text>
      {title.slice(at + needle.length)}
    </>
  );
}

const styles = StyleSheet.create({
  group: {
    paddingTop: 22,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: semanticSpacing.screenHorizontal,
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    // Sentence case does not need the tracking uppercase does to stay legible.
    letterSpacing: 0,
    color: searchTheme.eyebrowText,
  },
  labelCount: {
    fontWeight: '700',
    color: searchTheme.eyebrowCount,
  },
  action: {
    fontSize: 13,
    lineHeight: 14,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: semanticSpacing.screenHorizontal,
  },
  elevated: {
    borderRadius: 12,
    borderCurve: 'continuous',
    ...Platform.select({
      ios: {
        shadowColor: '#912238',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: searchTheme.rowDivider,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '600',
    color: searchTheme.headingText,
  },
  rowSubtitle: {
    fontSize: 12.5,
    lineHeight: 16,
    color: searchTheme.metaText,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: '600',
  },
});
