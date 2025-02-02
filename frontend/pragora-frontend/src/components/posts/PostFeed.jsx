// PostFeed.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { InfiniteScroll } from "../InfiniteScroll";
import PostCardFactory from "../factories/PostCardFactory";

const PostFeed = ({ selectedTab, selectedCategory }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async () => {
    if (!hasMore) return;

    try {
      const params = new URLSearchParams({
        skip: page * 20,
        limit: 20,
        tab: selectedTab,
        category: selectedCategory || ''
      });

      const response = await axios.get(
        `http://localhost:8000/posts?${params}`,
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        // Log the raw post data from server
        console.log("Raw posts from server:", response.data.data.posts);

        const newPosts = response.data.data.posts;
        setPosts(current => page === 0 ? newPosts : [...current, ...newPosts]);
        setHasMore(newPosts.length === 20);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInteraction = async (postId, action) => {
    try {
      await axios.post(`http://localhost:8000/posts/${postId}/${action}`, {}, {
        withCredentials: true
      });
      // Refresh the posts list
      fetchPosts();
    } catch (error) {
      console.error(`Failed to ${action} post:`, error);
    }
  };

  const handleViewPost = (postId) => {
    console.log("Navigating to post:", postId);
    navigate(`/post/${postId}`);
  };

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setPosts([]);
    fetchPosts();
  }, [selectedTab, selectedCategory]);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  if (isLoading && posts.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-gray-100 rounded-lg h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600">No posts found in this category.</p>
        </div>
      </div>
    );
  }

  return (
    <InfiniteScroll
      loadMore={() => setPage(p => p + 1)}
      hasMore={hasMore && !isLoading}
      isLoading={isLoading}
    >
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="space-y-6">
          {posts.map((post) => {
            // Log each post being rendered
            console.log("Raw post before factory:", {
              post_id: post.post_id,
              post_type_id: post.post_type_id,
              title: post.title,
              content: post.content,
              image_url: post.image_url
            });

            return (
              <div key={post.post_id} className="flex justify-center">
                <PostCardFactory
                  post={post}
                  variant="feed"
                  onViewPost={() => handleViewPost(post.post_id)}
                  onLike={() => handleInteraction(post.post_id, 'like')}
                  onDislike={() => handleInteraction(post.post_id, 'dislike')}
                  onSave={() => handleInteraction(post.post_id, 'save')}
                  onShare={() => handleInteraction(post.post_id, 'share')}
                  onReport={() => handleInteraction(post.post_id, 'report')}
                />
              </div>
            );
          })}
        </div>
        {isLoading && (
          <div className="animate-pulse space-y-4 mt-6">
            <div className="bg-gray-100 rounded-lg h-48 w-full" />
          </div>
        )}
      </div>
    </InfiniteScroll>
  );
};

export default PostFeed;