/**
 * Concordia University Open Data API (https://github.com/opendataConcordiaU/documentation).
 * Credentials come from root `.env` via `app.config.js` → `expo.extra` (see docs/CONCORDIA_OPEN_DATA.md).
 */

import Constants from 'expo-constants';

export const CONCORDIA_OPEN_DATA_BASE_URL =
  'https://opendata.concordia.ca/API/v1' as const;

type ConcordiaOpenDataExtra = {
  concordiaOpenDataUser?: string;
  concordiaOpenDataApiKey?: string;
};

export function isConcordiaOpenDataConfigured(): boolean {
  return getConcordiaOpenDataCredentials() !== null;
}

export function getConcordiaOpenDataCredentials(): {
  user: string;
  apiKey: string;
} | null {
  const extra = Constants.expoConfig?.extra as ConcordiaOpenDataExtra | undefined;
  const user = extra?.concordiaOpenDataUser?.trim();
  const apiKey = extra?.concordiaOpenDataApiKey?.trim();
  if (!user || !apiKey) return null;
  return { user, apiKey };
}
