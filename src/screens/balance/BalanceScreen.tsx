import React from 'react';
import { FlatList } from 'react-native';
import { Screen, Text, Card, Button } from '@/components/design-system';
import { LoadingState, ErrorState, EmptyState } from '@/components/feature';
import { useAccountBalance } from '@/hooks/useAccountBalance';
import { sumAccountBalance } from '@/api/balance';

export function BalanceScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useAccountBalance();
  const rows = data?.tutAccountList ?? [];
  const total = sumAccountBalance(rows);

  return (
    <Screen>
      <Button
        variant="secondary"
        onPress={() => refetch()}
        disabled={isFetching}
        style={{ marginBottom: 16, alignSelf: 'flex-start' }}
      >
        {isFetching ? 'Refreshing…' : 'Refresh'}
      </Button>
      {isLoading ? <LoadingState /> : null}
      {isError ? (
        <ErrorState message="Could not load account balance." onRetry={() => refetch()} />
      ) : null}
      {!isLoading && !isError ? (
        <>
          <Card elevation="medium" style={{ marginBottom: 16 }}>
            <Text variant="bodySmall" color="secondary">
              Total balance
            </Text>
            <Text variant="heading2" color="brand">
              ${total.toFixed(2)}
            </Text>
          </Card>
          {rows.length === 0 ? <EmptyState message="No account entries." /> : null}
          <FlatList
            data={rows}
            keyExtractor={(item, i) => `${item.TERM_DESCR}-${i}`}
            renderItem={({ item }) => (
              <Card elevation="low" style={{ marginBottom: 12 }}>
                <Text variant="body" style={{ fontWeight: '600', }}>
                  {item.TERM_DESCR}
                </Text>
                <Text variant="bodySmall" color="secondary">
                  {item.EXPR1_1}
                </Text>
                <Text variant="body">${Number(item.AMOUNT).toFixed(2)}</Text>
              </Card>
            )}
          />
        </>
      ) : null}
    </Screen>
  );
}
