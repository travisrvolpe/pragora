//api/auth.ts
import axios from "axios";
import { LoginFormData, RegisterFormData, AuthResponse } from "../types/auth";

const API_BASE_URL = "http://localhost:8000/auth";

export const loginUser = async (formData: LoginFormData) => {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/login`,
      formData
    );

    const { access_token, user } = response.data;

    if (access_token) {
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    }

    return user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const registerUser = async (formData: RegisterFormData) => {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/register`,
      formData
    );

    const { access_token, user } = response.data;

    if (access_token) {
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    }

    return user;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await axios.get(
      `${API_BASE_URL}/user`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
};