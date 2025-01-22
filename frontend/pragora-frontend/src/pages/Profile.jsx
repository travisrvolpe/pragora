import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import "../styles/pages/Profile.css";

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <p>Error: User data could not be loaded.</p>;
  }

  return (
    <div className="profile-container">
      <div className="header-section">
        <div className="profile-picture">
          <img
            src={user.profilePicture || "https://via.placeholder.com/100"}
            alt="Profile"
            className="profile-img"
          />
        </div>
        <div className="profile-actions">
          <button className="action-button">Edit Profile</button>
          <button className="action-button">Messages</button>
          <button className="action-button">My Posts</button>
          <button className="action-button">Muted & Blocked</button>
        </div>
      </div>

      <div className="profile-content">
        <div className="left-section">
          <h3>User Stats</h3>
          <ul>
            <li>Posts: {user.stats.posts}</li>
            <li>Comments: {user.stats.comments}</li>
          </ul>
          <h3>Navigation</h3>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/posts">Posts</Link></li>
            <li><Link to="/comments">Comments</Link></li>
          </ul>
        </div>

        <div className="right-section">
          <h3>Key Facts</h3>
          <p><strong>Interests:</strong> {user.interests.join(", ")}</p>
          <p><strong>Credentials:</strong> {user.credentials.join(", ")}</p>
          <p><strong>Areas of Expertise:</strong> {user.expertise.join(", ")}</p>
          <p><strong>Looking to Network:</strong> {user.networkingGoals.join(", ")}</p>
          <p><strong>Location:</strong> {user.location}</p>
          <p><strong>Joined Date:</strong> {user.joinedDate}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
