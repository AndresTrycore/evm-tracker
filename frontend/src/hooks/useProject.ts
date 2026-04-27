import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { projectService } from '../services/projects';

/**
 * Hook para obtener el detalle completo de un proyecto incluyendo actividades y resumen EVM.
 * Es el motor principal del Dashboard.
 * 
 * @param projectId ID del proyecto a consultar.
 */
export const useProject = (projectId: string | null) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId || ''),
    queryFn: () => projectService.getProjectDetail(projectId!),
    enabled: !!projectId,
    placeholderData: keepPreviousData, // Mantiene los datos del proyecto anterior mientras carga el nuevo
  });
};
