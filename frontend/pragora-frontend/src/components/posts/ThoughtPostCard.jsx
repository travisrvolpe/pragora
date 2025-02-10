import React from 'react';
import PostWrapper from './wrapper/PostWrapper';

const ThoughtPostCard = ({
  post,
    variant,
    onViewPost,
  onLike,
  onDislike,
  onSave,
  onShare,
  onComment,
  onThreadedReply,
  onView,
  onFollow,
  onConnect,
  onReport,
  onLove,
  onHate
}) => {
  return (
    <PostWrapper
      post={post}
        variant={variant}
      viewPost={onViewPost}
      onLike={onLike}
      onDislike={onDislike}
      onSave={onSave}
      onShare={onShare}
      onComment={onComment}
      onThreadedReply={onThreadedReply}
      onView={onView}
      onFollow={onFollow}
      onConnect={onConnect}
      onReport={onReport}
      onLove={onLove}
      onHate={onHate}
    >
      {/* Simple content section */}
      <div className="px-4 py-3">
        <div className="text-gray-900 whitespace-pre-wrap">
          {post.content}
        </div>
      </div>
    </PostWrapper>
  );
};

export default ThoughtPostCard;