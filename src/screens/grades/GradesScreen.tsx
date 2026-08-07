import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Screen, Text, Button, Card } from '@/components/design-system';
import { LoadingState, ErrorState, EmptyState } from '@/components/feature';
import { useGrades } from '@/hooks/useGrades';
import type { GradesEndpointType } from '@/types/sis';

const MODES: { type: GradesEndpointType; label: string }[] = [
  { type: 'StudCurrentGradeList', label: 'Current' },
  { type: 'StudGradeList', label: 'All' },
  { type: 'StudGPA', label: 'GPA' },
];

export function GradesScreen() {
  const [mode, setMode] = useState<GradesEndpointType>('StudCurrentGradeList');
  const { data, isLoading, isError, refetch } = useGrades(mode);

  const gradeList = data && 'gradeList' in data ? data.gradeList : undefined;
  const gpaList = data && 'gpaList' in data ? data.gpaList : undefined;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {MODES.map((m) => (
          <Button
            key={m.type}
            variant={mode === m.type ? 'primary' : 'secondary'}
            onPress={() => setMode(m.type)}
          >
            {m.label}
          </Button>
        ))}
      </View>
      {isLoading ? <LoadingState /> : null}
      {isError ? (
        <ErrorState message="Could not load grades." onRetry={() => refetch()} />
      ) : null}
      {!isLoading && !isError && mode !== 'StudGPA' && (!gradeList || gradeList.length === 0) ? (
        <EmptyState message="No grades to display." />
      ) : null}
      {gradeList ? (
        <FlatList
          data={gradeList}
          keyExtractor={(item, i) => `${item.DESCR}-${i}`}
          renderItem={({ item }) => (
            <Card elevation="low" style={{ marginBottom: 12 }}>
              <Text variant="body" style={{ fontWeight: '600', }}>
                {item.DESCR}
              </Text>
              <Text variant="bodySmall" color="secondary">
                {item.CLASS}
              </Text>
              <Text variant="heading3" color="brand" style={{ marginTop: 4 }}>
                {item.GRADE}
              </Text>
            </Card>
          )}
        />
      ) : null}
      {gpaList ? (
        <FlatList
          data={gpaList}
          keyExtractor={(item, i) => `${item.DIPLOMA_DESCR}-${i}`}
          renderItem={({ item }) => (
            <Card elevation="low" style={{ marginBottom: 12 }}>
              <Text variant="body" style={{ fontWeight: '600', }}>
                {item.DIPLOMA_DESCR}
              </Text>
              <Text variant="bodySmall" color="secondary">
                {item.ACAD_CAREER} · {item.PROG_STATUS}
              </Text>
              <Text variant="bodySmall" color="secondary">
                {item.GPA_TYPE_SHOWN}
              </Text>
              <Text variant="heading3" color="brand">
                {item.GPA}
              </Text>
            </Card>
          )}
        />
      ) : null}
    </Screen>
  );
}
