import { Linking, Platform, Share } from 'react-native';

export async function copyText(value: string): Promise<'copied' | 'shared'> {
  try {
    const Clipboard = require('expo-clipboard') as {
      setStringAsync?: (text: string) => Promise<void>;
    };
    if (typeof Clipboard.setStringAsync === 'function') {
      await Clipboard.setStringAsync(value);
      return 'copied';
    }
  } catch {
    // Native clipboard module is optional until the next dev-client rebuild.
  }
  await Share.share({ message: value });
  return 'shared';
}

export function openAppleMapsDirections(
  lat: number,
  lng: number,
  label?: string
): void {
  const dest = `${lat},${lng}`;
  const q = label ? `&q=${encodeURIComponent(label)}` : '';
  const url =
    Platform.OS === 'ios'
      ? `maps://?daddr=${dest}&dirflg=d${q}`
      : `https://maps.apple.com/?daddr=${dest}&dirflg=d${q}`;
  void Linking.openURL(url);
}

export function openGoogleMapsDirections(lat: number, lng: number): void {
  const dest = `${lat},${lng}`;
  const web = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
  const native =
    Platform.OS === 'ios'
      ? `comgooglemaps://?daddr=${dest}&directionsmode=walking`
      : `google.navigation:q=${dest}`;
  void Linking.canOpenURL(native).then((supported) => {
    void Linking.openURL(supported ? native : web);
  });
}
