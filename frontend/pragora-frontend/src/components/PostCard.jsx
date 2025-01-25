import React from "react";
import { ArrowRight, ThumbsUp, ThumbsDown, BookmarkPlus, Heart, Slash, Share } from "lucide-react";
import { LikeButton, DislikeButton, LoveButton, HateButton, SaveButton, ShareButton, ReportButton } from "./buttons";
import ViewPostButton from "./buttons/ViewPostButton";
import "../styles/components/PostCard.css"; // Optional: Styles specific to the card

const PostCard = ({ post, onViewPost, onLike, onDislike, onSave, onShare, onLove, onHate }) => {
  return (
    <div className="post-card">
      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <div className="post-meta">
          By {post.author} • {post.topic}
        </div>
        <div className="post-engagement">{post.engagement}</div>
        <p className="post-preview">{post.preview}</p>
        <ViewPostButton onClick={() => onViewPost(post.post_id)} />
        <div className="tag-container">
          {post.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="post-actions">
          <LikeButton onClick={() => onLike(post.post_id)} />
          <DislikeButton onClick={() => onDislike(post.post_id)} />
          <LoveButton onClick={() => onLove(post.post_id)} />
          <HateButton onClick={() => onHate(post.post_id)} />
          <SaveButton onClick={() => onSave(post.post_id)} />
          <ShareButton onClick={() => onShare(post.post_id)} />
          <ReportButton onClick={() => onShare(post.post_id)} />
        </div>
      </div>
    </div>
  );
};

export default PostCard;
