import React, { useCallback, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { MaterialSymbol, msClose } from '@/components/icons';
import { getCardSurfaceStyle, radiusStyle, useTheme } from '@/design-system/theme';
import type { PinnedChip } from './todayData';

type Props = {
  /** Drawer is presented when true. */
  visible: boolean;
  options: PinnedChip[];
  onSelect: (chip: PinnedChip) => void;
  onClose: () => void;
};

const DISMISS_DISTANCE = 120;
const OFFSCREEN = 520;
const SPRING = { damping: 22, stiffness: 220, mass: 0.9 };

/**
 * Bottom drawer for choosing a shortcut to pin. Matches BuildingDrawer /
 * MeCollectionSheet interaction (spring sheet, backdrop, pan-to-dismiss).
 */
export function TodayPinnedAddDrawer({ visible, options, onSelect, onClose }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(OFFSCREEN);
  const backdrop = useSharedValue(0);
  const dragStartY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, SPRING);
      backdrop.value = withTiming(1, { duration: 220 });
    } else {
      translateY.value = withTiming(OFFSCREEN, { duration: 200 });
      backdrop.value = withTiming(0, { duration: 180 });
    }
  }, [visible, backdrop, translateY]);

  const dismiss = useCallback(() => {
    translateY.value = withTiming(OFFSCREEN, { duration: 200 });
    backdrop.value = withTiming(0, { duration: 180 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  }, [backdrop, onClose, translateY]);

  const selectAndDismiss = useCallback(
    (chip: PinnedChip) => {
      translateY.value = withTiming(OFFSCREEN, { duration: 200 });
      backdrop.value = withTiming(0, { duration: 180 }, (finished) => {
        if (finished) {
          runOnJS(onSelect)(chip);
          runOnJS(onClose)();
        }
      });
    },
    [backdrop, onClose, onSelect, translateY],
  );

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
    opacity: backdrop.value * 0.28,
  }));

  if (!visible) {
    return null;
  }

  const bottomPad = insets.bottom + theme.spacing.md;

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
        <Animated.View
          pointerEvents="auto"
          style={[styles.backdrop, backdropStyle, { backgroundColor: '#000' }]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss add pin drawer"
            onPress={dismiss}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.sheet,
              sheetStyle,
              getCardSurfaceStyle(theme, 'high', {
                ...radiusStyle(theme.radius.xl),
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                paddingBottom: bottomPad,
                paddingHorizontal: theme.spacing.lg,
                paddingTop: theme.spacing.sm,
              }),
            ]}
          >
            <View style={styles.handleRow}>
              <View
                style={[styles.handle, { backgroundColor: theme.color.border }]}
              />
            </View>

            <View style={styles.headerRow}>
              <Text variant="heading3" style={{ flex: 1, fontSize: 20, lineHeight: 24 }}>
                Add to Pinned
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close add pin drawer"
                hitSlop={8}
                onPress={dismiss}
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: theme.color.backgroundSubtle,
                    borderRadius: theme.radius.full,
                  },
                ]}
              >
                <MaterialSymbol
                  icon={msClose}
                  size={20}
                  color={theme.color.text.secondary}
                />
              </Pressable>
            </View>

            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              style={styles.list}
              contentContainerStyle={{ gap: theme.spacing.sm, paddingTop: theme.spacing.md }}
            >
              {options.length === 0 ? (
                <Text variant="body" color="secondary">
                  All available shortcuts are already pinned.
                </Text>
              ) : (
                options.map((option) => (
                  <Pressable
                    key={option.id}
                    onPress={() => selectAndDismiss(option)}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${option.label}`}
                    style={({ pressed }) => [
                      styles.row,
                      {
                        backgroundColor: theme.color.backgroundSubtle,
                        borderRadius: theme.radius.lg,
                        borderCurve: 'continuous',
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.rowIcon,
                        {
                          backgroundColor: theme.color.background,
                          borderRadius: theme.radius.full,
                        },
                      ]}
                    >
                      <MaterialSymbol
                        icon={option.icon}
                        size={20}
                        color={option.iconColor}
                      />
                    </View>
                    <Text
                      variant="body"
                      style={{
                        flex: 1,
                        fontWeight: '500',
                        fontSize: 17,
                        lineHeight: 17 * 1.2,
                      }}
                    >
                      {option.label}
                    </Text>
                    <Text variant="body" color="brand" style={{ fontWeight: '600' }}>
                      Add
                    </Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '70%',
  },
  handleRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
