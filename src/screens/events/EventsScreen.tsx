import React from 'react';
import { FlatList, Linking, Pressable } from 'react-native';
import { Screen, Text, Card } from '@/components/design-system';
import { LoadingState, ErrorState, EmptyState } from '@/components/feature';
import { useFeaturedEvents } from '@/hooks/useFeaturedEvents';

export function EventsScreen() {
  const { data, isLoading, isError, refetch } = useFeaturedEvents();

  return (
    <Screen>
      <Text variant="body" color="secondary" style={{ marginBottom: 16 }}>
        Featured items from the Concordia mobile banner feed (AEM).
      </Text>
      {isLoading ? <LoadingState /> : null}
      {isError ? (
        <ErrorState message="Could not load featured events." onRetry={() => refetch()} />
      ) : null}
      {!isLoading && !isError && (!data || data.length === 0) ? (
        <EmptyState message="No featured items right now." />
      ) : null}
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => item.url && Linking.openURL(item.url)}
            disabled={!item.url}
          >
            <Card
              elevation="low"
              style={{
                marginBottom: 12,
                backgroundColor: item.backgroundColor ? `#${item.backgroundColor}` : undefined,
                borderColor: item.backgroundColor ? 'rgba(0,0,0,0.12)' : undefined,
              }}
            >
              <Text
                variant="heading3"
                style={{ color: item.textColor ? `#${item.textColor}` : undefined }}
              >
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text
                  variant="bodySmall"
                  style={{
                    marginTop: 4,
                    color: item.textColor ? `#${item.textColor}` : undefined,
                    opacity: 0.9,
                  }}
                >
                  {item.subtitle}
                </Text>
              ) : null}
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}
