// src/components/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FormInput from "../components/FormInput";
import '../styles/pages/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const { registerUser } = useAuth();
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
      await registerUser(formData);
      setMessage("Registration successful!");
      navigate(`/profile`);
      //navigate("/profile", { state: { userId: response.data.user_id } });
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.detail || "Registration failed. Please try again.";
      setMessage(errorMessage);
      if (Array.isArray(errorMessage)) {
        const errorsObj = {};
        errorMessage.forEach(err => {
          const field = err.loc[1];
          errorsObj[field] = err.msg;
        });
        setErrors(errorsObj);
      }
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Sign up</h2>

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
          Create Account
        </button>

        {message && (
          <p className={message.includes("successful") ? "success-message" : "error-message"}>
            {message}
          </p>
        )}

        <div className="login-link">
          Already have an account? <a href="/login">Login</a>
        </div>
      </form>
    </div>
  );
};

export default Register;