import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { projectService } from '../services/projects';

/**
 * Hook para obtener la lista de todos los proyectos.
 * Utilizado principalmente en el Sidebar para selección de contexto.
 */
export const useProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: () => projectService.getProjects(),
  });
};
