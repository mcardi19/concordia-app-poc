import React from 'react';
import type { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MeHomeScreen } from '@/screens/me/MeHomeScreen';
import { SettingsScreen } from '@/screens/me/SettingsScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { GradesScreen } from '@/screens/grades/GradesScreen';
import { BalanceScreen } from '@/screens/balance/BalanceScreen';
import type { MeRoutes } from './types';

/**
 * Me stopped being a tab: the header profile button pushes it into the stack
 * the user is already in, so Home, Schedule and Campus each register the same
 * five screens. Declaring them once here is what keeps the copies identical —
 * a title or header option changed in one stack would otherwise silently
 * differ from the others.
 *
 * Returns a fragment of `Stack.Screen` elements rather than a component:
 * React Navigation reads its screen config off the navigator's direct
 * children, so these have to be spread in place, not nested in a wrapper.
 */
export function meScreens<P extends MeRoutes>(
  Stack: ReturnType<typeof createNativeStackNavigator<P>>,
) {
  /*
    Narrowed back to MeRoutes. With P still unresolved TypeScript cannot match
    the screen components against `ScreenComponentType<P, 'MeHome'>` and falls
    back to `{}` props, so every component here fails to assign. P only ever
    widens MeRoutes with the host stack's own routes — which these five screens
    never reference — so pinning the param list is sound.
  */
  const Screen = Stack.Screen as unknown as ReturnType<
    typeof createNativeStackNavigator<MeRoutes>
  >['Screen'];

  return (
    <>
      <Screen name="MeHome" component={MeHomeScreen} options={{ headerShown: false }} />
      <Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Screen name="Grades" component={GradesScreen} options={{ title: 'Course grades' }} />
      <Screen name="Balance" component={BalanceScreen} options={{ title: 'Account balance' }} />
    </>
  );
}
