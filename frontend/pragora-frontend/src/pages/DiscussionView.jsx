import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share, Flag, BookmarkPlus, MessageSquare, ArrowLeft } from 'lucide-react';
import { LikeButton, DislikeButton, LoveButton, HateButton, SaveButton, ShareButton, ReportButton } from "../components/buttons";
import '../styles/pages/DiscussionView.css';

const DiscussionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Mock data - would come from API/props in production
  const discussion = {
    id: 1,
    title: "Evidence-Based Approaches to Sustainable Urban Planning",
    author: {
      name: "Dr. Sarah Chen",
      credentials: "Ph.D. Urban Planning",
      reputation: 85
    },
    metadata: {
      posted: "2024-01-15T10:30:00",
      lastEdited: "2024-01-15T14:20:00",
      category: "Urban Development",
      qualityScore: 85,
      contributionCount: 126
    },
    content: {
      summary: "An analysis of data-driven methods for creating more sustainable and livable cities...",
      mainText: `This comprehensive study explores the implementation of data-driven urban planning methodologies across various metropolitan areas. Through careful analysis of multiple case studies, we've identified several key patterns that consistently lead to more sustainable and livable urban environments.

      Key findings include:
      1. The importance of integrated transportation systems
      2. The role of green spaces in urban wellness
      3. The impact of mixed-use development on community engagement
      
      Our research suggests that cities implementing these evidence-based approaches have seen significant improvements in both environmental metrics and quality of life indicators.`,
      references: [
        "Urban Planning Quarterly, Vol 45, 2023",
        "Journal of Sustainable Cities, 2024"
      ]
    },
    tags: ["Research-Backed", "Implementation Focus", "Community Impact"],
    metrics: {
      upvotes: 128,
      downvotes: 12,
      comments: 45,
      saves: 67
    }
  };

  return (
    <div className="discussion-view-container">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="back-button">
        <ArrowLeft className="icon" />
        Back to Discussions
      </button>

      {/* Navigation Breadcrumb */}
      <div className="breadcrumb">
        Urban Development / Evidence-Based Planning
      </div>

      {/* Main Content Card */}
      <div className="discussion-main-card">
        {/* Header Section */}
        <div className="discussion-header">
          <h1 className="discussion-title">{discussion.title}</h1>

          <div className="author-info">
            <div className="author-details">
              <span className="author-name">{discussion.author.name}</span>
              <span className="author-credentials">{discussion.author.credentials}</span>
              <span className="reputation-score">
                Reputation: {discussion.author.reputation}
              </span>
            </div>
            <div className="post-metadata">
              Posted: {new Date(discussion.metadata.posted).toLocaleDateString()}
              {discussion.metadata.lastEdited &&
                ` • Edited: ${new Date(discussion.metadata.lastEdited).toLocaleDateString()}`}
            </div>
          </div>

          <div className="quality-metrics">
            <div className="quality-score">
              Quality Score: {discussion.metadata.qualityScore}%
            </div>
            <div className="contribution-count">
              {discussion.metadata.contributionCount} contributions
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="discussion-content">
          {/* Summary Section */}
          <div className="content-summary">
            <h2>Summary</h2>
            <p>{discussion.content.summary}</p>
          </div>

          {/* Main Content */}
          <div className="main-content">
            <p className="whitespace-pre-line">{discussion.content.mainText}</p>
          </div>

          {/* References */}
          {discussion.content.references.length > 0 && (
            <div className="references">
              <h3>References</h3>
              <ul>
                {discussion.content.references.map((ref, index) => (
                  <li key={index}>{ref}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          <div className="tags">
            {discussion.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="action-bar">
          <div className="voting-section">
            <LikeButton onClick={() => console.log("Liked")} />
            <DislikeButton onClick={() => console.log("Disliked")} />
          </div>

          <div className="action-buttons">
            <SaveButton onClick={() => console.log("Saved")} />
            <ShareButton onClick={() => console.log("Shared")} />
            <ReportButton onClick={() => console.log("Reported")} />
          </div>
        </div>
      </div>

      {/* Comments Section - Placeholder */}
      <div className="comments-section">
        <h2>Comments ({discussion.metrics.comments})</h2>
        {/* Comments component would go here */}
      </div>
    </div>
  );
};

export default DiscussionView;