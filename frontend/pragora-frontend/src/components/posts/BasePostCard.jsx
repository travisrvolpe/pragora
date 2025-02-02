// BasePostCard.jsx
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";
import { ArrowLeft, MoreHorizontal, BadgeCheck } from "lucide-react";
import {
  LikeButton,
  DislikeButton,
  SaveButton,
  ShareButton,
  ReportButton,
  ViewPostButton
} from "../buttons";

const BasePostCard = ({
  post,
  variant = "feed",
  onBack,
  onViewPost,
  onLike,
  onDislike,
  onSave,
  onShare,
  onReport,
  children
}) => {
  const renderAuthorHeader = () => (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gray-200" /> {/* Avatar placeholder */}
        <div>
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-gray-900">
              {post.author?.name || post.user_id || 'Anonymous'}
            </span>
            {post.author?.verified && (
              <BadgeCheck className="w-4 h-4 text-blue-500" />
            )}
            {post.author?.credentials && (
              <span className="text-gray-500">({post.author.credentials})</span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(post.created_at).toLocaleDateString()}
            {post.updated_at && ` • Edited`}
          </div>
        </div>
      </div>
      <button className="text-gray-500 hover:text-gray-700">
        <MoreHorizontal size={20} />
      </button>
    </div>
  );

  const renderEngagementStats = () => (
    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
      <span>{post.metrics?.likes || post.likes_count || 0} likes</span>
      <span>{post.comments_count || 0} comments</span>
      <span>{post.shares_count || 0} shares</span>
    </div>
  );

  const renderActions = () => (
    <div className="flex items-center justify-between pt-2 border-t">
      <div className="flex space-x-4">
        <LikeButton
          onClick={() => onLike?.(post.post_id)}
          count={post.metrics?.likes || post.likes_count || 0}
        />
        <DislikeButton
          onClick={() => onDislike?.(post.post_id)}
          count={post.metrics?.dislikes || post.dislikes_count || 0}
        />
      </div>
      <div className="flex space-x-4">
        <SaveButton
          onClick={() => onSave?.(post.post_id)}
          count={post.metrics?.saves || post.saves_count || 0}
        />
        <ShareButton onClick={() => onShare?.(post.post_id)} />
        <ReportButton onClick={() => onReport?.(post.post_id)} />
        {variant === "feed" && (
          <ViewPostButton onClick={() => onViewPost?.(post.post_id)} />
        )}
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white hover:bg-gray-50 transition-colors duration-200">
      {variant === "full" && onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 p-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Posts
        </button>
      )}

      {renderAuthorHeader()}

      <CardContent className="px-4 pb-4">
        {children}
        {renderEngagementStats()}
      </CardContent>

      <CardFooter className="bg-gray-50 border-t p-4">
        {renderActions()}
      </CardFooter>
    </Card>
  );
};

export default BasePostCard;