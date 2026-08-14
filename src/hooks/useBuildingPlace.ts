import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLibraryHours } from '@/api/concordiaOpenDataClient';
import {
  fetchLibraryComputers,
  fetchLibraryRooms,
} from '@/api/libraryFacilities';
import { isConcordiaOpenDataConfigured } from '@/config/concordiaOpenData';
import { queryKeys } from '@/api/queryKeys';
import {
  getBuildingCatalogRecord,
  libraryHoursMatchBranch,
  roomBelongsToBranch,
} from '@/data/buildings';
import type { BuildingSummary } from '@/types/campus';

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function useBuildingPlace(building: BuildingSummary | null) {
  const catalog = building
    ? getBuildingCatalogRecord(building.campusId, building.code)
    : undefined;
  const openData = isConcordiaOpenDataConfigured();
  const dateIso = todayIso();

  const hoursQuery = useQuery({
    queryKey: queryKeys.libraryHours(dateIso),
    queryFn: () => fetchLibraryHours(dateIso),
    staleTime: 30 * 60 * 1000,
    enabled: openData && catalog?.library != null,
  });
  const computersQuery = useQuery({
    queryKey: queryKeys.libraryComputers,
    queryFn: fetchLibraryComputers,
    staleTime: 2 * 60 * 1000,
    enabled: openData && (catalog?.library === 'webster' || catalog?.library === 'vanier'),
  });
  const roomsQuery = useQuery({
    queryKey: queryKeys.libraryRooms,
    queryFn: fetchLibraryRooms,
    staleTime: 60 * 60 * 1000,
    enabled: openData && catalog?.library != null,
  });

  const services = catalog?.services ?? [];
  const departments = catalog?.departments ?? [];

  const hours = useMemo(() => {
    const branch = catalog?.library;
    if (!branch) return [];
    return (hoursQuery.data ?? []).filter(
      (row) => row.service && libraryHoursMatchBranch(row.service, branch)
    );
  }, [catalog?.library, hoursQuery.data]);

  const computers = useMemo(() => {
    const branch = catalog?.library;
    const data = computersQuery.data;
    if (!data || (branch !== 'webster' && branch !== 'vanier')) {
      return null;
    }
    return branch === 'webster' ? data.Webster : data.Vanier;
  }, [catalog?.library, computersQuery.data]);

  const rooms = useMemo(() => {
    const branch = catalog?.library;
    if (!branch) return [];
    return (roomsQuery.data ?? []).filter((row) =>
      roomBelongsToBranch(row.name, branch)
    );
  }, [catalog?.library, roomsQuery.data]);

  return {
    catalog,
    services,
    departments,
    hours,
    computers,
    rooms,
    libraryLoading:
      hoursQuery.isLoading || computersQuery.isLoading || roomsQuery.isLoading,
  };
}
