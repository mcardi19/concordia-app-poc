import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GlassContainer, GlassView } from 'expo-glass-effect';
import { Text } from '@/components/design-system';
import { canUseLiquidGlass } from '@/components/design-system/liquidGlass';
import {
  MaterialSymbol,
  msCalendarMonth,
  msCheck,
  msExpandMore,
  msSearch,
} from '@/components/icons';
import { useTheme } from '@/design-system/theme';
import { scheduleTheme } from './scheduleTheme';
import type { ScheduleViewMode } from './scheduleTypes';

type Props = {
  selectedDate: Date;
  viewMode: ScheduleViewMode;
  onViewModeChange: (mode: ScheduleViewMode) => void;
  onSearchPress?: () => void;
  onCalendarPress?: () => void;
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

/**
 * Shared masthead for all three schedule views: month title, a joined
 * view-switcher / calendar control, and search.
 */
export function ScheduleHeader({
  selectedDate,
  viewMode,
  onViewModeChange,
  onSearchPress,
  onCalendarPress,
}: Props) {
  const theme = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const month = selectedDate.toLocaleDateString('en-CA', { month: 'long' });

  return (
    <View style={styles.root}>
      <View style={styles.titleRow}>
        <Pressable
          style={styles.title}
          accessibilityRole="button"
          accessibilityLabel={`${month}, change month`}
        >
          <Text
            variant="heading2"
            style={{ fontSize: 26, lineHeight: 30, color: scheduleTheme.headingText }}
          >
            {month}
          </Text>
          <MaterialSymbol icon={msExpandMore} size={18} color={scheduleTheme.headingText} />
        </Pressable>

        <View style={styles.controls}>
          {/* Joined pill: view switcher | calendar — fused by GlassContainer. */}
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
                  style={{ fontSize: 13, fontWeight: '600', color: theme.color.primary }}
                >
                  {VIEW_LABELS[viewMode]}
                </Text>
                <MaterialSymbol icon={msExpandMore} size={14} color={theme.color.primary} />
              </Pressable>
            </GlassSurface>

            <GlassSurface style={styles.pillIconSegment}>
              <Pressable
                onPress={onCalendarPress}
                accessibilityRole="button"
                accessibilityLabel="Pick a date"
                style={styles.segmentFill}
              >
                <MaterialSymbol icon={msCalendarMonth} size={19} color={theme.color.primary} />
              </Pressable>
            </GlassSurface>
          </GlassGroup>

          <GlassSurface style={styles.roundButton}>
            <Pressable
              onPress={onSearchPress}
              accessibilityRole="button"
              accessibilityLabel="Search schedule"
              style={styles.segmentFill}
            >
              <MaterialSymbol icon={msSearch} size={18} color={theme.color.primary} />
            </Pressable>
          </GlassSurface>

          {menuOpen ? (
            <View style={styles.menu}>
              {VIEW_ORDER.map((mode) => {
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
                    style={[
                      styles.menuRow,
                      active ? { backgroundColor: `${theme.color.primary}0F` } : null,
                    ]}
                  >
                    <Text
                      variant="bodySmall"
                      style={{
                        fontSize: 13.5,
                        fontWeight: active ? '700' : '500',
                        color: active ? theme.color.primary : '#2A2226',
                      }}
                    >
                      {VIEW_LABELS[mode]}
                    </Text>
                    {active ? (
                      <MaterialSymbol icon={msCheck} size={15} color={theme.color.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
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
    paddingHorizontal: 22,
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
  },
  joinedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    // Narrower than GLASS_MERGE_SPACING so the two segments fuse.
    gap: 2,
  },
  pillSegment: {
    height: 34,
    borderRadius: 17,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  pillIconSegment: {
    width: 40,
    height: 34,
    borderRadius: 17,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  roundButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  segmentFill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 12,
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
    top: 40,
    right: 0,
    minWidth: 128,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 5,
    zIndex: 20,
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
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
});
