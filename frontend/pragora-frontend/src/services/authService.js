// src/services/authService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/auth";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authService = {
  async login(credentials) {
    try {
      const response = await api.post('/login', credentials);
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      return response.data;
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/register', userData);
      if (response.data.data?.access_token) {
        localStorage.setItem('token', response.data.data.access_token);
      }
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error.response?.data || error.message);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/user');
      return response.data;
    } catch (error) {
      console.error('Failed to get user:', error.response?.data || error.message);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  }
};

export default authService;