import React, { useMemo } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Input, Text } from '@/components/design-system';
import { getCardSurfaceStyle, useTheme } from '@/design-system/theme';
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

  return (
    <View style={style}>
      <View
        style={[
          getCardSurfaceStyle(theme, 'medium', {
            borderRadius: theme.radius.lg,
            overflow: 'hidden',
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
          }),
        ]}
      >
        <Input
          value={query}
          onChangeText={onChangeQuery}
          placeholder="Search buildings"
          accessibilityLabel="Search campus buildings"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          containerStyle={{ marginBottom: 0 }}
          style={{
            borderWidth: 0,
            backgroundColor: 'transparent',
            paddingHorizontal: theme.spacing.xs,
          }}
        />
      </View>
      {showResults ? (
        <View
          style={[
            styles.results,
            getCardSurfaceStyle(theme, 'medium', {
              marginTop: theme.spacing.sm,
              borderRadius: theme.radius.lg,
              maxHeight: 280,
              overflow: 'hidden',
            }),
          ]}
        >
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
              {results.map((building) => (
                <Pressable
                  key={building.id}
                  onPress={() => onSelectBuilding(building)}
                  accessibilityRole="button"
                  accessibilityLabel={`${building.code}, ${building.name}`}
                  style={({ pressed }) => ({
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                    backgroundColor: pressed
                      ? theme.color.backgroundSubtle
                      : 'transparent',
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.color.border,
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
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  results: {
    width: '100%',
  },
});
