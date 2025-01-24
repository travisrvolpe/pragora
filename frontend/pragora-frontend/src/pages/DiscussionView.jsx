import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share, Flag, BookmarkPlus, MessageSquare, ArrowLeft } from 'lucide-react';
import { LikeButton, DislikeButton, LoveButton, HateButton, SaveButton, ShareButton, ReportButton } from "../components/buttons";
import '../styles/pages/DiscussionView.css';
import axios from 'axios';

const DiscussionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [discussion, setDiscussion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiscussion = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/posts/${id}`, {
        withCredentials: true
      });

      if (response.data.status === 'success') {
        const post = response.data.data.post;
        setDiscussion({
          id: post.post_id,
          title: post.title,
          author: {
            name: post.author_name || 'Anonymous',
            credentials: post.author_credentials,
            reputation: post.author_reputation || 0
          },
          metadata: {
            posted: post.created_at,
            lastEdited: post.updated_at,
            category: post.category,
            qualityScore: post.quality_score || 0,
            contributionCount: post.contribution_count || 0
          },
          content: {
            summary: post.summary,
            mainText: post.content,
            references: post.references || []
          },
          tags: post.tags || [],
          metrics: {
            upvotes: post.upvotes || 0,
            downvotes: post.downvotes || 0,
            comments: post.comments_count || 0,
            saves: post.saves_count || 0
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch discussion:', error);
      navigate('/discussions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInteraction = async (action) => {
    try {
      await axios.post(`http://localhost:8000/posts/${id}/${action}`, {}, {
        withCredentials: true
      });
      fetchDiscussion(); // Refresh the discussion data
    } catch (error) {
      console.error(`Failed to ${action} discussion:`, error);
    }
  };

  useEffect(() => {
    fetchDiscussion();
  }, [id]);

  if (isLoading) {
    return <div className="loading-state">Loading discussion...</div>;
  }

  if (!discussion) {
    return <div className="error-state">Discussion not found</div>;
  }

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
            <LikeButton onClick={() => handleInteraction('like')}/>
            <DislikeButton onClick={() => handleInteraction('dislike')}/>
          </div>

          <div className="action-buttons">
            <SaveButton onClick={() => handleInteraction('save')}/>
            <ShareButton onClick={() => handleInteraction('share')}/>
            <ReportButton onClick={() => handleInteraction('report')}/>
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