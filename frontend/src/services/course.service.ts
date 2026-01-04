import apiClient from '../lib/axios';
import { CourseEntity } from '../types';

const getBaseUrl = () => {
  const baseURL = apiClient.defaults.baseURL || '';
  // If baseURL is "http://localhost:5000/api", we want "http://localhost:5000"
  return baseURL.replace('/api', '');
};

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
    // 1. Request generation
    const { data } = await apiClient.post<any>(`/course/${id}/certificate`);
    
    // 2. Fix the URL before returning to component
    // If the URL is relative (starts with /), prepend the backend host
    let certUrl = data.certificate.certificateUrl;
    if (certUrl && certUrl.startsWith('/')) {
      certUrl = `${getBaseUrl()}${certUrl}`;
    }

    return {
      ...data.certificate,
      certificateUrl: certUrl
    };
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