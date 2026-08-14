import {
  getConcordiaOpenDataClient,
  type LibraryHourRow,
} from '@/api/concordiaOpenDataClient';

export type LibraryComputersCampus = {
  Desktops?: Record<string, string>;
  Laptops?: string;
  Tablets?: string;
};

export type LibraryComputersResponse = {
  Webster?: LibraryComputersCampus;
  Vanier?: LibraryComputersCampus;
};

export type LibraryBookableResourceRow = {
  resourceID: string;
  name: string;
  scheduleID: string;
};

export async function fetchLibraryComputers(): Promise<LibraryComputersResponse> {
  const client = getConcordiaOpenDataClient();
  const { data } = await client.get<LibraryComputersResponse>('library/computers/');
  return data && typeof data === 'object' ? data : {};
}

export async function fetchLibraryRooms(): Promise<LibraryBookableResourceRow[]> {
  const client = getConcordiaOpenDataClient();
  const { data } = await client.get<LibraryBookableResourceRow[]>(
    'library/rooms/getRoomsList'
  );
  return Array.isArray(data) ? data : [];
}

export type { LibraryHourRow };
