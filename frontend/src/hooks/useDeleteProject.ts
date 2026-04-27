import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projects';
import { queryKeys } from '../lib/query-keys';

/**
 * Hook para eliminar un proyecto.
 * Invalida la lista y el detalle del proyecto al tener éxito.
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectService.deleteProject(projectId),
    onSuccess: (_, projectId) => {
      // Refrescar lista
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() });
      // Remover detalle de la caché
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
  });
};
