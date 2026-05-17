import type { GpaListResponse, GradeListResponse, GradesEndpointType } from '@/types/sis';
import { assertSisAuth, parseSisJson } from '@/utils/parseSisResponse';
import { getSisToken } from './sisClient';
import { API_CONFIG } from '@/config/api';
import axios from 'axios';

export async function fetchGrades(
  type: GradesEndpointType,
  fresh = false
): Promise<GradeListResponse | GpaListResponse> {
  const token = await getSisToken();
  const suffix = fresh ? '/fresh' : '';
  const url = `${API_CONFIG.sisBaseUrl}/${type}/${token}${suffix}`;
  const { data: raw } = await axios.get<unknown>(url, { timeout: 15000 });
  return assertSisAuth(parseSisJson<GradeListResponse | GpaListResponse>(raw));
}
