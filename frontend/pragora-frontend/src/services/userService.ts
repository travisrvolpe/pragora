import axios, { AxiosError } from "axios";
import { UserProfile } from "@/types/auth";
import { ApiResponse } from "@/types/api";

const API_BASE_URL = "http://localhost:8000";

interface UpdateProfileData extends Partial<UserProfile> {
  username?: string;
  about?: string;
  location?: string;
  interests?: string;
  credentials?: string;
  expertise_area?: string;
}

export const getUserData = async (): Promise<UserProfile> => {
  try {
    const response = await axios.get<ApiResponse<UserProfile>>(`${API_BASE_URL}/profiles/me`, {
      withCredentials: true,
    });
    return response.data.data as UserProfile;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const updateUserProfile = async (profileData: UpdateProfileData): Promise<UserProfile> => {
  try {
    const response = await axios.patch<ApiResponse<UserProfile>>(
      `${API_BASE_URL}/profiles/me`,
      profileData,
      {
        withCredentials: true,
      }
    );
    return response.data.data as UserProfile;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export default {
  getUserData,
  updateUserProfile,
};