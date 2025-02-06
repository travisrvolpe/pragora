import { api } from '../index';
import { LoginFormData, RegisterFormData, AuthResponse } from '@/types/auth';
import API_ENDPOINTS from "@/api/apiConfig";

export const authApi = {
  async login(formData: LoginFormData) {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH_LOGIN, formData);
    return response.data;
  },

  async register(formData: RegisterFormData) {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH_REGISTER, formData);
    return response.data;
  },

  async getUserProfile() {
    const response = await api.get(API_ENDPOINTS.AUTH_GET_USER);
    return response.data;
  }
};
