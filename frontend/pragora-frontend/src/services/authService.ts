import axios, { AxiosInstance, AxiosError } from "axios";
import { LoginFormData, RegisterFormData, AuthResponse, User } from "@/types/auth";
import { ApiResponse } from "@/types/api";

const API_BASE_URL = "http://localhost:8000/auth";
const TOKEN_KEY = 'access_token';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
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
  (error: AxiosError) => {
    console.error('Response error:', error.response?.data);
    return Promise.reject(error);
  }
);

interface AuthService {
  login(credentials: LoginFormData): Promise<AuthResponse>;
  register(userData: RegisterFormData): Promise<AuthResponse>;
  getCurrentUser(): Promise<User>;
  getUserProfile(): Promise<User>;
  logout(): void;
  getToken(): string | null;
}

const authService: AuthService = {
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/login', credentials);
      const { access_token } = response.data;

      if (access_token) {
        localStorage.setItem(TOKEN_KEY, access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', (error as AxiosError).response?.data);
      throw error;
    }
  },

  async register(userData: RegisterFormData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/register', userData);
      const { access_token } = response.data;

      if (access_token) {
        localStorage.setItem(TOKEN_KEY, access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      }

      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>('/user');
      if (!response.data.data) {
        throw new Error('No user data received');
      }
      return response.data.data;
    } catch (error) {
      console.error('Get current user error:', (error as AxiosError).response?.data);
      throw error;
    }
  },

  async getUserProfile(): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No token found');

      const response = await api.get<ApiResponse<User>>('/user');
      return response.data.data as User;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
    console.log('Tokens cleared from localStorage');
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
};

export default authService;