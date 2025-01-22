import React from "react";
import { ArrowRight, ThumbsUp, ThumbsDown, BookmarkPlus, Heart, Slash, Share } from "lucide-react";
import { LikeButton, DislikeButton, LoveButton, HateButton, SaveButton, ShareButton, ReportButton } from "./buttons";
import ViewDiscussionButton from "../components/buttons/ViewDiscussionButton";
import "../styles/components/DiscussionCard.css"; // Optional: Styles specific to the card

const DiscussionCard = ({ discussion, onViewDiscussion, onLike, onDislike, onSave, onShare, onLove, onHate }) => {
  return (
    <div className="discussion-card">
      <div className="discussion-content">
        <h3 className="discussion-title">{discussion.title}</h3>
        <div className="discussion-meta">
          By {discussion.author} • {discussion.topic}
        </div>
        <div className="discussion-engagement">{discussion.engagement}</div>
        <p className="discussion-preview">{discussion.preview}</p>
        <ViewDiscussionButton onClick={() => onViewDiscussion(discussion.id)} />
        <div className="tag-container">
          {discussion.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="discussion-actions">
          <LikeButton onClick={() => onLike(discussion.id)} />
          <DislikeButton onClick={() => onDislike(discussion.id)} />
          <LoveButton onClick={() => onLove(discussion.id)} />
          <HateButton onClick={() => onHate(discussion.id)} />
          <SaveButton onClick={() => onSave(discussion.id)} />
          <ShareButton onClick={() => onShare(discussion.id)} />
          <ReportButton onClick={() => onShare(discussion.id)} />
        </div>
      </div>
    </div>
  );
};

export default DiscussionCard;
