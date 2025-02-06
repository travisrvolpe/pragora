// src/api/profile/profile.ts

import { api } from '../index';
import { Profile, ProfileUpdateDto } from '@/types/profile';
import { ApiResponse } from '@/types/api';
import API_ENDPOINTS from '../apiConfig';
import { AxiosError } from 'axios';

class ProfileService {
  async getProfile(): Promise<Profile> {
    try {
      const response = await api.get<ApiResponse<Profile>>(API_ENDPOINTS.PROFILE_GET);
      if (!response.data.data) {
        throw new Error('Profile data is missing from response');
      }
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Failed to fetch profile:', error.response?.data);
      } else {
        console.error('Failed to fetch profile:', error);
      }
      throw error;
    }
  }

  async updateProfile(profileData: ProfileUpdateDto): Promise<Profile> {
    try {
      const response = await api.patch<ApiResponse<Profile>>(API_ENDPOINTS.PROFILE_UPDATE, profileData);
      if (!response.data.data) {
        throw new Error('Updated profile data is missing from response');
      }
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Failed to update profile:', error.response?.data);
      } else {
        console.error('Failed to update profile:', error);
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

      if (!response.data.data) {
        throw new Error('Avatar URL is missing from response');
      }
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Failed to update avatar:', error.response?.data);
      } else {
        console.error('Failed to update avatar:', error);
      }
      throw error;
    }
  }
}

export const profileService = new ProfileService();