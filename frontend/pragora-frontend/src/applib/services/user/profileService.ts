import api from '@/applib/api/client';
import { API_ENDPOINTS } from '@/applib/api/endpoints';
import { Profile, ProfileUpdateDto } from '@/types/user/profile';
import { ApiResponse } from '@/types/api';
import { AxiosError } from 'axios';
import { User } from '@/types/auth';

class ProfileService {
  async getUserProfile(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(API_ENDPOINTS.AUTH_GET_USER);

      if (!response.data.data) {
        throw new Error('No user data returned from profile request');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to fetch user profile:", {
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            headers: error.config?.headers
          }
        });
      } else {
        console.error("Failed to fetch user profile:", error);
      }
      throw error;
    }
  }

  async getProfile(): Promise<Profile> {
    try {
      const response = await api.get<ApiResponse<Profile>>(API_ENDPOINTS.PROFILE_GET);

      if (!response.data.data) {
        throw new Error('No profile data returned');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to fetch profile:", {
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error("Failed to fetch profile:", error);
      }
      throw error;
    }
  }

  async updateProfile(profileData: ProfileUpdateDto): Promise<Profile> {
    try {
      const response = await api.patch<ApiResponse<Profile>>(
        API_ENDPOINTS.PROFILE_UPDATE,
        profileData
      );
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to update profile:", error);
      }
      throw error;
    }
  }

  async updateAvatar(file: File): Promise<{ avatar_url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<ApiResponse<{ avatar_url: string }>>(
        API_ENDPOINTS.PROFILE_AVATAR_UPDATE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to update avatar:", error);
      }
      throw error;
    }
  }
}

export const profileService = new ProfileService();