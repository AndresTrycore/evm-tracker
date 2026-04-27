import { apiClient } from '../lib/api-client';
import { Project, ProjectWithEVM, ProjectCreate, ProjectUpdate } from '../types';

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>('/projects');
    return data;
  },

  getProjectDetail: async (id: string): Promise<ProjectWithEVM> => {
    const { data } = await apiClient.get<ProjectWithEVM>(`/projects/${id}`);
    return data;
  },

  createProject: async (projectData: ProjectCreate): Promise<Project> => {
    const { data } = await apiClient.post<Project>('/projects', projectData);
    return data;
  },

  updateProject: async (id: string, projectData: ProjectUpdate): Promise<Project> => {
    const { data } = await apiClient.put<Project>(`/projects/${id}`, projectData);
    return data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};
