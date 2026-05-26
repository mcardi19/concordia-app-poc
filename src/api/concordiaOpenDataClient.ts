/**
 * HTTP client for opendata.concordia.ca (Basic auth).
 * Credentials: root `.env` → CONCORDIA_OPENDATA_USER / CONCORDIA_OPENDATA_API_KEY
 * @see docs/CONCORDIA_OPEN_DATA.md
 */

import axios, { type AxiosInstance } from 'axios';
import {
  CONCORDIA_OPEN_DATA_BASE_URL,
  getConcordiaOpenDataCredentials,
} from '@/config/concordiaOpenData';

/** Example typed response from GET library/hours/{date} */
export type LibraryHourRow = {
  service: string;
  text: string;
};

let concordiaOpenDataClient: AxiosInstance | null = null;

/**
 * Throws if Concordia Open Data env vars are missing.
 * Prefer `isConcordiaOpenDataConfigured()` in UI before calling.
 */
export function getConcordiaOpenDataClient(): AxiosInstance {
  if (concordiaOpenDataClient) return concordiaOpenDataClient;

  const creds = getConcordiaOpenDataCredentials();
  if (!creds) {
    throw new Error(
      'Concordia Open Data is not configured. Add CONCORDIA_OPENDATA_USER and CONCORDIA_OPENDATA_API_KEY to the project root .env file, restart Expo, then try again. See docs/CONCORDIA_OPEN_DATA.md.',
    );
  }

  concordiaOpenDataClient = axios.create({
    baseURL: CONCORDIA_OPEN_DATA_BASE_URL,
    timeout: 20000,
    auth: {
      username: creds.user,
      password: creds.apiKey,
    },
    headers: { Accept: 'application/json' },
  });

  return concordiaOpenDataClient;
}

/**
 * Sanity check helper: library hours for a single day (`YYYY-MM-DD`).
 */
export async function fetchLibraryHours(dateIso: string): Promise<LibraryHourRow[]> {
  const client = getConcordiaOpenDataClient();
  const { data } = await client.get<LibraryHourRow[]>(`library/hours/${dateIso}`);
  return Array.isArray(data) ? data : [];
}
