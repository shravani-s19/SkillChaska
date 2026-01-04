// src/services/auth.service.ts
import apiClient from '../lib/axios';
import { StudentEntity } from '../types';

import { Instructor } from '../data/mockAdminData'; // Keep for type definition or create new interface

// Update adminService object:
export const adminService = {
  loginAdmin: async (email: string, pass: string) => {
    // Note: Assuming backend returns a token similar to student login
    const { data } = await apiClient.post('/admin/login', { email, password: pass });
    // In a real app, store this token separately or handle roles in one auth flow
    localStorage.setItem('auth_token', data.token); 
    return data;
  },

  getInstructors: async (): Promise<Instructor[]> => {
    const { data } = await apiClient.get('/admin/instructors');
    return data;
  },

  addInstructor: async (name: string, email: string): Promise<Instructor> => {
    const { data } = await apiClient.post('/admin/instructors', { name, email });
    return data;
  },

  deleteInstructor: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/instructors/${id}`);
  }
};

// ===========================================
//  STUDENT AUTH SERVICE (Existing)
// ===========================================
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
  // 1. Register Student
  register: async (email: string, password: string, fullName: string) => {
    const { data } = await apiClient.post<RegisterResponse>('/auth/register', {
      email,
      password,
      full_name: fullName,
      role: 'student', // Specifically for students
    });
    return data;
  },

  // 2. Login (for students/instructors)
  login: async (email: string, password: string, role: string) => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
      role,
    });
    return data;
  },

  // ... other existing student functions ...
  getProfile: async () => {
    const { data } = await apiClient.get<StudentEntity>('/auth/me');
    return data; 
  },
  
  updateProfile: async (data: Partial<StudentEntity>) => {
    const { data: response } = await apiClient.patch<{ user: StudentEntity }>('/auth/me', data);
    return response.user;
  },
  
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<{ avatar_url: string }>('/auth/me/avatar', formData);
    return data.avatar_url;
  }
};