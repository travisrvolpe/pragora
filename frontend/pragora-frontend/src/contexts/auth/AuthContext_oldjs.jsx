import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    // Wrapper function to execute the async operation
    const initializeAuth = () => {
      const token = authService.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      authService.getCurrentUser()
        .then(userData => {
          if (isMounted) {
            setUser(userData);
          }
        })
        .catch(error => {
          console.error("Failed to fetch user:", error);
          if (isMounted) {
            setError("Failed to fetch user details.");
            setUser(null);
            authService.logout();
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const loginUser = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        setUser(response.user);
        navigate("/Dialectica");
        return response;
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Invalid login credentials.");
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
      setError("Registration failed. Please try again.");
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
    error,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};