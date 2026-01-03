import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => void; // Call this on app mount
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,

  login: (token: string) => {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('isLoggedIn', 'true');
    set({ isAuthenticated: true, token });
  },

  logout: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('isLoggedIn');
    set({ isAuthenticated: false, token: null });
  },

  checkAuth: () => {
    const token = localStorage.getItem('jwt_token');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (token && isLoggedIn) {
      set({ isAuthenticated: true, token });
    } else {
      set({ isAuthenticated: false, token: null });
    }
  }
}));