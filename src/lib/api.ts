import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://training-75d4130d2459.herokuapp.com/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getMe: () => api.get('/auth/me'),
  
  refreshToken: () => api.post('/auth/refresh'),
  
  updateProfile: (data: { name?: string; email?: string }) =>
    api.put('/auth/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/password', data),
};

// Workouts API
export const workoutsApi = {
  generate: (duration: number) =>
    api.post('/workouts/generate', { duration }),
  
  preview: (level?: string, duration?: number) =>
    api.get('/workouts/preview', { params: { level, duration } }),
  
  getAll: (page = 1, limit = 20) =>
    api.get('/workouts', { params: { page, limit } }),
  
  getOne: (id: number) =>
    api.get(`/workouts/${id}`),
  
  complete: (id: number) =>
    api.post(`/workouts/${id}/complete`),
  
  update: (id: number, data: { notes?: string }) =>
    api.put(`/workouts/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/workouts/${id}`),
  
  getCalendar: (year: number, month: number) =>
    api.get('/workouts/calendar', { params: { year, month } }),
  
  getStats: () =>
    api.get('/workouts/stats'),
};

// Goals API
export const goalsApi = {
  create: (data: { description: string; type: string; targetValue: number; deadline?: string }) =>
    api.post('/goals', data),
  
  getAll: (filter?: 'all' | 'active' | 'completed' | 'overdue') =>
    api.get('/goals', { params: { filter } }),
  
  getOne: (id: number) =>
    api.get(`/goals/${id}`),
  
  update: (id: number, data: Partial<{ description: string; targetValue: number; currentValue: number; deadline: string }>) =>
    api.put(`/goals/${id}`, data),
  
  updateProgress: (id: number, currentValue: number) =>
    api.put(`/goals/${id}/progress`, { currentValue }),
  
  complete: (id: number) =>
    api.post(`/goals/${id}/complete`),
  
  delete: (id: number) =>
    api.delete(`/goals/${id}`),
  
  getStats: () =>
    api.get('/goals/stats'),
};

// Records API
export const recordsApi = {
  create: (data: { exercise: string; type: string; value: number; notes?: string }) =>
    api.post('/records', data),
  
  quickAdd: (data: { exercise: string; type: string; value: number; notes?: string }) =>
    api.post('/records/quick', data),
  
  getAll: (type?: string) =>
    api.get('/records', { params: { type } }),
  
  getPRs: (type?: string) =>
    api.get('/records/prs', { params: { type } }),
  
  getOne: (id: number) =>
    api.get(`/records/${id}`),
  
  getExerciseHistory: (exercise: string, type: string) =>
    api.get(`/records/exercise/${encodeURIComponent(exercise)}`, { params: { type } }),
  
  update: (id: number, data: Partial<{ exercise: string; type: string; value: number; notes: string }>) =>
    api.put(`/records/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/records/${id}`),
  
  getExercises: () =>
    api.get('/records/exercises'),
  
  getRecentPRs: (limit = 5) =>
    api.get('/records/recent-prs', { params: { limit } }),
  
  getStats: () =>
    api.get('/records/stats'),
};

