import React from "react";
import { Link } from "react-router-dom";
import "../../styles/pages/Profile.css";
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profiles/${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        if (!data || Object.keys(data).length === 0) {
          throw new Error("Profile data is empty or unavailable.");
        }
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) fetchProfile();
  }, [user?.id]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading profile...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-500">{error}</div>
    </div>
  );

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={profile.avatarImg || '/api/placeholder/100/100'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              <p className="text-gray-600">{profile.location}</p>
            </div>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isEditing ? 'Save Profile' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Activity</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold">{profile.postCnt}</div>
                <div className="text-gray-600">Posts</div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold">{profile.commentCnt}</div>
                <div className="text-gray-600">Comments</div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Details</h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Reputation: </span>
                <span>{profile.reputationScore} ({profile.reputationCat})</span>
              </div>
              <div>
                <span className="font-medium">Expertise: </span>
                <span>{profile.expertiseArea}</span>
              </div>
              <div>
                <span className="font-medium">Member Since: </span>
                <span>{new Date(profile.dateJoined).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-gray-700">{profile.about}</p>
          </div>
        </div>

        {/* Worldview Section */}
        {profile.worldviewU && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Philosophical Worldview</h2>
            <p className="text-gray-700">{profile.worldviewU}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

/*       <div className="profile-content">
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
*/