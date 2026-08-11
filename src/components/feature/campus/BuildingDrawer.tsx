import React, { useCallback, useEffect, useState } from 'react';
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
import { MaterialSymbol, msClose } from '@/components/icons';
import { getCardSurfaceStyle, radiusStyle, useTheme } from '@/design-system/theme';
import type { BuildingSummary } from '@/types/campus';
import { CAMPUS_MAP_DEFAULTS } from '@/types/campus';

type Props = {
  building: BuildingSummary | null;
  onClose: () => void;
};

const DISMISS_DISTANCE = 120;
const SPRING = { damping: 22, stiffness: 220, mass: 0.9 };

export function BuildingDrawer({ building, onClose }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(400);
  const backdrop = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  /**
   * Keep a local snapshot so we can call `onClose` immediately (map pin clears)
   * while the sheet still animates out.
   */
  const [displayed, setDisplayed] = useState<BuildingSummary | null>(building);

  const finishHide = useCallback(() => {
    setDisplayed(null);
  }, []);

  useEffect(() => {
    if (building) {
      setDisplayed(building);
      translateY.value = withSpring(0, SPRING);
      backdrop.value = withTiming(1, { duration: 220 });
      return;
    }
    if (displayed) {
      translateY.value = withTiming(420, { duration: 200 });
      backdrop.value = withTiming(0, { duration: 180 }, (finished) => {
        if (finished) {
          runOnJS(finishHide)();
        }
      });
    }
  }, [building, backdrop, displayed, finishHide, translateY]);

  const dismiss = useCallback(() => {
    // Clear parent selection immediately so the map pin deselects now.
    onClose();
  }, [onClose]);

  const pan = Gesture.Pan()
    .onBegin(() => {
      dragStartY.value = translateY.value;
    })
    .onUpdate((event) => {
      const next = Math.max(0, dragStartY.value + event.translationY);
      translateY.value = next;
    })
    .onEnd((event) => {
      const shouldDismiss =
        translateY.value > DISMISS_DISTANCE || event.velocityY > 900;
      if (shouldDismiss) {
        runOnJS(onClose)();
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

  if (!displayed) {
    return null;
  }

  const campusName = CAMPUS_MAP_DEFAULTS[displayed.campusId].name;
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
            accessibilityLabel="Dismiss building details"
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
                style={[
                  styles.handle,
                  { backgroundColor: theme.color.border },
                ]}
              />
            </View>

            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <Text variant="caption" color="brand" style={{ marginBottom: 2 }}>
                  {displayed.code}
                  {' · '}
                  {campusName}
                </Text>
                <Text variant="heading2" color="primary">
                  {displayed.name}
                </Text>
                {displayed.longName && displayed.longName !== displayed.name ? (
                  <Text
                    variant="bodySmall"
                    color="secondary"
                    style={{ marginTop: theme.spacing.xs }}
                  >
                    {displayed.longName}
                  </Text>
                ) : null}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close building details"
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

            {displayed.address ? (
              <Text
                variant="body"
                color="secondary"
                style={{ marginTop: theme.spacing.md }}
              >
                {displayed.address}
              </Text>
            ) : null}

            {displayed.amenities.length > 0 ? (
              <View
                style={[
                  styles.amenityRow,
                  { marginTop: theme.spacing.md, gap: theme.spacing.xs },
                ]}
              >
                {displayed.amenities.map((amenity) => (
                  <View
                    key={amenity}
                    style={[
                      styles.amenityChip,
                      {
                        backgroundColor: theme.color.backgroundSubtle,
                        borderRadius: theme.radius.full,
                        paddingHorizontal: theme.spacing.sm,
                        paddingVertical: theme.spacing.xs,
                      },
                    ]}
                  >
                    <Text variant="caption" color="secondary">
                      {amenity}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
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
    alignItems: 'flex-start',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityChip: {},
});
