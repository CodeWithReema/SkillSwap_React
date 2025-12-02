import axios from 'axios';

const resolveApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    // In CRA dev, backend is on 8080 while frontend runs on 3000
    const targetPort = port === '3000' ? '8080' : port;
    return `${protocol}//${hostname}${targetPort ? `:${targetPort}` : ''}`;
  }
  return 'http://localhost:8080';
};

export const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      // Add token if you implement JWT later
      // const userObj = JSON.parse(user);
      // config.headers.Authorization = `Bearer ${userObj.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User API
export const userAPI = {
  getAll: () => api.get('/api/users').then(res => res.data),
  getById: (id) => api.get(`/api/users/${id}`).then(res => res.data),
  create: (userData) => api.post('/api/users', userData).then(res => res.data),
  update: (id, userData) => api.put(`/api/users/${id}`, userData).then(res => res.data),
  updateLocation: (id, locationData) => api.put(`/api/users/${id}/location`, locationData).then(res => res.data),
  delete: (id) => api.delete(`/api/users/${id}`).then(res => res.data),
};

// Profile API
export const profileAPI = {
  getAll: () => api.get('/api/profiles').then(res => res.data),
  getById: (id) => api.get(`/api/profiles/${id}`).then(res => res.data),
  create: (profileData) => api.post('/api/profiles', profileData).then(res => res.data),
  update: (id, profileData) => api.put(`/api/profiles/${id}`, profileData).then(res => res.data),
  updateLocation: (id, locationData) => api.put(`/api/profiles/${id}/location`, locationData).then(res => res.data),
};

// Swipe API
export const swipeAPI = {
  getAll: () => api.get('/api/swipes').then(res => res.data),
  create: (swipeData) => api.post('/api/swipes', swipeData).then(res => res.data),
  getByUser: (userId) => api.get(`/api/swipes/user/${userId}`).then(res => res.data),
};

// Match API
export const matchAPI = {
  getAll: () => api.get('/api/matches').then(res => res.data),
  getById: (id) => api.get(`/api/matches/${id}`).then(res => res.data),
};

// Message API
export const messageAPI = {
  getAll: () => api.get('/api/messages').then(res => res.data),
  getByMatch: (matchId) => api.get(`/api/messages/match/${matchId}`).then(res => res.data),
  create: (messageData) => api.post('/api/messages', messageData).then(res => res.data),
};

// Skill API
export const skillAPI = {
  getAll: () => api.get('/api/skills').then(res => res.data),
  create: (skillData) => api.post('/api/skills', skillData).then(res => res.data),
};

// User Skill API
export const userSkillAPI = {
  getAll: () => api.get('/api/user-skills').then(res => res.data),
  create: (skillData) => api.post('/api/user-skills', skillData).then(res => res.data),
  delete: (id) => api.delete(`/api/user-skills/${id}`).then(res => res.data),
};

// User Interest API
export const userInterestAPI = {
  getAll: () => api.get('/api/interests').then(res => res.data),
  create: (interestData) => api.post('/api/interests', interestData).then(res => res.data),
  delete: (id) => api.delete(`/api/interests/${id}`).then(res => res.data),
};

// User Organization API
export const userOrganizationAPI = {
  getAll: () => api.get('/api/organizations').then(res => res.data),
  create: (orgData) => api.post('/api/organizations', orgData).then(res => res.data),
  delete: (id) => api.delete(`/api/organizations/${id}`).then(res => res.data),
};

// User Language API
export const userLanguageAPI = {
  getAll: () => api.get('/api/languages').then(res => res.data),
  create: (languageData) => api.post('/api/languages', languageData).then(res => res.data),
  delete: (id) => api.delete(`/api/languages/${id}`).then(res => res.data),
};

// Profile Photo API
export const photoAPI = {
  getByProfile: (profileId) => api.get(`/api/photos/${profileId}`).then(res => res.data),
  upload: (formData) => api.post('/api/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data),
};

// City Suggestions API
export const cityAPI = {
  getSuggestions: (query) => api.get(`/api/profiles/cities/suggestions?q=${encodeURIComponent(query)}`).then(res => res.data),
};

export default api;
