// is this correct you are importing the entire api folder?
import { api } from '../../api';
import API_ENDPOINTS from "../../api/apiConfig";
import { User, UserProfile } from "@/types/auth";
import { ApiResponse } from "@/types/api";
import { AxiosError } from "axios";

class UserService {
  async getUserProfile(): Promise<User> {
    try {
      console.log('Making user profile request...');
      const response = await api.get<ApiResponse<User>>(API_ENDPOINTS.AUTH_GET_USER);
      console.log('User profile response:', response.data);

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

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<User> {
    try {
      const response = await api.put<ApiResponse<User>>(API_ENDPOINTS.PROFILE_UPDATE, profileData);
      return response.data.data as User;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to update user profile:", error);
      }
      throw error;
    }
  }
}

export const userService = new UserService();
