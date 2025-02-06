import React, { createContext, useState, useContext, useEffect } from "react";
import { getProfile, updateProfile } from "../../services/user/profileService";
import _ from "lodash"; // Import Lodash for debouncing


const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (isLoading) return; // Avoid duplicate requests
    setIsLoading(true);
    setError(null);
    try {
      const profileData = await getProfile();
      setProfile(profileData);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchProfile = _.debounce(fetchProfile, 500); // Debounce to prevent rapid calls

  const updateProfileData = async (updatedProfile) => {
    setIsLoading(true);
    setError(null);
    try {
      const profileData = await updateProfile(updatedProfile);
      setProfile(profileData);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        fetchProfile: debouncedFetchProfile, // Use debounced function
        updateProfileData,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
