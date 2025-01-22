// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FormInput from "../components/FormInput";
import "../styles/pages/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.includes("@")) {
      newErrors.email = "Please enter a valid email";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      await loginUser(formData);
      setMessage("Login successful!");
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.response?.data?.detail || "Login failed. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <FormInput
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email"
          error={errors.email}
        />

        <FormInput
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Password"
          error={errors.password}
        />

        <button type="submit" className="submit-button">
          Login
        </button>

        {message && (
          <p className={message.includes("successful") ? "success-message" : "error-message"}>
            {message}
          </p>
        )}

        <div className="signup-link">
          Don't have an account? <a href="/register">Sign up</a>
        </div>
      </form>
    </div>
  );
};

export default Login;