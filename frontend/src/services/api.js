import axios from 'axios';

// Mock Axios API Service for UrbanPulse
const API_BASE_URL = 'https://api.urbanpulse.mock';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Simulate delay for mock responses
});

export const reportService = {
  // Submit a new civic issue report
  submitReport: async (reportData) => {
    // In a real app, this would be: return apiClient.post('/reports', reportData);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { success: true, trackingId: '#UP-' + Math.floor(Math.random() * 10000) } });
      }, 1500);
    });
  },

  // Fetch all issues (e.g., for map and dashboard)
  getIssues: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            { id: 1, type: 'Pothole', ward: 12, status: 'safe' },
            { id: 2, type: 'Waterlogging', ward: 8, status: 'moderate' }
          ]
        });
      }, 800);
    });
  }
};
