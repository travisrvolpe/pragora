# datamodels/post_datamodels.py
import sqlalchemy
from sqlalchemy import Table, Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean, Float, Index
from sqlalchemy import func
from sqlalchemy.orm import relationship, backref, validates
from database.database import Base

# Association Table for Many-to-Many Relationship (Post Tags)
post_tags = Table(
    'post_tags',
    Base.metadata,
    Column('post_id', Integer, ForeignKey('posts.post_id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.tag_id', ondelete='CASCADE'), primary_key=True)
)

saved_posts_table = Table(
    'saved_posts',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.user_id', ondelete='CASCADE'), primary_key=True),
    Column('post_id', Integer, ForeignKey('posts.post_id', ondelete='CASCADE'), primary_key=True),
)


class Post(Base):
    __tablename__ = "posts"

    post_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    title = Column(String)
    subtitle = Column(String)
    content = Column(Text, nullable=False)
    summary = Column(Text)  # AI-generated if not provided

    # Media & Content
    image_url = Column(String, nullable=True)
    images = Column(JSON, nullable=True)
    video_url = Column(String, nullable=True)
    video_metadata = Column(JSON, nullable=True)  # Future enhancement
    audio_url = Column(String, nullable=True)  # Future enhancement
    document_url = Column(String, nullable=True)  # Future enhancement
    embedded_content = Column(JSON, nullable=True)
    link_preview = Column(JSON, nullable=True)

    # Post Metadata
    post_type_id = Column(Integer, ForeignKey("post_types.post_type_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id"))
    subcategory_id = Column(Integer, ForeignKey("subcategories.subcategory_id"))
    visibility = Column(String, default='public')
    is_pinned = Column(Boolean, default=False)
    is_draft = Column(Boolean, default=False)
    parent_post_id = Column(Integer, ForeignKey("posts.post_id"), nullable=True)
    edit_history = Column(JSON, nullable=True)
    custom_subcategory = Column(String, nullable=True)

    # Interaction Metrics
    like_count = Column(Integer, default=0, nullable=False, server_default='0')
    dislike_count = Column(Integer, default=0, nullable=False, server_default='0')
    save_count = Column(Integer, default=0, nullable=False, server_default='0')
    share_count = Column(Integer, default=0, nullable=False, server_default='0')
    comment_count = Column(Integer, default=0, nullable=False, server_default='0')
    report_count = Column(Integer, default=0, nullable=False, server_default='0')

    # Timestamps and Status
    status = Column(String, default='active')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Add this before the relationships section
    #@validates('like_count', 'dislike_count', 'save_count', 'share_count')
    #def validate_count(self, key, count):
    #    return max(0, count or 0)

    # Relationships
    user = relationship("User", back_populates="posts")
    post_type = relationship("PostType", back_populates="posts")
    category = relationship("Category", back_populates="posts")
    tags = relationship("Tag", secondary=post_tags, back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    interactions = relationship("PostInteraction", back_populates="post", cascade="all, delete-orphan")
    saved_by_users = relationship("User", secondary=saved_posts_table, back_populates="saved_posts")
    # TODO ADD REPLIES
    #replies = relationship("Post",
    #                       backref="parent",
    #                       remote_side=[post_id],
    #                       cascade="all, delete-orphan")
    analysis = relationship("PostAnalysis", back_populates="post", uselist=False)
    engagement = relationship("PostEngagement", back_populates="post", uselist=False)
    community_notes = relationship("CommunityNote", back_populates="post", cascade="all, delete-orphan")
    #if adding threaded posts parent_post_id = Column(Integer, ForeignKey("posts.post_id"), nullable=True)
    # subcategory = relationship("Subcategory", back_populates="posts") # Removed as it was causing issues in the previous version



    @validates('like_count', 'dislike_count', 'save_count', 'share_count', 'comment_count', 'report_count')
    def validate_count(self, key, count):
        """Ensure counts never go below 0"""
        if count is None:
            return 0
        return max(0, count)

    # Add index for performance
    __table_args__ = (
        Index('idx_post_metrics',
              'like_count', 'dislike_count', 'save_count',
              'share_count', 'comment_count', 'report_count'),
    )


class Tag(Base):
    __tablename__ = "tags"

    tag_id = Column(Integer, primary_key=True)
    tag_name = Column(String, unique=True, nullable=False)

    posts = relationship("Post", secondary=post_tags, back_populates="tags")

class PostType(Base):
    __tablename__ = "post_types"

    post_type_id = Column(Integer, primary_key=True)
    post_type_name = Column(String, unique=True, nullable=False)

    posts = relationship("Post", back_populates="post_type")

class Category(Base):
    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True)
    cat_name = Column(String, unique=True, nullable=False)

    posts = relationship("Post", back_populates="category")
    subcategories = relationship("Subcategory", back_populates="category", cascade="all, delete-orphan")

class Subcategory(Base):
    __tablename__ = "subcategories"

    subcategory_id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id", ondelete="CASCADE"))

    category = relationship("Category", back_populates="subcategories")

class PostAnalysis(Base):
    __tablename__ = "post_analysis"

    analysis_id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), unique=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))

    # Logical Fallacy Analysis
    fallacy_score = Column(Float)  # Score based on fallacies detected
    fallacy_types = Column(JSON)   # JSON array of detected fallacies with details

    # Well Reasoned Analysis
    soundness_score = Column(Float)  # Score based on soundness of arguments
    soundness_types = Column(JSON)   # JSON array of sound reasoning detected

    # Evidence Analysis
    evidence_score = Column(Float)  # Score based on evidence quality
    evidence_types = Column(JSON)    # JSON array of evidence types found
    evidence_links = Column(JSON)    # Links to potential evidence

    # Good Faith/Bad Faith Analysis
    bad_faith_score = Column(Float)  # Score indicating bad faith participation
    bad_faith_details = Column(JSON) # JSON array of detected bad faith behaviors
    good_faith_score = Column(Float) # Score indicating good faith participation
    good_faith_details = Column(JSON) # JSON array of detected good faith behaviors

    # Community Feedback
    community_score = Column(Float)         # Aggregated community rating
    community_feedback = Column(JSON)       # Aggregated community responses
    community_note_count = Column(Integer, default=0)  # Count of notes added

    # Actionability Analysis
    practical_utility_score = Column(Float)  # How actionable and implementable is the content
    saved_to_plans_count = Column(Integer, default=0)  # Times content saved to plan
    completed_plans_count = Column(Integer, default=0)  # Completion rate of plans
    implementation_complexity = Column(Float)  # How complex is the implementation
    resource_requirements = Column(JSON)  # Resources required for implementation
    estimated_timeline = Column(JSON)  # Estimated timeline for implementation

    # Summary Scores (for badge awarding)
    merit_score = Column(Float, default=0.0)  # Overall merit score
    demerit_score = Column(Float, default=0.0)  # Overall demerit score

    # Analysis Metadata
    analysis_version = Column(String)  # Version of analysis algorithm used
    analyzed_at = Column(DateTime, default=func.now())
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())
    confidence_score = Column(Float)  # Confidence in the analysis results

    # Relationships
    post = relationship("Post", back_populates="analysis")
    user = relationship("User")

class PostEngagement(Base):
    __tablename__ = "post_engagement"

    engagement_id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"))

    # Time-based Metrics
    view_time_total = Column(Integer)  # seconds
    avg_view_duration = Column(Float)
    bounce_rate = Column(Float)
    completion_rate = Column(Float)

    # Interaction Metrics
    unique_viewers = Column(Integer)
    return_viewers = Column(Integer)
    save_rate = Column(Float)
    share_rate = Column(Float)

    # Engagement Score (calculated from above metrics)
    engagement_score = Column(Float)
    last_calculated = Column(DateTime, default=func.now())

    post = relationship("Post", back_populates="engagement")


'''
class AnalysisType(Base):
    """
    Defines types of analysis that can be performed (e.g., Logical Fallacies, Sound Reasoning, etc.)
    Maps to badge types for consistency
    """
    __tablename__ = "analysis_types"

    analysis_type_id = Column(Integer, primary_key=True)
    type_name = Column(String, nullable=False, unique=True)
    type_description = Column(Text)
    is_merit = Column(Boolean, default=True)  # True for merits, False for demerits
    badge_type_id = Column(Integer, ForeignKey("badge_types.badge_type_id"), nullable=True)

    # Relationships
    subtypes = relationship("AnalysisSubtype", back_populates="analysis_type", cascade="all, delete-orphan")
    badge_type = relationship("BadgeType")


class AnalysisSubtype(Base):
    """
    Defines subtypes of analysis (e.g., specific fallacies like Ad Hominem, Straw Man, etc.)
    Maps to badge subtypes for consistency
    """
    __tablename__ = "analysis_subtypes"

    analysis_subtype_id = Column(Integer, primary_key=True)
    analysis_type_id = Column(Integer, ForeignKey("analysis_types.analysis_type_id"), nullable=False)
    subtype_name = Column(String, nullable=False)
    subtype_description = Column(Text)
    is_merit = Column(Boolean, default=True)  # Should match parent type
    badge_subtype_id = Column(Integer, ForeignKey("badge_subtypes.badge_subtype_id"), nullable=True)

    # Relationships
    analysis_type = relationship("AnalysisType", back_populates="subtypes")
    badge_subtype = relationship("BadgeSubtype")

    # Enforce unique constraint on type_id + subtype_name
    __table_args__ = (
        sqlalchemy.UniqueConstraint('analysis_type_id', 'subtype_name', name='uix_analysis_type_subtype'),
    )


class PostAnalysis(Base):
    __tablename__ = "post_analysis"

    analysis_id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), unique=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))

    # Overall Scores
    merit_score = Column(Float, default=0.0)  # Overall merit score
    demerit_score = Column(Float, default=0.0)  # Overall demerit score

    # Logical Analysis
    logical_merit_score = Column(Float, default=0.0)  # Sound reasoning score
    logical_demerit_score = Column(Float, default=0.0)  # Fallacy score

    # Evidence Analysis
    evidence_merit_score = Column(Float, default=0.0)  # Evidence quality score
    evidence_demerit_score = Column(Float, default=0.0)  # Misinformation score

    # Participation Analysis
    participation_merit_score = Column(Float, default=0.0)  # Good faith score
    participation_demerit_score = Column(Float, default=0.0)  # Bad faith score

    # Utility Analysis
    utility_merit_score = Column(Float, default=0.0)  # Practical utility score
    utility_demerit_score = Column(Float, default=0.0)  # Impractical/unhelpful score

    # Detailed Analysis Results
    analysis_details = Column(JSON)  # Contains detailed breakdown of all detected types/subtypes

    # Links to supporting evidence or counter-evidence
    evidence_links = Column(JSON)

    # Community Feedback
    community_score = Column(Float, default=0.0)  # Community-provided score
    community_feedback = Column(JSON)  # Structured community feedback
    community_note_count = Column(Integer, default=0)  # Number of community notes

    # Implementation metrics
    saved_to_plans_count = Column(Integer, default=0)
    completed_plans_count = Column(Integer, default=0)

    # Analysis Metadata
    analyzed_at = Column(DateTime, server_default=func.now())
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())
    analysis_version = Column(String)
    confidence_score = Column(Float, default=0.8)  # Confidence in analysis results

    # Relationships
    post = relationship("Post", back_populates="analysis")
    user = relationship("User")
    analysis_types = relationship("PostAnalysisType", back_populates="post_analysis", cascade="all, delete-orphan")


class PostAnalysisType(Base):
    """
    Links posts to specific analysis types/subtypes that were detected
    Allows for detailed tracking of what was found in each post
    """
    __tablename__ = "post_analysis_types"

    id = Column(Integer, primary_key=True)
    post_analysis_id = Column(Integer, ForeignKey("post_analysis.analysis_id", ondelete="CASCADE"), nullable=False)
    analysis_type_id = Column(Integer, ForeignKey("analysis_types.analysis_type_id"), nullable=False)
    analysis_subtype_id = Column(Integer, ForeignKey("analysis_subtypes.analysis_subtype_id"), nullable=False)

    # Detection details
    score = Column(Float, default=0.0)  # Quality or severity score
    confidence = Column(Float, default=0.0)  # Confidence in this detection
    evidence = Column(Text)  # Text excerpt that supports this detection
    explanation = Column(Text)  # Explanation of why this type was detected

    # Relationships
    post_analysis = relationship("PostAnalysis", back_populates="analysis_types")
    analysis_type = relationship("AnalysisType")
    analysis_subtype = relationship("AnalysisSubtype")
'''
