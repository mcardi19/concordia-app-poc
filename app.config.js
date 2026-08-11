/**
 * Expo app config. EXPO_PUBLIC_* and root `.env` (CONCORDIA_OPENDATA_*) feed `extra`; see docs/CONCORDIA_OPEN_DATA.md.
 * For production, use EAS environment secrets; never commit secrets to the repo.
 * @see docs/CONCORDIA_APP_ARCHITECTURE.md
 */
export default {
  expo: {
    name: 'Concordia',
    slug: 'concordia-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'ca.concordia.app',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Concordia uses your location to show where you are on the campus map.',
      },
    },
    android: {
      package: 'ca.concordia.app',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
      config: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        ? {
            googleMaps: {
              apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            },
          }
        : undefined,
    },
    web: { favicon: './assets/favicon.png' },
    plugins: [
      'expo-dev-client',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Concordia uses your location to show where you are on the campus map.',
        },
      ],
    ],
    extra: {
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      EXPO_PUBLIC_SIS_API_URL: process.env.EXPO_PUBLIC_SIS_API_URL,
      EXPO_PUBLIC_MAPS_PROXY_URL: process.env.EXPO_PUBLIC_MAPS_PROXY_URL,
      EXPO_PUBLIC_HUB_SSO_URL: process.env.EXPO_PUBLIC_HUB_SSO_URL,
      EXPO_PUBLIC_OIDC_ISSUER: process.env.EXPO_PUBLIC_OIDC_ISSUER,
      EXPO_PUBLIC_OIDC_CLIENT_ID: process.env.EXPO_PUBLIC_OIDC_CLIENT_ID,
      EXPO_PUBLIC_OIDC_REDIRECT_URI: process.env.EXPO_PUBLIC_OIDC_REDIRECT_URI,
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      /** Concordia Open Data (@see docs/CONCORDIA_OPEN_DATA.md) — from root .env, not EXPO_PUBLIC_ */
      concordiaOpenDataUser: process.env.CONCORDIA_OPENDATA_USER,
      concordiaOpenDataApiKey: process.env.CONCORDIA_OPENDATA_API_KEY,
    },
  },
};
