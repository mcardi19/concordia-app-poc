import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LibraryScreen } from '@/screens/library/LibraryScreen';
import { useStackScreenOptions } from './screenOptions';
import type { LibraryStackParamList } from './types';

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export function LibraryStack() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Screen name="Library" component={LibraryScreen} />
    </Stack.Navigator>
  );
}
