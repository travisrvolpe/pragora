// src/services/profileService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const TOKEN_KEY = 'access_token';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  console.log('Profile Service - Request Config:', {
    url: config.url,
    method: config.method,
    hasToken: !!token
  });

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No token found when making profile request');
  }

  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => {
    console.log('Profile Service - Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('Profile Service - Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const getProfile = async () => {
  try {
    console.log('Making profile request...');
    const response = await api.get('/profiles/me');
    return response.data;
  } catch (error) {
    console.error('Profile request failed:', error.response?.data);
    throw error;
  }
};

export const updateProfile = async (updatedProfile) => {
  try {
    console.log('Making profile update request:', updatedProfile);
    const response = await api.patch('/profiles/me', updatedProfile);
    return response.data;
  } catch (error) {
    console.error('Profile update failed:', error.response?.data);
    throw error;
  }
};