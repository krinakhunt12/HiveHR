/**
 * Centralized Query Keys for TanStack Query.
 * Follows a hierarchical structure for efficient cache invalidation.
 */
export const queryKeys = {
  auth: {
    me: (userId?: string) => ['auth', 'me', userId] as const,
  },
  employees: {
    list: (params: any = {}) => ['employees', 'list', params] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
    all: (params: any = {}) => ['employees', 'all-admin', params] as const,
  },
  attendance: {
    today: (userId?: string) => ['attendance', 'today', userId] as const,
    list: (params: any = {}) => ['attendance', 'list', params] as const,
  },
  policies: {
    list: (params: any = {}) => ['policies', 'list', params] as const,
  },
  leaves: {
    list: (params: any = {}) => ['leaves', 'list', params] as const,
    summary: (year?: number) => ['leaves', 'summary', year] as const,
    configs: () => ['leaves', 'configs'] as const,
  },
  tasks: {
    list: (params: any = {}, isAdmin: boolean = false) => ['tasks', 'list', { params, isAdmin }] as const,
  },
  system: {
    health: () => ['system', 'health'] as const,
  }
};
