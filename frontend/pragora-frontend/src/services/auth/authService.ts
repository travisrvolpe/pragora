// src/services/auth/authService.ts
import axios, { AxiosInstance } from "axios";
import { LoginFormData, RegisterFormData, AuthResponse, User } from "@/types/auth";
import { ApiResponse } from "@/types/api";
import API_ENDPOINTS from "../../api/apiConfig";

const TOKEN_KEY = "access_token";

const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Request headers:', config.headers);
  }
  return config;
});

api.interceptors.response.use(
  response => {
    console.log('Response:', response.data);
    return response;
  },
  error => {
    console.error('Response error:', error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

class AuthService {
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      console.log('Making login request...');
      const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH_LOGIN, credentials);
      console.log('Login response:', response.data);

      const { access_token } = response.data;
      if (access_token) {
        localStorage.setItem(TOKEN_KEY, access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      console.log('Getting current user...');
      const response = await api.get<User>(API_ENDPOINTS.AUTH_GET_USER);
      console.log('Current user response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  async register(userData: RegisterFormData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH_REGISTER, userData);
      const { access_token } = response.data;
      if (access_token) {
        localStorage.setItem(TOKEN_KEY, access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}

export const authService = new AuthService();