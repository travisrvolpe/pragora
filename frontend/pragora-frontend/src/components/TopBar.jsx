import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FaUser, FaInbox, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import logo from "../assets/images/ZERO_CROP.PNG";
import "../styles/layout.css";

const TopBar = () => {
  const { user, logoutUser } = useAuth();

  return (
    <div className="top-bar">
      {/* Left Section: Logo and Site Name */}
      <div className="left-section">
        <Link to="/" className="logo-link">
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
        {user ? (
          <>
            <Link to="/inbox" className="inbox-link nav-link">
              <FaInbox className="icon" />
              <span>Inbox</span>
            </Link>
            <Link to="/profile" className="profile-link nav-link">
              <FaUser className="icon" />
              <span>Profile</span>
            </Link>
            <button
              onClick={logoutUser}
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