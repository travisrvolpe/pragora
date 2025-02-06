import axios from "axios";

const API_BASE_URL = "http://localhost:8000"; // Replace with your backend URL

// Fetch the current logged-in user's data
export const getUserData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user`, {
      withCredentials: true, // Ensure cookies or tokens are sent
    });
    return response.data; // Return the user data
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// Update the user's profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/user`, profileData, {
      withCredentials: true, // Ensure cookies or tokens are sent
    });
    return response.data; // Return the updated user data
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export default {
  getUserData,
  updateUserProfile,
};
