import axios from 'axios';

// The local development backend server
const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('up_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  googleLogin: async (googleData) => {
    const response = await apiClient.post('/auth/google', googleData);
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};

export const reportService = {
  // Submit a new civic issue report
  submitReport: async (reportData) => {
    const response = await apiClient.post('/issues', reportData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Fetch all issues (e.g., for map and dashboard)
  getIssues: async () => {
    const response = await apiClient.get('/issues');
    return response.data;
  }
};
