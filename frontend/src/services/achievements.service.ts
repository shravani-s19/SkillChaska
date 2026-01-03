// File: src/services/achievements.service.ts
import apiClient from '../lib/axios';
import { Badge, Certificate } from '../types';

export const achievementsService = {
  // Get all available badges and their status for the current user
  getBadges: async (): Promise<Badge[]> => {
    const { data } = await apiClient.get('/achievements/badges');
    return data;
  },

  // Get detailed certificate objects based on the IDs in the user profile
  getCertificates: async (certificateIds: string[]): Promise<Certificate[]> => {
    const { data } = await apiClient.post('/achievements/certificates', { ids: certificateIds });
    return data
  }
};