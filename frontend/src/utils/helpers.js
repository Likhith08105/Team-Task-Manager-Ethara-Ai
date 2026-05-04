// Utility functions for common operations

// AUTH UTILITIES

// Save user token to localStorage
export const saveToken = (token) => {
  localStorage.setItem('token', token);
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Remove token from localStorage (logout)
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Save user info to localStorage
export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Get user info from localStorage
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// DATE UTILITIES

// Format date to readable format (e.g., "Jan 15, 2024")
export const formatDate = (dateString) => {
  if (!dateString) return 'No due date';
  
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Check if date is overdue (past today and not completed)
export const isOverdue = (dateString, status) => {
  if (!dateString || status === 'done') return false;
  
  const dueDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return dueDate < today;
};

// Get days until due date
export const getDaysUntilDue = (dateString) => {
  if (!dateString) return null;
  
  const dueDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const timeDiff = dueDate - today;
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return daysDiff;
};

// STATUS UTILITIES

// Get status label
export const getStatusLabel = (status) => {
  const labels = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done',
  };
  return labels[status] || status;
};

// Get status color for UI
export const getStatusColor = (status) => {
  const colors = {
    'todo': 'bg-gray-200 text-gray-800',
    'in-progress': 'bg-blue-200 text-blue-800',
    'done': 'bg-green-200 text-green-800',
  };
  return colors[status] || 'bg-gray-200 text-gray-800';
};

// PRIORITY UTILITIES

// Get priority label
export const getPriorityLabel = (priority) => {
  const labels = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
  };
  return labels[priority] || priority;
};

// Get priority color for UI
export const getPriorityColor = (priority) => {
  const colors = {
    'low': 'text-green-600',
    'medium': 'text-yellow-600',
    'high': 'text-red-600',
  };
  return colors[priority] || 'text-gray-600';
};
