import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";

const UserProfile = () => {
  const { user } = useAuth();
  const {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfileData
  } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});

  useEffect(() => {
    if (user) {
      console.log("Fetching profile for user:", user);
      fetchProfile(); // Debounced fetch
    } else {
      console.log("No user data available, skipping profile fetch");
    }
  }, [user]); // Depend only on user to prevent infinite loop

  useEffect(() => {
    if (error) {
      console.error("Profile Error State:", error);
    }
    if (profile) {
      console.log("Profile Data Received:", profile);
    }
  }, [error, profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile({ ...updatedProfile, [name]: value });
  };

  const saveProfile = async () => {
    try {
      console.log("Attempting to save profile updates:", updatedProfile);
      await updateProfileData(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="profile-container">
      <h1>{profile?.username}</h1>
      {isEditing ? (
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={updatedProfile.username || profile?.username || ""}
            onChange={handleInputChange}
            placeholder="Username"
          />

          <label htmlFor="about">About Me:</label>
          <input
            type="text"
            id="about"
            name="about"
            value={updatedProfile.about || profile?.about || ""}
            onChange={handleInputChange}
            placeholder="About me"
          />

          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            name="location"
            value={updatedProfile.location || profile?.location || ""}
            onChange={handleInputChange}
            placeholder="Location"
          />

          <button onClick={saveProfile}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <p><strong>About:</strong> {profile?.about}</p>
          <p><strong>Location:</strong> {profile?.location}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
