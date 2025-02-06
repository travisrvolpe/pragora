// src/contexts/profile/ProfileContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Profile, ProfileUpdateDto } from '@/types/profile';
import { profileService } from '../../api/profile/profile';
import _ from 'lodash';

interface ProfileContextType {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfileData: (updatedProfile: ProfileUpdateDto) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileImpl = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const profileData = await profileService.getProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Create the debounced version of the fetch function
  const debouncedFetchProfileImpl = _.debounce(fetchProfileImpl, 500);

  // Wrap the debounced function to ensure it returns a Promise
  const fetchProfile = async () => {
    return new Promise<void>((resolve) => {
      debouncedFetchProfileImpl();
      resolve();
    });
  };

  const updateProfileData = async (updatedProfile: ProfileUpdateDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const profileData = await profileService.updateProfile(updatedProfile);
      setProfile(profileData);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvatar = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const { avatar_url } = await profileService.updateAvatar(file);
      if (profile) {
        setProfile({ ...profile, avatar_img: avatar_url });
      }
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to update avatar');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedFetchProfileImpl.cancel();
    };
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        fetchProfile,
        updateProfileData,
        updateAvatar,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};