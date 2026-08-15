import React, { useMemo } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  TextInput,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { Text } from '@/components/design-system';
import { MaterialSymbol, msSearch } from '@/components/icons';
import { radiusStyle, useTheme } from '@/design-system/theme';
import { searchFieldHeight } from '@/design-system/tokens';
import { MIN_TOUCH_TARGET_SIZE } from '@/accessibility';
import { filterBuildings } from '@/api/buildings';
import type { BuildingSummary, CampusCode } from '@/types/campus';

type Props = {
  query: string;
  onChangeQuery: (value: string) => void;
  buildings: BuildingSummary[];
  campusId?: CampusCode;
  onSelectBuilding: (building: BuildingSummary) => void;
  style?: StyleProp<ViewStyle>;
};

const SEARCH_FIELD_HEIGHT = Math.max(MIN_TOUCH_TARGET_SIZE, searchFieldHeight);
/** Clear the capsule’s rounded ends (optical inset past the curve). */
const SEARCH_FIELD_HORIZONTAL_INSET = 22;

function canUseLiquidGlass(): boolean {
  try {
    return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}

/** Absolute-fill glass / blur chrome only — layout stays on sibling content. */
function GlassChrome({ style }: { style?: StyleProp<ViewStyle> }) {
  const useGlass = useMemo(() => canUseLiquidGlass(), []);

  if (useGlass) {
    return (
      <GlassView
        pointerEvents="none"
        isInteractive={false}
        glassEffectStyle="regular"
        colorScheme="light"
        style={[StyleSheet.absoluteFillObject, style]}
      />
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        pointerEvents="none"
        intensity={64}
        tint="systemChromeMaterialLight"
        style={[StyleSheet.absoluteFillObject, style]}
      />
    );
  }

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: 'rgba(255,255,255,0.82)' },
        style,
      ]}
    />
  );
}

export function CampusSearchBar({
  query,
  onChangeQuery,
  buildings,
  campusId = 'sgw',
  onSelectBuilding,
  style,
}: Props) {
  const theme = useTheme();
  const results = useMemo(
    () => filterBuildings(buildings, query, campusId),
    [buildings, query, campusId]
  );
  const showResults = query.trim().length > 0;
  const fieldRadius = theme.radius.full;
  const resultsRadius = theme.radius.xl;

  return (
    <View style={style}>
      <View
        style={[
          styles.fieldShell,
          radiusStyle(fieldRadius),
          { height: SEARCH_FIELD_HEIGHT },
        ]}
      >
        <GlassChrome />
        <View
          style={[
            styles.fieldForeground,
            {
              height: SEARCH_FIELD_HEIGHT,
              paddingHorizontal: SEARCH_FIELD_HORIZONTAL_INSET,
              gap: theme.spacing.sm,
            },
          ]}
          pointerEvents="box-none"
        >
          <MaterialSymbol
            icon={msSearch}
            size={22}
            color={theme.color.primary}
          />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder="Search buildings"
            placeholderTextColor={theme.color.text.subtle}
            accessibilityLabel="Search campus buildings"
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            underlineColorAndroid="transparent"
            style={[
              styles.fieldInput,
              {
                height: SEARCH_FIELD_HEIGHT,
                fontSize: theme.typography.body.fontSize,
                fontWeight: theme.typography.body.fontWeight,
                color: theme.color.text.primary,
                // iOS: omit lineHeight — large lineHeight drops glyphs toward the bottom.
                ...(Platform.OS === 'android'
                  ? {
                      textAlignVertical: 'center' as const,
                      includeFontPadding: false,
                    }
                  : null),
              },
            ]}
          />
        </View>
      </View>
      {showResults ? (
        <View
          style={[
            styles.resultsShell,
            radiusStyle(resultsRadius),
            { marginTop: theme.spacing.sm, maxHeight: 280 },
          ]}
        >
          <GlassChrome />
          <View style={styles.resultsForeground}>
            {results.length === 0 ? (
              <Text
                variant="bodySmall"
                color="secondary"
                style={{ padding: theme.spacing.md }}
              >
                No buildings match that search.
              </Text>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                {results.map((building, index) => (
                  <Pressable
                    key={building.id}
                    onPress={() => onSelectBuilding(building)}
                    accessibilityRole="button"
                    accessibilityLabel={`${building.code}, ${building.name}`}
                    style={({ pressed }) => ({
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      backgroundColor: pressed
                        ? 'rgba(0,0,0,0.06)'
                        : 'transparent',
                      borderBottomWidth:
                        index < results.length - 1
                          ? StyleSheet.hairlineWidth
                          : 0,
                      borderBottomColor: 'rgba(0,0,0,0.12)',
                    })}
                  >
                    <Text variant="body" color="primary">
                      {building.code}
                      {' · '}
                      {building.name}
                    </Text>
                    {building.address ? (
                      <Text variant="caption" color="secondary">
                        {building.address}
                      </Text>
                    ) : null}
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldShell: {
    overflow: 'hidden',
    position: 'relative',
  },
  fieldForeground: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  fieldInput: {
    flex: 1,
    margin: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  resultsShell: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  resultsForeground: {
    zIndex: 1,
  },
});
