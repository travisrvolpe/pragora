import React, { useEffect } from 'react';
import { Alert, AlertDescription } from '../ui/alert';

const ProfileDebug = () => {
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:8000/profiles/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          }
        });
        const data = await response.json();
        console.log('Raw Profile Response:', data);

        // Check required fields
        const requiredFields = [
          'username', 'user_id', 'reputation_score', 'reputation_cat',
          'post_cnt', 'comment_cnt', 'upvote_cnt', 'date_joined'
        ];

        const missingFields = requiredFields.filter(field => !data?.data?.[field]);
        if (missingFields.length > 0) {
          console.warn('Missing required fields:', missingFields);
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="p-4">
      <Alert>
        <AlertDescription>
          Check browser console for profile data debug information
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ProfileDebug;