import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projects';
import { queryKeys } from '../lib/query-keys';
import { ProjectCreate } from '../types';

/**
 * Hook para crear un nuevo proyecto.
 * Invalida la lista de proyectos al tener éxito.
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProjectCreate) => projectService.createProject(data),
    onSuccess: () => {
      // Refrescar la lista de proyectos para que el nuevo aparezca en el sidebar
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() });
    },
  });
};
