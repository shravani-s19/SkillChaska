// src/services/auth.service.ts
import apiClient from '../lib/axios';
import { StudentEntity } from '../types';

interface LoginResponse {
  status: string;
  token: string;
  user: StudentEntity;
}

interface RegisterResponse {
  status: string;
  message: string;
  uid: string;
}

export const authService = {
  // 1. Register
  register: async (email: string, password: string, fullName: string) => {
    const { data } = await apiClient.post<RegisterResponse>('/auth/register', {
      email,
      password,
      full_name: fullName,
      role: 'student',
    });
    return data;
  },

  // 2. Login
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password
    });
    return data;
  },

  // 3. Get Profile
  // FIX: The backend returns the User Object directly, not wrapped in { user: ... }
  getProfile: async () => {
    const { data } = await apiClient.get<StudentEntity>('/auth/me');
    return data; 
  },
  
  // 4. Update Profile
  updateProfile: async (data: Partial<StudentEntity>) => {
    const { data: response } = await apiClient.patch<{ user: StudentEntity }>('/auth/me', data);
    return response.user;
  },
  
  // 5. Upload Avatar
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<{ avatar_url: string }>('/auth/me/avatar', formData);
    return data.avatar_url;
  }
};