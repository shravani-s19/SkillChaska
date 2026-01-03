import apiClient from '../lib/axios';
import { PlayerContentResponse, ValidateResponse, ModuleMaterialsResponse } from '../types';

export const learnService = {
  getPlayerContent: async (courseId: string, moduleId: string) => {
    const { data } = await apiClient.get<PlayerContentResponse>(
      `/learn/${courseId}/${moduleId}`
    );
    return data;
  },

  validateAnswer: async (moduleId: string, interactionId: string, selectedOption: string) => {
    const { data } = await apiClient.post<ValidateResponse>('/learn/validate', {
      module_id: moduleId,
      interaction_id: interactionId,
      selected_option: selectedOption,
    });
    return data;
  },

  sendHeartbeat: async (courseId: string, moduleId: string, timestamp: number) => {
    await apiClient.post('/learn/heartbeat', {
      course_id: courseId,
      module_id: moduleId,
      current_timestamp: timestamp,
    });
  },
  
  askAI: async (currentTimestamp: number, moduleContext: string, query: string) => {
    const { data } = await apiClient.post<{ answer: string }>('/ai/ask', {
      current_timestamp: currentTimestamp,
      module_context: moduleContext,
      student_query: query,
    });
    return data;
  },

  getModuleMaterials: async (courseId: string, moduleId: string) => {
    const { data } = await apiClient.get<ModuleMaterialsResponse>(
      `/learn/${courseId}/${moduleId}/materials`
    );
    return data;
  },
};