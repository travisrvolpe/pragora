import React, { useState, useEffect } from "react";
import axios from "axios";
import { InfiniteScroll } from "./InfiniteScroll";
import DiscussionCard from "../components/DiscussionCard";
import DiscussionView from "../pages/DiscussionView";

const DiscussionFeed = ({ selectedTab, selectedCategory }) => {
  const [discussions, setDiscussions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchDiscussions = async () => {
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
        setDiscussions(current =>
          page === 0 ? newPosts : [...current, ...newPosts]
        );
        setHasMore(newPosts.length === 20);
      }
    } catch (error) {
      console.error('Failed to fetch discussions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInteraction = async (id, action) => {
    try {
      await axios.post(`http://localhost:8000/posts/${id}/${action}`, {}, {
        withCredentials: true
      });
      // Refresh the discussion list or update the specific post
      fetchDiscussions();
    } catch (error) {
      console.error(`Failed to ${action} discussion:`, error);
    }
  };

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setDiscussions([]);
    fetchDiscussions();
  }, [selectedTab, selectedCategory]);

  useEffect(() => {
    fetchDiscussions();
  }, [page]);

  return (
    <InfiniteScroll
      loadMore={() => setPage(p => p + 1)}
      hasMore={hasMore && !isLoading}
      isLoading={isLoading}
    >
      <div className="discussion-feed">
        {isLoading && discussions.length === 0 ? (
          <div className="loading-placeholder">Loading discussions...</div>
        ) : (
          discussions.map((discussion) => (
            <DiscussionCard
              key={discussion.post_id}
              discussion={{
                id: discussion.post_id,
                title: discussion.title || 'Untitled Discussion',
                author: discussion.author_name || 'Anonymous',
                topic: discussion.category || selectedCategory,
                engagement: `${discussion.comment_count || 0} contributions • ${discussion.quality_score || 0}% quality score`,
                preview: discussion.content,
                tags: discussion.tags || [],
                metrics: {
                  likes: discussion.likes_count || 0,
                  dislikes: discussion.dislikes_count || 0,
                  saves: discussion.saves_count || 0
                }
              }}
              onViewDiscussion={() => DiscussionView(discussion.post_id)}
              onLike={() => handleInteraction(discussion.post_id, 'like')}
              onDislike={() => handleInteraction(discussion.post_id, 'dislike')}
              onSave={() => handleInteraction(discussion.post_id, 'save')}
              onShare={() => handleInteraction(discussion.post_id, 'share')}
              onLove={() => handleInteraction(discussion.post_id, 'love')}
              onHate={() => handleInteraction(discussion.post_id, 'hate')}
            />
          ))
        )}
        {!isLoading && discussions.length === 0 && (
          <div className="no-discussions">
            No discussions found in this category.
          </div>
        )}
      </div>
    </InfiniteScroll>
  );
};

export default DiscussionFeed;