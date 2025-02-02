import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCardFactory from '../../components/factories/PostCardFactory';

const PostView = () => {
  const { post_id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
  if (!post_id) return;

  setIsLoading(true);
  setError(null);

  try {
    // Update the URL to match your backend route
    const response = await axios.get(`http://localhost:8000/posts/${post_id}`, {
      withCredentials: true
    });

    if (response.data.status === 'success' && response.data.data?.post) {
      const rawPost = response.data.data.post;
      console.log('Raw post data:', rawPost);

      setPost({
        post_id: rawPost.post_id,
        post_type_id: rawPost.post_type_id,
        title: rawPost.title || 'Untitled Post',
        content: rawPost.content,
        image_url: rawPost.image_url,
        images: rawPost.images || [], // Add support for multiple images
        caption: rawPost.caption,
        video_url: rawPost.video_url,
        created_at: rawPost.created_at,
        updated_at: rawPost.updated_at,
        user_id: rawPost.user_id,
        user: rawPost.user, // Include user data
        tags: rawPost.tags || [],
        likes_count: rawPost.likes_count || 0,
        dislikes_count: rawPost.dislikes_count || 0,
        saves_count: rawPost.saves_count || 0,
        shares_count: rawPost.shares_count || 0,
        comments_count: rawPost.comments_count || 0,
        category_id: rawPost.category_id,
        subcategory_id: rawPost.subcategory_id,
        custom_subcategory: rawPost.custom_subcategory
      });
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Failed to fetch post:', error);
    setError(error.message || 'Failed to load post');
  } finally {
    setIsLoading(false);
  }
};

    fetchPost();
  }, [post_id]);

  const handleInteraction = async (action) => {
    if (!post_id || !post) return;
    try {
      await axios.post(`http://localhost:8000/posts/${post_id}/${action}`, {}, {
        withCredentials: true
      });
      const response = await axios.get(`http://localhost:8000/posts/${post_id}`, {
        withCredentials: true
      });

      if (response.data.status === 'success' && response.data.data?.post) {
        const updatedPost = response.data.data.post;
        setPost(prev => ({
          ...prev,
          likes_count: updatedPost.likes_count || 0,
          dislikes_count: updatedPost.dislikes_count || 0,
          saves_count: updatedPost.saves_count || 0,
          shares_count: updatedPost.shares_count || 0
        }));
      }
    } catch (error) {
      console.error(`Failed to ${action} post:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-600">Loading post...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <div className="text-red-600">{error}</div>
        <button
          onClick={() => navigate('/dialectica')}
          className="px-4 py-2 text-blue-600 hover:text-blue-800"
        >
          Return to Dialectica
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <div className="text-gray-600">Post not found</div>
        <button
          onClick={() => navigate('/posts')}
          className="px-4 py-2 text-blue-600 hover:text-blue-800"
        >
          Return to Posts
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="flex justify-center">
        <PostCardFactory
          post={post}
          variant="detail"
          onBack={() => navigate(-1)}
          onLike={() => handleInteraction('like')}
          onDislike={() => handleInteraction('dislike')}
          onSave={() => handleInteraction('save')}
          onShare={() => handleInteraction('share')}
          onReport={() => handleInteraction('report')}
        />
      </div>

      {/* Comments Section - To be implemented */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Comments ({post.comments_count || 0})
        </h2>
        {/* Comments component would go here */}
      </div>
    </div>
  );
};

export default PostView;