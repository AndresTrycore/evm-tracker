import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { activityService } from '../services/activities';

/**
 * Hook para eliminar una actividad.
 * Remueve la actividad y fuerza el recálculo del resumen EVM del proyecto.
 * 
 * @param projectId ID del proyecto.
 * @param activityId ID de la actividad a eliminar.
 */
export const useDeleteActivity = (projectId: string, activityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => activityService.deleteActivity(projectId, activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      });
    },
  });
};
