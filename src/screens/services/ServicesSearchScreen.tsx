import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Screen, Text, Button, Input, Card } from '@/components/design-system';
import { LoadingState, ErrorState, EmptyState } from '@/components/feature';
import { fonts } from '@/design-system/fonts';
import { useServicesSearch } from '@/hooks/useServicesSearch';
import type { CampusCode } from '@/types/campus';

export function ServicesSearchScreen() {
  const [campus, setCampus] = useState<CampusCode>('sgw');
  const [query, setQuery] = useState('');
  const { results, isLoading, isError, refetch, totalCount } = useServicesSearch(campus, query);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <Button
          variant={campus === 'sgw' ? 'primary' : 'secondary'}
          onPress={() => setCampus('sgw')}
        >
          SGW
        </Button>
        <Button
          variant={campus === 'loy' ? 'primary' : 'secondary'}
          onPress={() => setCampus('loy')}
        >
          Loyola
        </Button>
      </View>
      <Input
        label="Search services and departments"
        placeholder="e.g. gym, registrar, IT"
        value={query}
        onChangeText={setQuery}
        accessibilityLabel="Search campus services"
      />
      <Text variant="caption" color="secondary" style={{ marginBottom: 12 }}>
        {totalCount} locations indexed on {campus.toUpperCase()}
      </Text>
      {isLoading ? <LoadingState message="Loading campus directory…" /> : null}
      {isError ? (
        <ErrorState message="Could not load campus services." onRetry={() => refetch()} />
      ) : null}
      {!isLoading && !isError && results.length === 0 ? (
        <EmptyState message="No matches. Try a different search term." />
      ) : null}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card elevation="low" style={{ marginBottom: 8 }}>
            <Text variant="body" style={{ fontFamily: fonts.interSemiBold }}>
              {item.label}
            </Text>
            <Text variant="bodySmall" color="secondary">
              {item.buildingName} · {item.kind}
            </Text>
          </Card>
        )}
      />
    </Screen>
  );
}
