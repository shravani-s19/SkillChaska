import apiClient from '../lib/axios';
import { CourseEntity } from '../types';

export const instructorService = {
  getMyCourses: async () => {
    const { data } = await apiClient.get<CourseEntity[]>('/instructor/courses');
    return data;
  },

  createCourse: async (courseData: Partial<CourseEntity>) => {
    const { data } = await apiClient.post<CourseEntity>('/instructor/courses', courseData);
    return data;
  },

  getStats: async () => {
    const { data } = await apiClient.get('/instructor/stats');
    return data;
  },

  uploadModuleMedia: async (
    courseId: string, 
    file: File, 
    title: string, 
    type: 'video' | 'document',
    onProgress: (percent: number) => void
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('course_id', courseId);
    formData.append('title', title);
    formData.append('type', type);

    const { data } = await apiClient.post('/instructor/module/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        onProgress(percentCompleted);
      }
    });
    return data; // returns { module_id, status }
  },

  // Check Processing Status (We can re-use course details or a specific endpoint)
  // For simplicity, we'll fetch the whole course to see the module status updates
  getCourseById: async (id: string) => {
    const { data } = await apiClient.get<CourseEntity>(`/course/${id}`);
    return data;
  }
};