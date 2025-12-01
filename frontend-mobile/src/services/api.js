import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ============================================
// API CONFIGURATION FOR PHYSICAL DEVICE TESTING
// ============================================
// For physical device testing, set your computer's IP address here:
// Find your IP: Windows (ipconfig), Mac/Linux (ifconfig)
// Example: 'http://192.168.1.100:8080' or 'http://10.12.3.234:8080'
// 
// IMPORTANT: Make sure to include 'http://' prefix and ':8080' port
const PHYSICAL_DEVICE_IP = 'http://192.168.1.7:8080'; // <-- CHANGE THIS TO YOUR IP

// Set to true if testing on a physical device, false for emulator/simulator
const IS_PHYSICAL_DEVICE = true; // <-- CHANGE THIS

const getApiBaseUrl = () => {
  // Priority 1: Check AsyncStorage for custom URL (runtime override)
  // You can set this via: AsyncStorage.setItem('API_BASE_URL', 'http://YOUR_IP:8080')
  
  // Priority 2: Use physical device IP if configured
  if (IS_PHYSICAL_DEVICE && PHYSICAL_DEVICE_IP) {
    console.log('Using physical device IP:', PHYSICAL_DEVICE_IP);
    return PHYSICAL_DEVICE_IP;
  }
  
  // Priority 3: Platform-specific defaults for emulators/simulators
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    const url = 'http://10.0.2.2:8080';
    console.log('Using Android emulator URL:', url);
    return url;
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    const url = 'http://localhost:8080';
    console.log('Using iOS simulator URL:', url);
    return url;
  }
  
  // Default fallback
  const url = 'http://localhost:8080';
  console.log('Using default URL:', url);
  return url;
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // Check for custom API URL (highest priority)
      const customUrl = await AsyncStorage.getItem('API_BASE_URL');
      if (customUrl) {
        console.log('Using custom API URL from AsyncStorage:', customUrl);
        config.baseURL = customUrl;
      } else {
        console.log('API Request to:', config.baseURL + config.url);
      }
      
      const user = await AsyncStorage.getItem('currentUser');
      if (user) {
        const userObj = JSON.parse(user);
        // Add token if you implement JWT later
      }
    } catch (error) {
      console.error('Error getting user from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error logging for debugging
    const fullUrl = error.config?.baseURL + error.config?.url;
    console.error('API Error Details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      fullUrl: fullUrl,
      baseURL: error.config?.baseURL,
      endpoint: error.config?.url,
      responseData: error.response?.data,
    });
    
    if (error.message === 'Network Error' || error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
      console.error('❌ NETWORK CONNECTION FAILED');
      console.error('Attempted URL:', fullUrl);
      console.error('Troubleshooting steps:');
      console.error('1. Verify backend is running: Open http://' + (error.config?.baseURL?.replace('http://', '') || 'YOUR_IP:8080') + '/api/users in browser');
      console.error('2. Check IP address is correct in api.js (line ~12)');
      console.error('3. Ensure phone and computer are on same Wi-Fi network');
      console.error('4. Check Windows Firewall allows port 8080');
      console.error('5. Try accessing backend URL from phone browser first');
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
  upload: (formData) => {
    // Don't set Content-Type header - let axios set it automatically with boundary
    return api.post('/api/photos/upload', formData, {
      headers: {
        'Accept': 'application/json',
        // Content-Type will be set automatically by axios for FormData
      },
      transformRequest: (data) => {
        // Return FormData as-is for React Native
        return data;
      },
    }).then(res => res.data);
  },
};

// City Suggestions API
export const cityAPI = {
  getSuggestions: (query) => api.get(`/api/profiles/cities/suggestions?q=${encodeURIComponent(query)}`).then(res => res.data),
};

export default api;

