import React from 'react';
import type { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GlobalSearchScreen } from '@/screens/search/GlobalSearchScreen';
import { SearchCategoryScreen } from '@/screens/search/SearchCategoryScreen';
import type { SearchRoutes } from './types';

/**
 * Search is not a tab: a header action button pushes it into the stack the
 * user is already in, so Home, Academic and Me each register the same two
 * screens. Declaring them once here is what keeps the copies identical — an
 * option changed in one stack would otherwise silently differ from the others.
 *
 * Both render `headerShown: false`; each screen draws its own back control
 * beside the search field rather than losing that row to a native header bar.
 *
 * Returns a fragment of `Stack.Screen` elements rather than a component:
 * React Navigation reads its screen config off the navigator's direct
 * children, so these have to be spread in place, not nested in a wrapper.
 */
export function searchScreens<P extends SearchRoutes>(
  Stack: ReturnType<typeof createNativeStackNavigator<P>>,
) {
  /*
    Narrowed back to SearchRoutes — same reasoning as `meScreens` had: with P
    unresolved TypeScript cannot match the components against
    `ScreenComponentType<P, 'Search'>` and falls back to `{}` props. P only
    ever widens SearchRoutes with the host stack's own routes, which neither
    screen references, so pinning the param list is sound.
  */
  const Screen = Stack.Screen as unknown as ReturnType<
    typeof createNativeStackNavigator<SearchRoutes>
  >['Screen'];

  return (
    <>
      <Screen name="Search" component={GlobalSearchScreen} options={{ headerShown: false }} />
      <Screen
        name="SearchCategory"
        component={SearchCategoryScreen}
        options={{ headerShown: false }}
      />
    </>
  );
}
