import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { StudentEntity } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: StudentEntity | null;
  isLoading: boolean;
  loginSuccess: (token: string, user: StudentEntity) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  // Called after successful login API call
  loginSuccess: (token: string, user: StudentEntity) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('isLoggedIn', 'true');
    set({ isAuthenticated: true, user, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('isLoggedIn');
    set({ isAuthenticated: false, user: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const user = await authService.getProfile();
      // Determine if the response was wrapped or direct
      // Based on Python `return jsonify(user_data)`, it returns the object directly.
      set({ isAuthenticated: true, user: user, isLoading: false });
    } catch (error) {
      console.error("Session expired", error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('isLoggedIn');
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  }
}));