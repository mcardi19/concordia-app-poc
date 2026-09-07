import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/design-system';
import { getDevBuildInfo } from '@/config/devBuildInfo';

/**
 * Floating __DEV__ chip so a phone pointed at Metro can show which git
 * checkout is actually serving the JS bundle. Tap to dismiss for the session.
 *
 * Branch/commit come from `app.config.js` — restart Metro after switching
 * branches; Fast Refresh alone will not refresh this label.
 */
export function DevBranchBadge() {
  const insets = useSafeAreaInsets();
  const [hidden, setHidden] = useState(false);
  const info = getDevBuildInfo();

  if (!__DEV__ || hidden || !info) return null;

  const label = `${info.branch} · ${info.commit}`;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { top: Math.max(insets.top, 8) + 2 }]}
    >
      <Pressable
        onPress={() => setHidden(true)}
        accessibilityRole="button"
        accessibilityLabel={`Dev build ${label}. Tap to hide.`}
        style={styles.chip}
      >
        <Text variant="caption" style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 12,
    right: 12,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  chip: {
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(20, 20, 20, 0.78)',
  },
  label: {
    color: '#F4F4F5',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
