import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authSignup = (name, email, password) =>
  api.post('/auth/signup', { name, email, password });

export const authLogin = (email, password) =>
  api.post('/auth/login', { email, password });

export const createProject = (name, description) =>
  api.post('/projects', { name, description });

export const getUserProjects = () =>
  api.get('/projects');

export const getProject = (projectId) =>
  api.get(`/projects/${projectId}`);

export const deleteProject = (projectId) =>
  api.delete(`/projects/${projectId}`);

export const addMemberToProject = (projectId, email) =>
  api.post(`/projects/${projectId}/members`, { email });

export const removeMemberFromProject = (projectId, memberId) =>
  api.delete(`/projects/${projectId}/members/${memberId}`);

export const createTask = (projectId, title, description, dueDate, priority, assignedTo) =>
  api.post(`/projects/${projectId}/tasks`, {
    title,
    description,
    dueDate,
    priority,
    assignedTo,
  });

export const getProjectTasks = (projectId) =>
  api.get(`/projects/${projectId}/tasks`);

export const updateTask = (projectId, taskId, updates) =>
  api.put(`/projects/${projectId}/tasks/${taskId}`, updates);

export const assignTask = (projectId, taskId, assignedTo) =>
  api.put(`/projects/${projectId}/tasks/${taskId}/assign`, { assignedTo });

export const deleteTask = (projectId, taskId) =>
  api.delete(`/projects/${projectId}/tasks/${taskId}`);

export const getDashboardStats = () =>
  api.get('/dashboard');

export default api;
