import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GlobalSearchScreen } from '@/screens/search/GlobalSearchScreen';
import { useStackScreenOptions } from './screenOptions';
import type { SearchStackParamList } from './types';

const Stack = createNativeStackNavigator<SearchStackParamList>();

export function SearchStack() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Screen name="Search" component={GlobalSearchScreen} />
    </Stack.Navigator>
  );
}
