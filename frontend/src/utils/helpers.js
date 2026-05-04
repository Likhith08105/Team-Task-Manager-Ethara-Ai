
// save user token to localStorage
export const saveToken = (token) => {
  localStorage.setItem('token', token);
};


export const getToken = () => {
  return localStorage.getItem('token');
};


export const removeToken = () => {
  localStorage.removeItem('token');
};

export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!getToken();
};
export const formatDate = (dateString) => {
  if (!dateString) return 'No due date';
  
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export const isOverdue = (dateString, status) => {
  if (!dateString || status === 'done') return false;
  
  const dueDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return dueDate < today;
};

export const getDaysUntilDue = (dateString) => {
  if (!dateString) return null;
  
  const dueDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const timeDiff = dueDate - today;
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return daysDiff;
};

export const getStatusLabel = (status) => {
  const labels = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done',
  };
  return labels[status] || status;
};

export const getStatusColor = (status) => {
  const colors = {
    'todo': 'bg-gray-200 text-gray-800',
    'in-progress': 'bg-blue-200 text-blue-800',
    'done': 'bg-green-200 text-green-800',
  };
  return colors[status] || 'bg-gray-200 text-gray-800';
};

export const getPriorityLabel = (priority) => {
  const labels = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
  };
  return labels[priority] || priority;
};

export const getPriorityColor = (priority) => {
  const colors = {
    'low': 'text-green-600',
    'medium': 'text-yellow-600',
    'high': 'text-red-600',
  };
  return colors[priority] || 'text-gray-600';
};
