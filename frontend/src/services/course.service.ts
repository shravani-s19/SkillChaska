import apiClient from '../lib/axios';
import { CourseEntity } from '../types';

export const courseService = {
  getAll: async () => {
    const { data } = await apiClient.get<{data: CourseEntity[]}>('/course');
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<CourseEntity>(`/course/${id}`);
    return data;
  },

  getCertificateById: async (id: string) => {
    const { data } = await apiClient.post<{certificateUrl: string}>(`/course/${id}/certificate`);
    return data;
  },

  getResumePoint: async (courseId: string) => {
    const { data } = await apiClient.get<{
      status: string;
      module_id: string;
      start_at_timestamp: number;
    }>(`/courses/${courseId}/resume`);
    return data;
  },

  enroll: async (courseId: string, paymentReference: string) => {
    // Note: Adjust the URL path ('/course/enroll' or '/courses/enroll') 
    // to match exactly how you registered the blueprint in Flask.
    const { data } = await apiClient.post('/course/enroll', { 
      course_id: courseId, 
      payment_reference: paymentReference 
    });
    return data;
  }
};