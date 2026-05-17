import type { TutAccountResponse } from '@/types/sis';
import { assertSisAuth, parseSisJson } from '@/utils/parseSisResponse';
import { getSisToken } from './sisClient';
import { API_CONFIG } from '@/config/api';
import axios from 'axios';

export async function fetchAccountBalance(fresh = false): Promise<TutAccountResponse> {
  const token = await getSisToken();
  const suffix = fresh ? '/fresh' : '';
  const url = `${API_CONFIG.sisBaseUrl}/StudTutAccount/${token}${suffix}`;
  const { data: raw } = await axios.get<unknown>(url, { timeout: 15000 });
  return assertSisAuth(parseSisJson<TutAccountResponse>(raw));
}

export function sumAccountBalance(rows: TutAccountResponse['tutAccountList']): number {
  if (!rows?.length) return 0;
  return rows.reduce((sum, row) => sum + Number(row.AMOUNT ?? 0), 0);
}
