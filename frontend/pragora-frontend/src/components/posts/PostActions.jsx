// PostActions.jsx
import React from "react";
import {
  LikeButton,
  DislikeButton,
  LoveButton,
  HateButton,
  SaveButton,
  ShareButton,
  ReportButton,
} from "../buttons";

const PostActions = ({
  post,
  onLike,
  onDislike,
  onLove,
  onHate,
  onSave,
  onShare,
  onReport,
  variant = "feed"
}) => {
  // Function to format count numbers
  const formatCount = (count) => {
    if (!count) return 0;
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count;
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Engagement Stats */}
      <div className="flex items-center space-x-6 text-sm text-gray-500">
        <span>{formatCount(post.likes_count || 0)} likes</span>
        <span>{formatCount(post.comments_count || 0)} comments</span>
        <span>{formatCount(post.shares_count || 0)} shares</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex space-x-2">
          <LikeButton
            onClick={onLike}
            disabled={post.liked}
          />
          <DislikeButton
            onClick={onDislike}
            disabled={post.disliked}
          />
          {variant === "feed" && (
            <>
              <LoveButton
                onClick={onLove}
                disabled={post.loved}
              />
              <HateButton
                onClick={onHate}
                disabled={post.hated}
              />
            </>
          )}
        </div>

        <div className="flex space-x-2">
          <SaveButton
            onClick={onSave}
            disabled={post.saved}
          />
          <ShareButton
            onClick={onShare}
          />
          <ReportButton
            onClick={onReport}
          />
        </div>
      </div>
    </div>
  );
};

export default PostActions;
