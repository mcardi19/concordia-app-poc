export function parseSisJson<T>(data: unknown): T {
  if (typeof data === 'string') {
    return JSON.parse(data) as T;
  }
  return data as T;
}

export function assertSisAuth<T extends { errorMessage?: string }>(data: T): T {
  if (data.errorMessage === 'Invalid Token') {
    throw new Error('Invalid Token');
  }
  return data;
}
