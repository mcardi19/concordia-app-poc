import React, { useEffect, useMemo, useState } from 'react';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Pressable, StyleSheet, View } from 'react-native';
import { GlassContainer, GlassView } from 'expo-glass-effect';
import { Text } from '@/components/design-system';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import {
  MaterialSymbol,
  msAdd,
  msCheck,
  msExpandMore,
} from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { HEADER_BAR_BUTTON_SIZE } from '@/navigation/HeaderIconButton';
import { semanticSpacing } from '@/design-system/tokens';
import { scheduleTheme } from './scheduleTheme';
import type { ScheduleViewMode } from './scheduleTypes';

type Props = {
  selectedDate: Date;
  /**
   * Month the title shows. Follows the week you have paged to, which is not
   * necessarily the month of the selected day. Falls back to `selectedDate`.
   */
  monthDate?: Date;
  /** Day shown on the “jump to today” control next to the view picker. */
  todayDate?: Date;
  viewMode: ScheduleViewMode;
  onViewModeChange: (mode: ScheduleViewMode) => void;
  onTodayPress?: () => void;
  onAddPress?: () => void;
  /** Add is offered on agenda and day, not on the 3-day planner. */
  showAdd?: boolean;
};

const VIEW_LABELS: Record<ScheduleViewMode, string> = {
  agenda: 'Agenda',
  day: 'Day',
  week: '3-Day',
};

const VIEW_ORDER: ScheduleViewMode[] = ['agenda', 'day', 'week'];

/** Merge distance for the joined pill — wider than the 2pt gap between segments. */
const GLASS_MERGE_SPACING = 12;

/**
 * Liquid glass surface with a flat fallback. The glass is the outer element so
 * GlassContainer can see it and fuse adjacent segments into one pill.
 * `colorScheme="light"` because this header sits on the white page, not on
 * imagery — dark glass would read as a grey blob here.
 */
function GlassSurface({
  style,
  children,
}: {
  style: object;
  children: React.ReactNode;
}) {
  const glass = useMemo(() => canUseLiquidGlass(), []);
  if (!glass) {
    return <View style={[style, styles.fallbackSurface]}>{children}</View>;
  }
  return (
    <GlassView isInteractive glassEffectStyle="regular" colorScheme="light" style={style}>
      {children}
    </GlassView>
  );
}

/** Fuses its children into a single glass shape where supported. */
function GlassGroup({ children }: { children: React.ReactNode }) {
  const glass = useMemo(() => canUseLiquidGlass(), []);
  if (!glass) {
    return <View style={styles.joinedPill}>{children}</View>;
  }
  return (
    <GlassContainer spacing={GLASS_MERGE_SPACING} style={styles.joinedPill}>
      {children}
    </GlassContainer>
  );
}

/** Fade-and-rise on the way out, spring on the way in. */
const MONTH_OUT_MS = 110;
const MONTH_IN_SPRING = { damping: 18, stiffness: 220, mass: 0.7 } as const;
const MONTH_RISE = 7;

/**
 * Month label that swaps rather than cuts when you page the week strip.
 *
 * The text is held in state and only replaced at the midpoint of the
 * transition, so the outgoing month animates away before the incoming one
 * springs in — cross-fading two absolutely-positioned labels would be the
 * alternative, but it needs a fixed width and this title sits next to a
 * chevron in an auto-sized row.
 */
function MonthTitle({ month }: { month: string }) {
  const [shown, setShown] = useState(month);
  const progress = useSharedValue(1);

  useEffect(() => {
    if (month === shown) return;
    progress.value = withTiming(0, { duration: MONTH_OUT_MS }, (finished) => {
      if (!finished) return;
      runOnJS(setShown)(month);
      progress.value = withSpring(1, MONTH_IN_SPRING);
    });
  }, [month, shown, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * MONTH_RISE }],
  }));

  return (
    <Animated.View style={style}>
      <Text
        variant="heading2"
        style={{ fontSize: 26, lineHeight: 30, color: scheduleTheme.headingText }}
      >
        {shown}
      </Text>
    </Animated.View>
  );
}

/**
 * Shared masthead for all three schedule views: month title, a joined
 * view-switcher / today control.
 */
export function ScheduleHeader({
  selectedDate,
  monthDate,
  todayDate,
  viewMode,
  onViewModeChange,
  onTodayPress,
  onAddPress,
  showAdd = true,
}: Props) {
  const theme = useTheme();
  const glass = useMemo(() => canUseLiquidGlass(), []);
  const [menuOpen, setMenuOpen] = useState(false);

  const month = (monthDate ?? selectedDate).toLocaleDateString('en-CA', { month: 'long' });
  const todayDay = (todayDate ?? new Date()).getDate();
  const todayLabel = (todayDate ?? new Date()).toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const menuRows = VIEW_ORDER.map((mode) => {
    const active = mode === viewMode;
    return (
      <Pressable
        key={mode}
        onPress={() => {
          onViewModeChange(mode);
          setMenuOpen(false);
        }}
        accessibilityRole="menuitem"
        accessibilityState={{ selected: active }}
        style={({ pressed }) => [
          styles.menuRow,
          active ? { backgroundColor: `${theme.color.primary}14` } : null,
          pressed ? { opacity: 0.7 } : null,
        ]}
      >
        <Text
          variant="bodySmall"
          style={{
            fontSize: 17,
            lineHeight: 22,
            fontWeight: active ? '600' : '500',
            color: active ? theme.color.primary : scheduleTheme.headingText,
          }}
        >
          {VIEW_LABELS[mode]}
        </Text>
        {active ? (
          <MaterialSymbol icon={msCheck} size={20} color={theme.color.primary} />
        ) : (
          <View style={styles.menuCheckSpacer} />
        )}
      </Pressable>
    );
  });

  return (
    <View style={styles.root}>
      <View style={styles.titleRow}>
        <Pressable
          style={styles.title}
          accessibilityRole="button"
          accessibilityLabel={`${month}, change month`}
        >
          <MonthTitle month={month} />
          <MaterialSymbol icon={msExpandMore} size={18} color={scheduleTheme.headingText} />
        </Pressable>

        <View style={styles.controls}>
          {/* Joined pill: view switcher | today — fused by GlassContainer. */}
          <GlassGroup>
            <GlassSurface style={styles.pillSegment}>
              <Pressable
                onPress={() => setMenuOpen((open) => !open)}
                accessibilityRole="button"
                accessibilityLabel={`View: ${VIEW_LABELS[viewMode]}`}
                accessibilityState={{ expanded: menuOpen }}
                style={styles.segmentFill}
              >
                <Text
                  variant="bodySmall"
                  style={{ fontSize: 15, fontWeight: '600', color: theme.color.primary }}
                >
                  {VIEW_LABELS[viewMode]}
                </Text>
                <MaterialSymbol icon={msExpandMore} size={14} color={theme.color.primary} />
              </Pressable>
            </GlassSurface>

            <GlassSurface style={styles.pillIconSegment}>
              <Pressable
                onPress={onTodayPress}
                accessibilityRole="button"
                accessibilityLabel={`Go to today, ${todayLabel}`}
                style={styles.iconFill}
              >
                <Text
                  variant="bodySmall"
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: theme.color.primary,
                  }}
                >
                  {todayDay}
                </Text>
              </Pressable>
            </GlassSurface>

            {/* Was a FAB over the bottom-right of the list. */}
            {showAdd ? (
              <GlassSurface style={styles.pillIconSegment}>
                <Pressable
                  onPress={onAddPress}
                  accessibilityRole="button"
                  accessibilityLabel="Add event"
                  style={styles.iconFill}
                >
                  <MaterialSymbol icon={msAdd} size={20} color={theme.color.primary} />
                </Pressable>
              </GlassSurface>
            ) : null}
          </GlassGroup>

          {menuOpen ? (
            glass ? (
              <GlassView
                isInteractive
                glassEffectStyle="regular"
                colorScheme="light"
                style={styles.menu}
              >
                {menuRows}
              </GlassView>
            ) : (
              <View style={[styles.menu, styles.menuFallback]}>{menuRows}</View>
            )
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: scheduleTheme.pageBackground,
    zIndex: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: semanticSpacing.screenHorizontal,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 20,
  },
  joinedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    // Narrower than GLASS_MERGE_SPACING so the two segments fuse.
    gap: 2,
  },
  pillSegment: {
    height: HEADER_BAR_BUTTON_SIZE,
    borderRadius: HEADER_BAR_BUTTON_SIZE / 2,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  pillIconSegment: {
    width: HEADER_BAR_BUTTON_SIZE,
    height: HEADER_BAR_BUTTON_SIZE,
    borderRadius: HEADER_BAR_BUTTON_SIZE / 2,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  segmentFill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 14,
  },
  iconFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Only applied when liquid glass is unavailable. */
  fallbackSurface: {
    backgroundColor: scheduleTheme.cardBackground,
    shadowColor: '#140C10',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 2,
  },
  menu: {
    position: 'absolute',
    top: HEADER_BAR_BUTTON_SIZE + 8,
    right: 0,
    minWidth: 184,
    borderRadius: 16,
    borderCurve: 'continuous',
    overflow: 'hidden',
    padding: 6,
    zIndex: 30,
  },
  menuFallback: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#140C10',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 30,
    elevation: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderCurve: 'continuous',
    gap: 16,
  },
  menuCheckSpacer: {
    width: 20,
    height: 20,
  },
});
