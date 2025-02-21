import React, { useState, useEffect } from 'react';
import { FileText, ThumbsUp, MessageSquare, Share2, Calendar, Eye } from 'lucide-react';
import postService from '@/lib/services/post/postService';
import type { UserPost } from '@/types/user/user';
import type { PostWithEngagement } from '@/types/posts/engagement';
import type { Post } from '@/types/posts/post-types';

const UserPostsTab: React.FC = () => {
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert Post to UserPost format
  const convertToUserPost = (post: Post): UserPost => {
    return {
      post_id: post.post_id,
      title: post.post_type_id === 3 ? post.title || 'Untitled Post' : post.content.slice(0, 50) + '...',
      content: post.content,
      created_at: post.created_at,
      updated_at: post.updated_at || post.created_at,
      status: post.status === 'active' ? 'active' : post.status === 'deleted' ? 'deleted' : 'hidden',
      likes: post.metrics?.like_count || 0,
      comments: post.metrics?.comment_count || 0,
      shares: post.metrics?.share_count || 0,
      views: 0 // Default to 0 as Post type doesn't track views
    };
  };

  useEffect(() => {
    const fetchUserPosts = async () => {
      setIsLoading(true);
      try {
        const response = await postService.getMyPosts();
        // Transform the posts to UserPost format
        const userPosts = response.map(convertToUserPost);
        setPosts(userPosts);
      } catch (err) {
        setError('Failed to fetch posts');
        console.error('Error fetching posts:', err);
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
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                <span>{post.views}</span>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              {post.status === 'active' ? (
                <span className="text-green-600">Active</span>
              ) : post.status === 'hidden' ? (
                <span className="text-yellow-600">Hidden</span>
              ) : (
                <span className="text-red-600">Deleted</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserPostsTab;