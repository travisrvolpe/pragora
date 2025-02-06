// src/api/user/user.ts
import { api } from '../index';
import { User, UserProfile } from '@/types/auth';
import { ApiResponse } from '@/types/api';
import API_ENDPOINTS from "@/api/apiConfig";

export const userApi = {
  async getProfile() {
    const response = await api.get<ApiResponse<User>>(API_ENDPOINTS.AUTH_GET_USER);
    return response.data;
  },

  async updateProfile(profileData: Partial<UserProfile>) {
    const response = await api.put<ApiResponse<User>>(API_ENDPOINTS.PROFILE_UPDATE, profileData);
    return response.data;
  }
};
