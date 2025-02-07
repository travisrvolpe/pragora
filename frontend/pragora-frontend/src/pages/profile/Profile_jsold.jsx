import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useProfile } from '../../contexts/profile/ProfileContext';
import {
  User, Settings, MessageSquare, FileText, Users, Shield,
  Camera, MapPin, Briefcase, Book, Award, Calendar, Edit3
} from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';


const UserProfile = () => {
  const { user } = useAuth();
  const { profile, isLoading, error, fetchProfile, updateProfileData } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setUpdatedProfile(profile);
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/profiles/me/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming you store the token in localStorage
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to upload avatar');
        }

        const data = await response.json();

        // Update the local state with new avatar URL
        setUpdatedProfile(prev => ({
          ...prev,
          avatar_img: data.avatar_url
        }));

        // If we're using a ProfileContext, we might want to update that as well
        if (fetchProfile) {
          await fetchProfile();
        }
      } catch (err) {
        console.error('Error uploading avatar:', err);
        // You might want to show an error message to the user here
      }
    }
  };

  const saveProfile = async () => {
    try {
      await updateProfileData(updatedProfile);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const StatCard = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-50 rounded-full">
          <Icon className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );

  const TabButton = ({ icon: Icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        active 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  const InputField = ({ label, name, value, type = "text", disabled = false }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={handleInputChange}
        disabled={!isEditing || disabled}
        className={`w-full p-2 rounded-lg border ${
          isEditing && !disabled ? 'border-gray-300' : 'border-transparent bg-gray-50'
        }`}
      />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {saveSuccess && (
        <Alert className="bg-green-50 border-green-100">
          <AlertDescription className="text-green-800">
            Profile updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <img
              src={profile?.avatar_img || "/api/placeholder/120/120"}
              alt={profile?.username}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-colors">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            )}
          </div>

          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={updatedProfile.username || ''}
                    onChange={handleInputChange}
                    className="text-3xl font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full"
                    placeholder="Username"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile?.username}
                  </h1>
                )}
                <div className="flex items-center mt-2 text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{profile?.location || 'No location set'}</span>
                </div>
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                    {profile?.reputation_cat}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={saveProfile}
                      className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <StatCard
            title="Posts"
            value={profile?.post_cnt || 0}
            icon={FileText}
          />
          <StatCard
            title="Comments"
            value={profile?.comment_cnt || 0}
            icon={MessageSquare}
          />
          <StatCard
            title="Reputation"
            value={profile?.reputation_score || 0}
            icon={Award}
          />
          <StatCard
            title="Goals Completed"
            value={profile?.plan_comp_cnt || 0}
            icon={Award}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex space-x-4 p-4">
            <TabButton
              icon={User}
              label="Overview"
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <TabButton
              icon={FileText}
              label="Posts"
              active={activeTab === 'posts'}
              onClick={() => setActiveTab('posts')}
            />
            <TabButton
              icon={Users}
              label="Network"
              active={activeTab === 'network'}
              onClick={() => setActiveTab('network')}
            />
            <TabButton
              icon={Settings}
              label="Settings"
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            />
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">About</h3>
                  {isEditing ? (
                    <textarea
                      name="about"
                      value={updatedProfile.about || ''}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows="4"
                    />
                  ) : (
                    <p className="text-gray-600">
                      {profile?.about || 'No bio added yet.'}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Goals</h3>
                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          name="goals"
                          value={updatedProfile.goals || ''}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          rows="4"
                          placeholder="What are your main goals? (e.g., Learn new skills, Network with professionals, etc.)"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600">
                          {profile?.goals || 'No goals set yet.'}
                        </p>
                      </div>
                    )}
                  </div>

                  <InputField
                    label="Interests"
                    name="interests"
                    value={updatedProfile.interests}
                  />
                  <InputField
                    label="Credentials"
                    name="credentials"
                    value={updatedProfile.credentials}
                  />
                  <InputField
                    label="Areas of Expertise"
                    name="expertise_area"
                    value={updatedProfile.expertise_area}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <InputField
                    label="Location"
                    name="location"
                    value={updatedProfile.location}
                  />
                  <InputField
                    label="Gender"
                    name="gender"
                    value={updatedProfile.gender}
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Networking Status
                    </label>
                    <select
                      name="is_networking"
                      value={updatedProfile.is_networking || false}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full p-2 rounded-lg border ${
                        isEditing ? 'border-gray-300' : 'border-transparent bg-gray-50'
                      }`}
                    >
                      <option value={true}>Open to Networking</option>
                      <option value={false}>Not Currently Networking</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Account Info</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Joined {new Date(profile?.date_joined).toLocaleDateString()}
                    </p>
                    <p className="flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Role: {profile?.role || 'User'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="text-center text-gray-500 py-8">
              Posts section coming soon...
            </div>
          )}

          {activeTab === 'network' && (
            <div className="text-center text-gray-500 py-8">
              Network section coming soon...
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="text-center text-gray-500 py-8">
              Settings section coming soon...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;