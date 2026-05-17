export const queryKeys = {
  schedule: (weekMonday: string) => ['schedule', weekMonday] as const,
  grades: (type: string) => ['grades', type] as const,
  balance: ['balance'] as const,
  services: (campus: string, query: string) => ['services', campus, query] as const,
  featuredEvents: ['featuredEvents'] as const,
  shuttleTracker: ['shuttleTracker'] as const,
};
