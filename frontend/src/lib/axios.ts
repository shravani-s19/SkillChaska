import axios from 'axios';

const apiClient = axios.create({
  // Use '/api' if you set up the Vite Proxy, otherwise 'http://localhost:5000/api'
  baseURL: 'http://192.168.60.10:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // The backend returns 'token' in the login response
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('isLoggedIn');
      if (window.location.pathname !== '/login') {
         window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;