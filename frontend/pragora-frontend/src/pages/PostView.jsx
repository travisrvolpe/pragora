import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share, Flag, BookmarkPlus, MessageSquare, ArrowLeft } from 'lucide-react';
import { LikeButton, DislikeButton, LoveButton, HateButton, SaveButton, ShareButton, ReportButton } from "../components/buttons";
import axios from 'axios';

const PostView = () => {
  const {post_id } = useParams();
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
        const response = await axios.get(`http://localhost:8000/posts/${post_id}`, {
          withCredentials: true
        });

        if (response.data.status === 'success' && response.data.data?.post) {
          const post = response.data.data.post;
          setPost({
            post_id: post.post_id,
            title: post.title || 'Untitled Post',
            author: {
              name: post.user_id || 'Anonymous',
              //credentials: post.author_credentials || '',
              //reputation: post.author_reputation || 0
            },
            metadata: {
              posted: post.created_at,
              lastEdited: post.updated_at,
              category: post.category_id || 'Uncategorized',
              qualityScore: 0,
              contributionCount: 0
            },
            content: {
              mainText: post.content || '',
              references: []
            },
            tags: post.tags || [],
            metrics: {
              like: 0,
              dislike: 0,
              comments: 0,
              saves: 0
            }
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

      // Refresh the post data after interaction
      const response = await axios.get(`http://localhost:8000/posts/${post_id}`, {
        withCredentials: true
      });

      if (response.data.status === 'success' && response.data.data?.post) {
        const updatedPost = response.data.data.post;
        setPost(prev => ({
          ...prev,
          metrics: {
            upvotes: updatedPost.upvotes || 0,
            downvotes: updatedPost.downvotes || 0,
            comments: updatedPost.comments_count || 0,
            saves: updatedPost.saves_count || 0
          }
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
          onClick={() => navigate('/post')}
          className="px-4 py-2 text-blue-600 hover:text-blue-800"
        >
          Return to Posts
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <div className="text-gray-600">Post not found</div>
        <button
          onClick={() => navigate('/post')}
          className="px-4 py-2 text-blue-600 hover:text-blue-800"
        >
          Return to Posts
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Posts
      </button>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium">{post.author.name}</span>
              {post.author.credentials && (
                <span className="text-gray-500">({post.author.credentials})</span>
              )}
              <span className="text-blue-600">
                Rep: {post.author.reputation}
              </span>
            </div>

            <div className="text-sm text-gray-500">
              Posted: {new Date(post.metadata.posted).toLocaleDateString()}
              {post.metadata.lastEdited &&
                ` • Edited: ${new Date(post.metadata.lastEdited).toLocaleDateString()}`
              }
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {post.content.summary && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Summary</h2>
              <p className="text-gray-700">{post.content.summary}</p>
            </div>
          )}

          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{post.content.mainText}</p>
          </div>

          {post.content.references.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">References</h3>
              <ul className="list-disc list-inside text-gray-700">
                {post.content.references.map((ref, index) => (
                  <li key={index}>{ref}</li>
                ))}
              </ul>
            </div>
          )}

          {post.tags.length > 0 && (
            <div className="flex gap-2 mt-6 flex-wrap">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-6 bg-gray-50 border-t flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LikeButton onClick={() => handleInteraction('like')} />
            <DislikeButton onClick={() => handleInteraction('dislike')} />
          </div>

          <div className="flex items-center gap-4">
            <SaveButton onClick={() => handleInteraction('save')} />
            <ShareButton onClick={() => handleInteraction('share')} />
            <ReportButton onClick={() => handleInteraction('report')} />
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Comments ({post.metrics.comments})
        </h2>
        {/* Comments component would go here */}
      </div>
    </div>
  );
};

export default PostView;