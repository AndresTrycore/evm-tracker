import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,        // 30 segundos — los datos son "frescos" por 30s
      gcTime: 1000 * 60 * 5,       // 5 minutos en caché inactivo
      retry: 1,                    // 1 reintento automático en caso de error de red
      refetchOnWindowFocus: false, // No recargar al volver a la pestaña
    },
    mutations: {
      retry: 0,                    // Las mutaciones no se reintentan automáticamente
    },
  },
});
