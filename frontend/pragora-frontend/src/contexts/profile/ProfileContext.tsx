'use client'

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Profile, ProfileUpdateDto } from '@/types/profile';
import { profileService } from '@/lib/services/user/profileService';
import { useAuth } from '@/contexts/auth/AuthContext';

interface ProfileContextType {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfileData: (updatedProfile: ProfileUpdateDto) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  isLoading: false,
  error: null,
  fetchProfile: async () => {},
  updateProfileData: async () => {},
  updateAvatar: async () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchProfile = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
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

  const updateProfileData = async (updatedProfile: ProfileUpdateDto) => {
    setIsLoading(true);
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const value = {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfileData,
    updateAvatar,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}