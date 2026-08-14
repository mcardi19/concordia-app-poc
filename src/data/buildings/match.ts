import type { LibraryBranch } from './types';

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function libraryHoursMatchBranch(
  service: string,
  branch: LibraryBranch
): boolean {
  const value = normalize(service);
  if (value.includes('error') || value.includes('something went wrong')) {
    return false;
  }
  if (branch === 'webster') {
    return /webster|special collections|technology sandbox/.test(value);
  }
  if (branch === 'vanier') {
    return value.includes('vanier');
  }
  return /grey\s*nun/.test(value);
}

export function roomBelongsToBranch(name: string, branch: LibraryBranch): boolean {
  const value = normalize(name);
  if (branch === 'webster') {
    return /\blb[- ]|\bwebster/.test(value);
  }
  if (branch === 'vanier') {
    return /\bvl[- ]|\bvanier/.test(value);
  }
  return /grey\s*nun|\bgn[- ]/.test(value);
}

export type { LibraryBranch };
