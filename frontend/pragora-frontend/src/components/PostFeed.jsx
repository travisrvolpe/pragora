import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { InfiniteScroll } from "./InfiniteScroll";
import PostCard from "./PostCard";

const PostFeed = ({ selectedTab, selectedCategory }) => {
  const navigate = useNavigate();
  const [post, setPosts] = useState([]);
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
        const newPosts = response.data.data.posts;
        setPosts(current =>
          page === 0 ? newPosts : [...current, ...newPosts]
        );
        setHasMore(newPosts.length === 20);
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInteraction = async (post_id, action) => {
    try {
      await axios.post(`http://localhost:8000/posts/${post_id}/${action}`, {}, {
        withCredentials: true
      });
      // Refresh the post list or update the specific post
      fetchPosts();
    } catch (error) {
      console.error(`Failed to ${action} post:`, error);
    }
  };

  const handleViewPost = (post_id) => {
    navigate(`/post/${post_id}`);
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

  return (
    <InfiniteScroll
      loadMore={() => setPage(p => p + 1)}
      hasMore={hasMore && !isLoading}
      isLoading={isLoading}
    >
      <div className="post-feed">
        {isLoading && post.length === 0 ? (
          <div className="loading-placeholder">Loading post...</div>
        ) : (
          post.map((post) => (
            <PostCard
              key={post.post_id}
              post={{
                post_id: post.post_id,
                title: post.title || 'Untitled Post',
                author: post.user_id || 'Anonymous',
                topic: post.category || selectedCategory,
                engagement: `${post.comment_count || 0} contributions • ${post.quality_score || 0}% quality score`,
                preview: post.content,
                tags: post.tags || [],
                metrics: {
                  likes: post.likes_count || 0,
                  dislikes: post.dislikes_count || 0,
                  saves: post.saves_count || 0
                }
              }}
              onViewPost={handleViewPost}
              onLike={() => handleInteraction(post.post_id, 'like')}
              onDislike={() => handleInteraction(post.post_id, 'dislike')}
              onSave={() => handleInteraction(post.post_id, 'save')}
              onShare={() => handleInteraction(post.post_id, 'share')}
              onLove={() => handleInteraction(post.post_id, 'love')}
              onHate={() => handleInteraction(post.post_id, 'hate')}
            />
          ))
        )}
        {!isLoading && post.length === 0 && (
          <div className="no-post">
            No post found in this category.
          </div>
        )}
      </div>
    </InfiniteScroll>
  );
};

export default PostFeed;