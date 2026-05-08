import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const signup = (data) => API.post('/api/auth/signup', data);
export const login = (data) => API.post('/api/auth/login', data);
export const getMe = () => API.get('/api/auth/me');

// Projects
export const getProjects = () => API.get('/api/projects');
export const getProject = (id) => API.get(`/api/projects/${id}`);
export const createProject = (data) => API.post('/api/projects', data);
export const updateProject = (id, data) => API.put(`/api/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/api/projects/${id}`);
export const getMembers = (id) => API.get(`/api/projects/${id}/members`);
export const addMember = (id, data) => API.post(`/api/projects/${id}/members`, data);
export const removeMember = (projectId, userId) => API.delete(`/api/projects/${projectId}/members/${userId}`);

// Tasks
export const getTasks = (projectId) => API.get(`/api/projects/${projectId}/tasks`);
export const createTask = (projectId, data) => API.post(`/api/projects/${projectId}/tasks`, data);
export const updateTask = (taskId, data) => API.put(`/api/tasks/${taskId}`, data);
export const deleteTask = (taskId) => API.delete(`/api/tasks/${taskId}`);
export const getMyTasks = () => API.get('/api/my-tasks');

// Dashboard
export const getDashboard = () => API.get('/api/dashboard');
