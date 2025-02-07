// src/services/profileService.ts
import { api } from '../../api';
import API_ENDPOINTS from "../../api/apiConfig";
import { Profile, ProfileUpdateDto } from "@/types/profile";
import { ApiResponse } from "@/types/api";
import { AxiosError } from "axios";

class ProfileService {
  async getProfile(): Promise<Profile> {
    try {
      console.log('Making profile request...');
      const response = await api.get<ApiResponse<Profile>>(API_ENDPOINTS.PROFILE_GET);
      console.log('Profile response:', response.data);

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

      return response.data.data;  // Return the whole object with avatar_url
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to update avatar:", error);
      }
      throw error;
    }
  }
}


export const profileService = new ProfileService();