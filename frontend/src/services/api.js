import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't retry refresh token requests to avoid infinite loops
    if (originalRequest.url?.includes('/auth/refresh')) {
      isRefreshing = false;
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        await api.post('/auth/refresh');
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        // Clear any stored auth state and redirect to login
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  getProfile: () => api.get('/auth/profile'),
  healthCheck: () => api.get('/health'),
};

export default api;
