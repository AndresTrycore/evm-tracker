import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { activityService } from '../services/activities';
import { ActivityCreate } from '../types';

/**
 * Hook para crear una nueva actividad dentro de un proyecto.
 * Al completarse con éxito, invalida el detalle del proyecto para refrescar el resumen EVM.
 * 
 * @param projectId ID del proyecto al que pertenece la actividad.
 */
export const useCreateActivity = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ActivityCreate) => activityService.createActivity(projectId, data),
    onSuccess: () => {
      // Invalidamos el detalle del proyecto para que se recalculen los indicadores EVM
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      });
    },
  });
};
