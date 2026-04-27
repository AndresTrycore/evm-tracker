/**
 * Fuente única de verdad para las llaves de caché de TanStack Query.
 * Sigue una estructura jerárquica para facilitar la invalidación parcial.
 */
export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    list: () => [...queryKeys.projects.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.projects.all, 'detail', id] as const,
  },
} as const;
