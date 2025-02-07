// src/components/TopBar.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/auth/AuthContext";
import { FaUser, FaInbox, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import "../../styles/layout.css";

const logo = require("../../assets/images/ZERO_CROP.PNG");

const TopBar: React.FC = () => {
  const { user, logoutUser, isAuthenticated } = useAuth();

  // Debug log to help diagnose auth state
  console.log('Auth state in TopBar:', { user, isAuthenticated });

  const handleLogout = () => {
    try {
      logoutUser();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="top-bar">
      {/* Left Section: Logo and Site Name */}
      <div className="left-section">
        <Link to="/frontend/pragora-frontend/public" className="logo-link">
          <img src={logo} alt="Pragora Logo" className="logo" />
          <span className="site-name">Pragora</span>
        </Link>
      </div>

      {/* Middle Section: Navigation Links */}
      <div className="middle-section">
        <Link to="/dialectica" className="nav-link">
          Dialectica
        </Link>
        <Link to="/tap" className="nav-link">
          TAP
        </Link>
        <Link to="/pan" className="nav-link">
          PAN
        </Link>
        <Link to="/about" className="nav-link">
          About
        </Link>
        <Link to="/settings" className="nav-link">
          Settings
        </Link>
      </div>

      {/* Right Section: User Profile or Auth Links */}
      <div className="right-section">
        {isAuthenticated && user ? (
          <>
            <Link to="/inbox" className="inbox-link nav-link">
              <FaInbox className="icon" />
              <span>Inbox</span>
            </Link>
            <Link to="/profile" className="profile-link nav-link">
              <FaUser className="icon" />
              <span>{user.username || 'Profile'}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="logout-button text-red-500 hover:text-red-600 font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              <FaSignInAlt className="icon" />
              <span>Login</span>
            </Link>
            <Link to="/register" className="nav-link">
              <FaUserPlus className="icon" />
              <span>Register</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default TopBar;