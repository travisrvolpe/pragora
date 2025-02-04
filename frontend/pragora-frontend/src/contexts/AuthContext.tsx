import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { User, LoginFormData, RegisterFormData, AuthState,  ErrorResponse, FastAPIError, ValidationError } from "@/types/auth";
import { AxiosError } from "axios";

interface AuthContextType extends AuthState {
  loginUser: (credentials: LoginFormData) => Promise<void>;
  registerUser: (userData: RegisterFormData) => Promise<void>;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = () => {
        const token = authService.getToken();

        // Debug log to check if the token is being retrieved
        console.log("Auth Token:", token);

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


  const loginUser = async (credentials: LoginFormData): Promise<void> => {
      try {
          const response = await authService.login(credentials);
          if (response.user) {
              setUser(response.user);
              setError(null);
              navigate("/Dialectica");
          }
      } catch (err) {
          const error = err as AxiosError<ErrorResponse>;
          console.error("Login failed:", error);

          // Handle the error detail which could be string or ValidationError[]
          const errorDetail = error.response?.data?.detail;
          let errorMessage: string;

          if (Array.isArray(errorDetail)) {
              // If it's validation errors, join them into a single message
              errorMessage = errorDetail.map(err => err.msg).join(', ');
          } else if (typeof errorDetail === 'string') {
              // If it's a simple string error
              errorMessage = errorDetail;
          } else {
              // Fallback error message
              errorMessage = "Invalid login credentials.";
          }
          setError(errorMessage);
          throw error;
      }
  };

  const registerUser = async (userData: RegisterFormData): Promise<void> => {
    try {
      if (authService.register) {
        const response = await authService.register(userData);
        if (response.user) {
          setUser(response.user);
          setError(null);
          navigate("/Dialectica");
        }
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setError("Registration failed. Please try again.");
      throw error;
    }
  };

  const logoutUser = (): void => {
    authService.logout();
    setUser(null);
    setError(null);
    navigate("/login");
  };

  const value: AuthContextType = {
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};