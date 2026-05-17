/**
 * Environment variables available at build time.
 * Set via EXPO_PUBLIC_* or app.config.js / EAS secrets.
 */
export type Env = {
  EXPO_PUBLIC_API_URL?: string;
  EXPO_PUBLIC_SIS_API_URL?: string;
  EXPO_PUBLIC_MAPS_PROXY_URL?: string;
  EXPO_PUBLIC_HUB_SSO_URL?: string;
  EXPO_PUBLIC_OIDC_ISSUER?: string;
  EXPO_PUBLIC_OIDC_CLIENT_ID?: string;
  EXPO_PUBLIC_OIDC_REDIRECT_URI?: string;
};

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends Env {}
  }
}
