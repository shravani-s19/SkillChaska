// src/services/auth.service.ts
import apiClient from '../lib/axios';
import { StudentEntity } from '../types';

// --- NEW IMPORTS for Admin ---
import { 
    getInstructors as mockGetInstructors, 
    addInstructor as mockAddInstructor, 
    deleteInstructor as mockDeleteInstructor, 
    Instructor 
} from '../data/mockAdminData';

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
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password
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


// ===========================================
//  ADMIN API SERVICE (New)
// ===========================================
export const adminService = {
  /**
   * Simulates logging into the admin portal.
   */
  loginAdmin: (email: string, pass: string): Promise<{ success: true }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // TODO: Replace with a real API call to a protected /admin/login endpoint
        if (email === 'admin@codemaska.com' && pass === 'adminpassword') {
          resolve({ success: true });
        } else {
          reject(new Error('Invalid admin credentials.'));
        }
      }, 1000);
    });
  },

  /**
   * Fetches the list of all instructors.
   * Your backend will need a protected GET /instructors endpoint for this.
   */
  getInstructors: (): Promise<Instructor[]> => {
    // TODO: Replace with: apiClient.get('/admin/instructors').then(res => res.data)
    return mockGetInstructors();
  },

  /**
   * Registers a new instructor by calling the existing /auth/register endpoint with the correct role.
   */
  addInstructor: (name: string, email: string): Promise<Instructor> => {
    // This is ready to be connected to your Python backend.
    // Just uncomment the real call and remove the mock call.
    
    // --- REAL API CALL (commented out) ---
    // return apiClient.post('/auth/register', {
    //   full_name: name,
    //   email: email,
    //   password: `default-${Math.random()}`, // Backend should handle password reset flow
    //   role: 'instructor'
    // }).then(res => res.data);

    // --- MOCK API CALL (for frontend development) ---
    return mockAddInstructor(name, email);
  },

  /**
   * Deletes an instructor by their ID.
   * Your backend needs a protected DELETE /instructors/{instructor_id} endpoint.
   */
  deleteInstructor: (id: string): Promise<{ success: true }> => {
    // TODO: Replace with: apiClient.delete(`/admin/instructors/${id}`)
    return mockDeleteInstructor(id);
  }
};