import type { NavigationProp, ParamListBase } from '@react-navigation/native';

/**
 * Dismiss the Account modal from any nested Me screen.
 *
 * `goBack()` on the Me stack only pops Settings → Me home. Walking up until
 * the parent owns the `Account` route pops the modal itself.
 */
export function dismissAccountModal(navigation: NavigationProp<ParamListBase>) {
  let current: NavigationProp<ParamListBase> | undefined = navigation;
  while (current) {
    const parent = current.getParent();
    if (!parent) {
      break;
    }
    const names = parent.getState().routes.map((route) => route.name);
    if (names.includes('Account')) {
      parent.goBack();
      return;
    }
    current = parent;
  }
  if (navigation.canGoBack()) {
    navigation.goBack();
  }
}
