import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import { Camera } from 'lucide-react';

const UserProfile = () => {
  const { user } = useAuth();
  const { profile, isLoading, error, fetchProfile, updateProfileData } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      try {
        // Replace with your actual avatar upload endpoint
        const response = await fetch('/api/profile/avatar', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        setUpdatedProfile(prev => ({ ...prev, avatar_img: data.url }));
      } catch (err) {
        console.error("Error uploading avatar:", err);
      }
    }
  };

  const saveProfile = async () => {
    try {
      await updateProfileData(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Profile Header */}
        <div className="flex items-start gap-6">
          <div className="relative">
            <img
              src={profile?.avatar_img || "/api/placeholder/100/100"}
              alt={profile?.username}
              className="w-24 h-24 rounded-full object-cover"
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1 bg-blue-500 rounded-full"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{profile?.username}</h1>
                <p className="text-gray-600">{profile?.location}</p>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <div className="space-x-2">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </button>
                    <button className="bg-gray-100 px-4 py-2 rounded">Messages</button>
                    <button className="bg-gray-100 px-4 py-2 rounded">View Posts</button>
                    <button className="bg-gray-100 px-4 py-2 rounded">View Comments</button>
                    <button className="bg-gray-100 px-4 py-2 rounded">View Friends</button>
                    <button className="bg-gray-100 px-4 py-2 rounded">Muted & Blocked</button>
                  </div>
                ) : (
                  <>
                    <button onClick={saveProfile} className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
                    <button onClick={() => setIsEditing(false)} className="bg-gray-100 px-4 py-2 rounded">Cancel</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-3 gap-8 mt-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold mb-2">USER STATS</h2>
              <div className="space-y-2 text-gray-600">
                <p>Posts: {profile?.post_cnt}</p>
                <p>Comments: {profile?.comment_cnt}</p>
                <p>Reputation: {profile?.reputation_score}</p>
                <p>Category: {profile?.reputation_cat}</p>
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-2">ABOUT</h2>
              {isEditing ? (
                <textarea
                  name="about"
                  value={updatedProfile.about || profile?.about || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="4"
                />
              ) : (
                <p className="text-gray-600">{profile?.about}</p>
              )}
            </div>
          </div>

          {/* Right Column - Key Facts */}
          <div className="col-span-2">
            <h2 className="font-semibold mb-4">KEY FACTS:</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-500">Interests</h3>
                {isEditing ? (
                  <input
                    type="text"
                    name="interests"
                    value={updatedProfile.interests || profile?.interests || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                ) : (
                  <p>{profile?.interests}</p>
                )}
              </div>

              <div>
                <h3 className="text-gray-500">Credentials</h3>
                {isEditing ? (
                  <input
                    type="text"
                    name="credentials"
                    value={updatedProfile.credentials || profile?.credentials || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                ) : (
                  <p>{profile?.credentials}</p>
                )}
              </div>

              <div>
                <h3 className="text-gray-500">Areas of Expertise</h3>
                {isEditing ? (
                  <input
                    type="text"
                    name="expertise_area"
                    value={updatedProfile.expertise_area || profile?.expertise_area || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                ) : (
                  <p>{profile?.expertise_area}</p>
                )}
              </div>

              <div>
                <h3 className="text-gray-500">Looking to Network</h3>
                {isEditing ? (
                  <select
                    name="is_networking"
                    value={updatedProfile.is_networking || profile?.is_networking || false}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value={true}>Yes</option>
                    <option value={false}>No</option>
                  </select>
                ) : (
                  <p>{profile?.is_networking ? 'Yes' : 'No'}</p>
                )}
              </div>

              <div>
                <h3 className="text-gray-500">Location</h3>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={updatedProfile.location || profile?.location || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                ) : (
                  <p>{profile?.location}</p>
                )}
              </div>

              <div>
                <h3 className="text-gray-500">Joined Date</h3>
                <p>{new Date(profile?.date_joined).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;