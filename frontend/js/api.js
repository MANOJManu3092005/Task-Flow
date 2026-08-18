/**
 * TaskFlow API helper
 * Wraps fetch() calls to the backend, automatically attaching the JWT
 * token from localStorage and handling JSON parsing / errors.
 */

const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('taskflow_token');
}

function getCurrentUser() {
  const raw = localStorage.getItem('taskflow_user');
  return raw ? JSON.parse(raw) : null;
}

function saveSession(token, user) {
  localStorage.setItem('taskflow_token', token);
  localStorage.setItem('taskflow_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('taskflow_token');
  localStorage.removeItem('taskflow_user');
}

/**
 * Redirect to login if there is no token. Call this at the top of
 * every protected page.
 */
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
}

/**
 * Core request helper.
 * @param {string} path - e.g. '/projects'
 * @param {object} options - { method, body }
 */
async function apiRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (res.status === 401) {
    clearSession();
    window.location.href = 'login.html';
    return Promise.reject(new Error('Not authenticated'));
  }

  if (!res.ok) {
    const message = (data && data.message) || 'Something went wrong. Please try again.';
    throw new Error(message);
  }

  return data;
}

const api = {
  register: (payload) => apiRequest('/register', { method: 'POST', body: payload }),
  login: (payload) => apiRequest('/login', { method: 'POST', body: payload }),
  getProfile: () => apiRequest('/profile'),
  updateProfile: (payload) => apiRequest('/profile', { method: 'PUT', body: payload }),
  getUsers: () => apiRequest('/users'),

  getProjects: () => apiRequest('/projects'),
  getProject: (id) => apiRequest(`/projects/${id}`),
  createProject: (payload) => apiRequest('/projects', { method: 'POST', body: payload }),
  updateProject: (id, payload) => apiRequest(`/projects/${id}`, { method: 'PUT', body: payload }),
  deleteProject: (id) => apiRequest(`/projects/${id}`, { method: 'DELETE' }),

  getTasks: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/tasks${qs ? `?${qs}` : ''}`);
  },
  getTask: (id) => apiRequest(`/tasks/${id}`),
  createTask: (payload) => apiRequest('/tasks', { method: 'POST', body: payload }),
  updateTask: (id, payload) => apiRequest(`/tasks/${id}`, { method: 'PUT', body: payload }),
  deleteTask: (id) => apiRequest(`/tasks/${id}`, { method: 'DELETE' }),

  getComments: (taskId) => apiRequest(`/tasks/${taskId}/comments`),
  addComment: (taskId, text) => apiRequest(`/tasks/${taskId}/comments`, { method: 'POST', body: { text } }),
  deleteComment: (commentId) => apiRequest(`/comments/${commentId}`, { method: 'DELETE' })
};

function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.className = `toast ${type}`;
  toast.textContent = message;
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return 'No due date';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  const map = [
    ['year', 31536000], ['month', 2592000], ['day', 86400],
    ['hour', 3600], ['minute', 60]
  ];
  for (const [label, secs] of map) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val} ${label}${val > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}
