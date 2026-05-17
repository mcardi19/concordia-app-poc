export type LibraryLoan = {
  id: string;
  title: string;
  author: string;
  dueLabel: string;
  dueUrgent: boolean;
  coverColor: string;
};

export type LibraryQuickAction = {
  id: string;
  label: string;
  icon: 'scan' | 'room' | 'holds';
};

export type CuratedBook = {
  id: string;
  title: string;
  author: string;
  coverColor: string;
  available: boolean;
};

export const LIBRARY_STATUS = 'Open now · Closes 2 a.m. · 73% capacity';

export const LIBRARY_LOANS: LibraryLoan[] = [
  {
    id: '1',
    title: 'The Waves',
    author: 'Virginia Woolf',
    dueLabel: 'Due tomorrow',
    dueUrgent: true,
    coverColor: '#5C4A3A',
  },
  {
    id: '2',
    title: 'Research Methods in Psychology',
    author: 'D. G. Elmes',
    dueLabel: 'Due in 11 days',
    dueUrgent: false,
    coverColor: '#4A5568',
  },
  {
    id: '3',
    title: 'Modernism: A Short Introduction',
    author: 'David Ayers',
    dueLabel: 'Due in 11 days',
    dueUrgent: false,
    coverColor: '#6B5B4F',
  },
];

export const LIBRARY_QUICK_ACTIONS: LibraryQuickAction[] = [
  { id: 'scan', label: 'Scan to check out', icon: 'scan' },
  { id: 'room', label: 'Reserve a room', icon: 'room' },
  { id: 'holds', label: 'Holds (2)', icon: 'holds' },
];

export const CURATED_COURSE = 'ENGL 342';
export const CURATED_BY = 'Curated by Prof. Ashwell';

export const CURATED_BOOKS: CuratedBook[] = [
  {
    id: '1',
    title: 'Mrs Dalloway',
    author: 'Virginia Woolf',
    coverColor: '#912338',
    available: true,
  },
  {
    id: '2',
    title: 'Ulysses',
    author: 'James Joyce',
    coverColor: '#6B7B8C',
    available: true,
  },
  {
    id: '3',
    title: 'The Sound and the Fury',
    author: 'William Faulkner',
    coverColor: '#6B6F4A',
    available: true,
  },
  {
    id: '4',
    title: 'To the Lighthouse',
    author: 'Virginia Woolf',
    coverColor: '#4A3728',
    available: true,
  },
];
