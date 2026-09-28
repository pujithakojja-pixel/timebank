import axios from 'axios';

// Use /api proxy path so Vite proxies it to backend on port 5000
// This works regardless of which port the frontend runs on (5173 or 5174)
const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tb_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tb_token');
      localStorage.removeItem('tb_user');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Users
export const usersAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  getNearby: (params) => api.get('/users/nearby', { params }),
  search: (params) => api.get('/users/search', { params }),
  getDashboard: () => api.get('/users/dashboard'),
};

// Skills
export const skillsAPI = {
  getAll: (params) => api.get('/skills', { params }),
  getOffers: (params) => api.get('/skills/offers', { params }),
  getDiscover: (params) => api.get('/skills/discover', { params }),
  createOffer: (data) => api.post('/skills/offers', data),
};

// Trades
export const tradesAPI = {
  create: (data) => api.post('/trades', data),
  getAll: (params) => api.get('/trades', { params }),
  getById: (id) => api.get(`/trades/${id}`),
  updateStatus: (id, data) => api.put(`/trades/${id}/status`, data),
  getStats: () => api.get('/trades/stats'),
};

// Matches
export const matchesAPI = {
  getMatches: (params) => api.get('/matches', { params }),
  dismiss: (id) => api.put(`/matches/${id}/dismiss`),
  accept: (id) => api.put(`/matches/${id}/accept`),
};

// Messages
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getRoomMessages: (room, params) => api.get(`/messages/room/${encodeURIComponent(room)}`, { params }),
  send: (data) => api.post('/messages', data),
};

// Wallet
export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
};

// Notifications
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Vouches
export const vouchesAPI = {
  create: (data) => api.post('/vouches', data),
  getUserVouches: (userId) => api.get(`/vouches/user/${userId}`),
};

export default api;
