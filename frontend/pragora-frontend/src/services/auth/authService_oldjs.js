// src/services/authService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/auth";
const TOKEN_KEY = 'access_token';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Request headers:', config.headers);
  } else {
    console.log('No token found in localStorage');
  }
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('Response:', response.data);
    return response;
  },
  error => {
    console.error('Response error:', error.response?.data);
    return Promise.reject(error);
  }
);

const authService_oldjs = {
  async login(credentials) {
    try {
      const response = await api.post('/login', credentials);
      const { access_token, user } = response.data;

      if (access_token) {
        // Store token consistently
        localStorage.setItem(TOKEN_KEY, access_token);
        // Clear any old token
        localStorage.removeItem('token');

        console.log('Token stored in localStorage');
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/user');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error.response?.data);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('token'); // Clear old token key as well
    console.log('Tokens cleared from localStorage');
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }
};

export default authService_oldjs;