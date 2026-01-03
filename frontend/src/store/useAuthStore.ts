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

  // Update this function to handle silent refresh
  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const user = await authService.getProfile();
      set({ isAuthenticated: true, user: user, isLoading: false });
    } catch (error) {
      // Only logout if error is 401 (Unauthorized)
      if (error.response && error.response.status === 401) {
        console.error("Session expired");
        localStorage.removeItem('auth_token');
        localStorage.removeItem('isLoggedIn');
        set({ isAuthenticated: false, user: null, isLoading: false });
      } else {
        // Network error, just stop loading
        set({ isLoading: false });
      }
    }
  }
}));