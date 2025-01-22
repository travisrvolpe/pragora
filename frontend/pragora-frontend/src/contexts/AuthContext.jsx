// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (authService.getToken()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const loginUser = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        const userData = response.user;
        setUser(userData);
        navigate("/Dialectica");
        return response;
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.data.success) {
        const user = {
          username: response.data.username,
          email: userData.email
        };
        setUser(user);
        navigate("/Dialectica");
        return response;
      }
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logoutUser = () => {
    authService.logout();
    setUser(null);
    navigate("/login");
  };

  const value = {
    user,
    loginUser,
    registerUser,
    logoutUser,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};