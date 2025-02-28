import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCardFactory from 'frontend/pragora-frontend/src/components/factories/PostCardFactory';
import { TOKEN_KEY } from '@/applib/constants/constants';

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
            const token = localStorage.getItem(TOKEN_KEY);
            console.log("Auth Token before fetching post:", token);

            const response = await axios.get(`http://localhost:8000/posts/${post_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });

            console.log("Post data received:", response.data);

            if (response.data.status === 'success' && response.data.data?.post) {
                const rawPost = response.data.data.post;
                console.log("Raw post data:", rawPost);

                setPost({
                    post_id: rawPost.post_id,
                    post_type_id: rawPost.post_type_id,
                    title: rawPost.title || 'Untitled Post',
                    content: rawPost.content,
                    image_url: rawPost.image_url,
                    images: rawPost.images || [],
                    caption: rawPost.caption,
                    video_url: rawPost.video_url,
                    created_at: rawPost.created_at,
                    updated_at: rawPost.updated_at,
                    user_id: rawPost.user_id,
                    username: rawPost.username,
                    avatar_img: rawPost.avatar_img,
                    reputation_score: rawPost.reputation_score,
                    reputation_cat: rawPost.reputation_cat,
                    expertise_area: rawPost.expertise_area,
                    worldview_ai: rawPost.worldview_ai,
                    tags: rawPost.tags || [],
                    like_count: rawPost.like_count || 0,
                    dislike_count: rawPost.dislike_count || 0,
                    save_count: rawPost.save_count || 0,
                    share_count: rawPost.share_count || 0,
                    comment_count: rawPost.comment_count || 0,
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
        const token = localStorage.getItem(TOKEN_KEY);
        console.log(`Auth Token before ${action}:`, token);

        await axios.post(`http://localhost:8000/posts/${post_id}/${action}`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });

        const response = await axios.get(`http://localhost:8000/posts/${post_id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });

        console.log(`Updated post data after ${action}:`, response.data);

        if (response.data.status === 'success' && response.data.data?.post) {
            setPost(prev => ({
                ...prev,
                like_count: response.data.data.post.like_count || 0,
                dislike_count: response.data.data.post.dislike_count || 0,
                save_count: response.data.data.post.save_count || 0,
                share_count: response.data.data.post.share_count || 0
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