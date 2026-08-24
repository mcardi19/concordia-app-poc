import React, { useCallback, useEffect, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/design-system';
import { useMeTheme } from '@/screens/me/meTheme';

/** Drag past this and the sheet dismisses instead of springing back. */
const DISMISS_DISTANCE = 120;
/** Far enough below the fold that the sheet is gone at any device height. */
const OFFSCREEN = 700;
const SPRING = { damping: 22, stiffness: 220, mass: 0.9 };
/**
 * Vertical travel before the pan takes over. Without it any touch inside the
 * sheet begins a drag, so pressing a row or a field nudges the whole panel.
 */
const PAN_ACTIVATION = 12;

type Props = {
  /** Presented when true; the exit animation runs before `onClose` lands. */
  visible: boolean;
  title: string;
  /** Trailing header affordance — "Save", a count, an action. */
  trailing?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

/**
 * The Me tab's bottom sheet: grab handle, animated backdrop, pan-to-dismiss.
 *
 * One definition rather than one per sheet — the collection lists and the
 * edit-profile drawer are the same panel over the same tab, and a sheet that
 * settled differently depending on what opened it would read as a bug.
 */
export function MeBottomSheet({ visible, title, trailing, onClose, children }: Props) {
  const me = useMeTheme();
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

  const pan = Gesture.Pan()
    .activeOffsetY([-PAN_ACTIVATION, PAN_ACTIVATION])
    .onBegin(() => {
      /*
        Grabbing the sheet mid-animation otherwise leaves the opening spring
        still driving `translateY` while the finger writes to it too — the two
        fight for the same value and the panel stutters under the touch.
      */
      cancelAnimation(translateY);
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

  if (!visible) {
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
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Dismiss ${title}`}
            onPress={dismiss}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.sheet,
              sheetStyle,
              {
                backgroundColor: me.cardBackground,
                paddingBottom: insets.bottom + 26,
              },
            ]}
          >
            {/*
              Only the header drags. Wrapping the whole sheet would put the
              pan in competition with any scroll view inside it — the drawer
              would swallow the flick meant for the content, or the list would
              swallow the flick meant to dismiss.
            */}
            <GestureDetector gesture={pan}>
              <View>
                <View style={styles.handleRow}>
                  <View style={[styles.handle, { backgroundColor: me.sheetHandle }]} />
                </View>

                <View style={styles.titleRow}>
                  <Text
                    variant="heading3"
                    numberOfLines={1}
                    style={[styles.title, { color: me.headingText }]}
                  >
                    {title}
                  </Text>
                  {trailing}
                </View>
              </View>
            </GestureDetector>

            {children}
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  keyboard: {
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    paddingTop: 10,
    /** Leaves the page visible above a tall sheet, so it still reads as a sheet. */
    maxHeight: '88%',
  },
  handleRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 19,
    lineHeight: 22,
    fontWeight: '600',
  },
});
