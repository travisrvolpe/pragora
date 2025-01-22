// Updated Register.jsx
import React, { useState } from 'react';
import '../styles/pages/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    location: '',
    interests: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.includes('@')) newErrors.email = 'Not a valid input';
    if (formData.password.length < 6) newErrors.password = 'Your password is weak';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Your password does not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted', formData);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Sign up for free</h2>

        <div className="input-container">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email address"
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="input-container">
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="First Name (Optional)"
          />
        </div>

        <div className="input-container">
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Last Name (Optional)"
          />
        </div>

        <div className="input-container">
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Location (Optional)"
          />
        </div>

        <div className="input-container">
          <input
            type="text"
            name="interests"
            value={formData.interests}
            onChange={handleInputChange}
            placeholder="Interests (Optional)"
          />
        </div>

        <div className="input-container">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <div className="input-container">
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Repeat Password"
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        <div className="captcha-container">
          <span className="captcha">CAPTCHA: Please prove you are human</span>
        </div>

        <div className="terms-container">
          <input type="checkbox" id="terms" />
          <label htmlFor="terms">I accept the terms & conditions</label>
        </div>

        <button type="submit" className="submit-button">Create Account</button>
      </form>
    </div>
  );
};

export default Register;
