import React, { useState, useEffect } from 'react';
import { FileText, ThumbsUp, MessageSquare, Share2, Calendar, Eye, Bookmark, User } from 'lucide-react';
import { UserSavedPost } from '@/types/user/user';
import { Post, isArticlePost } from '@/types/posts/post-types';
import { UserAvatar } from '@/components/user/UserAvatar';
import postService from '@/applib/services/post/postService';

const SavedPostsTab: React.FC = () => {
  const [savedPosts, setSavedPosts] = useState<UserSavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertPostToUserSaved = (post: Post): UserSavedPost => {
    return {
      post_id: post.post_id,
      title: isArticlePost(post) ? post.title : post.content.slice(0, 50) + '...',
      content: post.content,
      created_at: post.created_at,
      updated_at: post.updated_at || post.created_at,
      saved_at: new Date().toISOString(),
      status: post.status as 'active' | 'deleted' | 'hidden', //status: (post.status as 'active' | 'deleted' | 'hidden') || 'active',
      likes: post.metrics?.like_count || 0,
      comments: post.metrics?.comment_count || 0,
      shares: post.metrics?.share_count || 0,
      views: 0,
      category: post.category_id?.toString(),
      author: {
        user_id: post.user_id,
        username: post.username || 'Unknown User',
        avatar_img: post.avatar_img
      }
    };
  };

  useEffect(() => {
      const fetchSavedPosts = async () => {
        setIsLoading(true);
        try {
          // First get saved post IDs
          const response = await postService.getSavedPosts();
          console.log('Saved posts response:', response);

          // Handle different response formats
          const savedPostIds = (response && response.saved_posts)
            ? response.saved_posts
            : Array.isArray(response) ? response : [];

          if (savedPostIds.length === 0) {
            console.log('No saved posts found');
            setSavedPosts([]);
            setIsLoading(false);
            return;
          }

          console.log(`Found ${savedPostIds.length} saved posts, fetching details...`);

          // Then fetch full post details for each ID, with error handling for individual posts
          const postsPromises = savedPostIds.map(async (postId: number) => {
            try {
              const post = await postService.getPostById(postId);
              return convertPostToUserSaved(post);
            } catch (postError) {
              console.error(`Error fetching post ${postId}:`, postError);
              return null; // Return null for failed posts
            }
          });

          const results = await Promise.all(postsPromises);
          const validPosts = results.filter(post => post !== null) as UserSavedPost[];

          console.log(`Successfully loaded ${validPosts.length} of ${savedPostIds.length} saved posts`);
          setSavedPosts(validPosts);
        } catch (err) {
          console.error('Error fetching saved posts:', err);
          // Show user-friendly error but still set empty array to avoid undefined errors
          setError('Failed to fetch saved posts');
          setSavedPosts([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSavedPosts();
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

  if (savedPosts.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <Bookmark className="w-12 h-12 text-gray-400 mx-auto" />
        <p className="text-gray-500">No saved posts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {savedPosts.map((post) => (
        <div
          key={post.post_id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          {/* Author section */}
          <div className="flex items-center space-x-3 mb-4">
            <UserAvatar
              username={post.author.username}
              avatarImg={post.author.avatar_img}
              size="sm"
            />
            <span className="text-sm font-medium text-gray-700">
              {post.author.username}
            </span>
          </div>

          {/* Post content */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">
              {post.title}
            </h3>
            <p className="text-gray-600 line-clamp-3">
              {post.content}
            </p>
          </div>

          {/* Metrics and dates */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
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

            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Saved {new Date(post.saved_at).toLocaleDateString()}
              </span>
              {post.category && (
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs">
                  {post.category}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedPostsTab;