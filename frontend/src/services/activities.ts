import { apiClient } from '../lib/api-client';
import { Activity, ActivityCreate, ActivityUpdate } from '../types';

export const activityService = {
  createActivity: async (projectId: string, activityData: ActivityCreate): Promise<Activity> => {
    const { data } = await apiClient.post<Activity>(`/projects/${projectId}/activities`, activityData);
    return data;
  },

  updateActivity: async (projectId: string, activityId: string, activityData: ActivityUpdate): Promise<Activity> => {
    const { data } = await apiClient.put<Activity>(
      `/projects/${projectId}/activities/${activityId}`,
      activityData
    );
    return data;
  },

  deleteActivity: async (projectId: string, activityId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/activities/${activityId}`);
  },
};
