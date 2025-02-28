import React, { useState, useEffect } from 'react';
import { FileText, ThumbsUp, MessageSquare, Share2, Calendar, Eye, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/applib/services/auth/authService';

// Updated interface with status field
interface UserPost {
  post_id: number;
  title: string | null;
  content: string;
  created_at: string;
  updated_at?: string;
  status?: string;  // Added status field
  likes: number;
  comments: number;
  shares: number;
  image_url?: string;
}

const UserPostsTab: React.FC = () => {
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Using direct fetch to the debug endpoint that we know works
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const token = authService.getToken();

        const response = await fetch(`${apiUrl}/posts/me/debug`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Posts debug response:', data);

        if (data && Array.isArray(data.posts)) {
          setPosts(data.posts);
        } else {
          console.warn('Unexpected response format:', data);
          setPosts([]);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <FileText className="w-12 h-12 text-gray-400 mx-auto" />
        <p className="text-gray-500">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div
          key={post.post_id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">
              {post.title || 'Untitled Post'}
            </h3>
            <span className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>

          {post.image_url && (
            <div className="relative h-40 mb-4 rounded-md overflow-hidden">
              <img
                src={post.image_url.startsWith('http') ? post.image_url : `${process.env.NEXT_PUBLIC_API_URL}${post.image_url}`}
                alt="Post image"
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <p className="text-gray-600 mb-4 line-clamp-3">
            {post.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <ThumbsUp className="w-4 h-4 mr-1" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                <span>{post.comments}</span>
              </div>
              <div className="flex items-center">
                <Share2 className="w-4 h-4 mr-1" />
                <span>{post.shares}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Post status indicator */}
              <div className="text-sm text-gray-500">
                {post.status === 'active' ? (
                  <span className="text-green-600">Active</span>
                ) : post.status === 'hidden' ? (
                  <span className="text-yellow-600">Hidden</span>
                ) : post.status === 'deleted' ? (
                  <span className="text-red-600">Deleted</span>
                ) : (
                  <span className="text-green-600">Active</span> /* Default to active if status is missing */
                )}
              </div>

              <Link
                href={`/dialectica/${post.post_id}`}
                className="inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                View
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserPostsTab;