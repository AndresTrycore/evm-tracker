import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { activityService } from '../services/activities';
import { ActivityUpdate } from '../types';

/**
 * Hook para actualizar una actividad existente.
 * Invalida el detalle del proyecto para refrescar los KPIs del dashboard.
 * 
 * @param projectId ID del proyecto.
 * @param activityId ID de la actividad a actualizar.
 */
export const useUpdateActivity = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ activityId, data }: { activityId: string; data: ActivityUpdate }) => 
      activityService.updateActivity(projectId, activityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      });
    },
  });
};
