import axios from 'axios';

// Use deployed backend URL or localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatAPI = {
  sendMessage: async (messages, model = 'mistralai/mistral-7b-instruct') => {
    try {
      const response = await api.post('/api/chat', {
        messages,
        model,
      });
      return response.data;
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  },

  getModels: async () => {
    try {
      const response = await api.get('/api/models');
      return response.data;
    } catch (error) {
      console.error('Models API error:', error);
      throw error;
    }
  },

  clearHistory: async () => {
    try {
      const response = await api.post('/api/clear-history');
      return response.data;
    } catch (error) {
      console.error('Clear history API error:', error);
      throw error;
    }
  },

  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },
};

export default api;
