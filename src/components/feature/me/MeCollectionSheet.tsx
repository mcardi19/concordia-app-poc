import React, { useCallback, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/design-system';
import { MaterialSymbol, msBookmark, msBookmarkFill } from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { meTheme } from '@/screens/me/meTheme';

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

const DISMISS_DISTANCE = 120;
const OFFSCREEN = 460;
const SPRING = { damping: 22, stiffness: 220, mass: 0.9 };

/**
 * Bottom sheet listing a full collection. Mirrors the interaction model of
 * BuildingDrawer (pan-to-dismiss, animated backdrop) so both sheets in the app
 * behave identically.
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
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(OFFSCREEN);
  const backdrop = useSharedValue(0);
  const dragStartY = useSharedValue(0);

  useEffect(() => {
    if (title) {
      translateY.value = withSpring(0, SPRING);
      backdrop.value = withTiming(1, { duration: 220 });
    } else {
      translateY.value = withTiming(OFFSCREEN, { duration: 200 });
      backdrop.value = withTiming(0, { duration: 180 });
    }
  }, [title, backdrop, translateY]);

  const dismiss = useCallback(() => {
    translateY.value = withTiming(OFFSCREEN, { duration: 200 });
    backdrop.value = withTiming(0, { duration: 180 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  }, [backdrop, onClose, translateY]);

  const pan = Gesture.Pan()
    .onBegin(() => {
      dragStartY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, dragStartY.value + event.translationY);
    })
    .onEnd((event) => {
      if (translateY.value > DISMISS_DISTANCE || event.velocityY > 900) {
        translateY.value = withTiming(OFFSCREEN, { duration: 200 });
        backdrop.value = withTiming(0, { duration: 180 }, (finished) => {
          if (finished) {
            runOnJS(onClose)();
          }
        });
      } else {
        translateY.value = withSpring(0, SPRING);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value * 0.35,
  }));

  if (!title) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={dismiss}
    >
      <GestureHandlerRootView style={styles.modalRoot}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Dismiss ${title}`}
            onPress={dismiss}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.sheet,
              sheetStyle,
              { paddingBottom: insets.bottom + 26 },
            ]}
          >
            <View style={styles.handleRow}>
              <View style={styles.handle} />
            </View>

            <Text
              variant="heading3"
              style={{
                fontSize: 18,
                lineHeight: 22,
                fontWeight: '600',
                color: meTheme.headingText,
                marginBottom: 14,
              }}
            >
              {title}
            </Text>

            <View style={styles.rows}>
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
                          fontSize: 12,
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
                          fontSize: 13.5,
                          fontWeight: '600',
                          color: meTheme.headingText,
                        }}
                      >
                        {row.name}
                      </Text>
                      <Text
                        variant="caption"
                        numberOfLines={1}
                        style={{ fontSize: 11.5, color: meTheme.metaText, marginTop: 2 }}
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
            </View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  sheet: {
    backgroundColor: meTheme.cardBackground,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderCurve: 'continuous',
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  handleRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: meTheme.sheetHandle,
  },
  rows: {
    gap: 8,
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
