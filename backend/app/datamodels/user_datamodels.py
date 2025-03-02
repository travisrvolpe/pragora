# datamodels/user_datamodels.py
import sqlalchemy
from sqlalchemy import Table, Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Float, JSON, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.datamodels.community_note_model import community_note_ratings
from database.database import Base
from app.datamodels.post_datamodels import saved_posts_table
from app.datamodels.interaction_datamodels import PostInteraction, CommentInteraction

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    profile = relationship("UserProfile", back_populates="user", cascade="all, delete-orphan", uselist=False) # Ensures one-to-one
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user")
    #comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    #interactions = relationship("BaseInteraction", back_populates="user")
    post_interactions = relationship("PostInteraction", back_populates="user", cascade="all, delete-orphan")
    comment_interactions = relationship("CommentInteraction", back_populates="user", cascade="all, delete-orphan")
    saved_posts = relationship("Post", secondary=saved_posts_table, back_populates="saved_by_users")
    badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")
    analysis = relationship("UserAnalysis", back_populates="user", uselist=False, cascade="all, delete-orphan")
    community_notes = relationship("CommunityNote", back_populates="user", cascade="all, delete-orphan")
    rated_notes = relationship("CommunityNote", secondary=community_note_ratings, back_populates="rated_by")


class Session(Base):
    __tablename__ = "sessions"

    session_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    token = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)

    user = relationship("User", back_populates="sessions")


class UserProfile(Base):
    __tablename__ = "user_profile"

    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    username = Column(String, unique=True, nullable=False)
    avatar_img = Column(String, default='default_url')
    about = Column(Text)
    post_cnt = Column(Integer, default=0)
    comment_cnt = Column(Integer, default=0)
    upvote_cnt = Column(Integer, default=0)
    plan_cnt = Column(Integer, default=0)
    plan_comp_cnt = Column(Integer, default=0)
    plan_ip_cnt = Column(Integer, default=0)
    goals = Column(Text)
    is_messaging = Column(Boolean, default=True)
    is_networking = Column(Boolean, default=True)
    reputation_score = Column(Integer, default=5)
    reputation_cat = Column(String(50), default='New Joiner')
    interests = Column(Text)
    credentials = Column(String)
    expertise_area = Column(String)
    location = Column(String(255))
    gender = Column(String(10))
    sex = Column(String(1))
    worldview_u = Column(String)
    worldview_ai = Column(String)
    date_joined = Column(DateTime(timezone=True), server_default=func.now()) # should be created_at from user table not now
    logon_time = Column(DateTime(timezone=True), server_default=func.now())
    last_active = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    role = Column(String(50), default='user')
    is_admin = Column(Boolean, default=False)
    is_instructor = Column(Boolean, default=False)
    #Whare are some additional fields to add?

    user = relationship("User", back_populates="profile")


class UserAnalysis(Base):
    __tablename__ = "user_analysis"

    user_analysis_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True)

    # Logical Reasoning Analysis (Merit)
    soundness_score = Column(Float, default=0.0)  # Average soundness score across posts
    soundness_details = Column(JSON)  # Details about sound reasoning types

    # Logical Fallacy Analysis (Demerit)
    fallacy_score = Column(Float, default=0.0)  # Average fallacy score across posts
    fallacy_details = Column(JSON)  # Details about fallacy types detected

    # Evidence Quality Analysis (Merit)
    evidence_quality_score = Column(Float, default=0.0)  # Average evidence quality
    evidence_details = Column(JSON)  # Details about evidence types provided

    # Misinformation Analysis (Demerit)
    misinformation_score = Column(Float, default=0.0)  # Misinformation spreading score
    misinformation_details = Column(JSON)  # Details about misinformation types

    # Good Faith Participation (Merit)
    good_faith_score = Column(Float, default=0.0)
    good_faith_details = Column(JSON)  # Details about good faith behaviors

    # Bad Faith Participation (Demerit)
    bad_faith_score = Column(Float, default=0.0)
    bad_faith_details = Column(JSON)  # Details about bad faith behaviors

    # Additional bad faith subcategories
    trolling_score = Column(Float, default=0.0)
    propaganda_score = Column(Float, default=0.0)
    divisiveness_score = Column(Float, default=0.0)
    doomerism_score = Column(Float, default=0.0)

    # Community Impact (Merit)
    community_impact_score = Column(Float, default=0.0)
    community_feedback = Column(JSON)  # Aggregated feedback from community

    # Practical Utility (Merit)
    practical_utility_score = Column(Float, default=0.0)
    saved_to_plans_count = Column(Integer, default=0)
    completed_plans_count = Column(Integer, default=0)
    implementation_complexity = Column(Float, default=0.0)

    # Overall Points
    merit_points = Column(Integer, default=0)  # Total merit points
    demerit_points = Column(Integer, default=0)  # Total demerit points

    # Metadata
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    analysis_version = Column(String)

    # Relationships
    user = relationship("User", back_populates="analysis")

    # Analysis history - can be used to track progression over time
    history = Column(JSON)  # Stores historical snapshots of metrics

'''
class UserAnalysisCount(Base):
    """
    Tracks counts of specific analysis types/subtypes for a user
    This replaces the separate count tables with a single unified structure
    """
    __tablename__ = "user_analysis_counts"

    count_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    analysis_type_id = Column(Integer, ForeignKey("analysis_types.analysis_type_id"), nullable=False)
    analysis_subtype_id = Column(Integer, ForeignKey("analysis_subtypes.analysis_subtype_id"), nullable=False)
    count = Column(Integer, default=0)  # Number of occurrences
    quality_sum = Column(Float, default=0.0)  # Sum of quality scores (for merits)
    severity_sum = Column(Float, default=0.0)  # Sum of severity scores (for demerits)
    first_detected = Column(DateTime(timezone=True), server_default=func.now())
    last_detected = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User")
    analysis_type = relationship("AnalysisType")
    analysis_subtype = relationship("AnalysisSubtype")

    # Indexes for efficient querying
    __table_args__ = (
        Index('idx_user_analysis_type', user_id, analysis_type_id),
        Index('idx_user_analysis_subtype', user_id, analysis_subtype_id),
        sqlalchemy.UniqueConstraint('user_id', 'analysis_type_id', 'analysis_subtype_id',
                                    name='uix_user_analysis_type_subtype'),
    )
'''

# Type count tables for efficient querying
class UserFallacyTypeCount(Base):
    __tablename__ = "user_fallacy_type_counts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    fallacy_type = Column(String, nullable=False)  # Name of the fallacy
    count = Column(Integer, default=0)  # Number of times this fallacy was committed
    severity_sum = Column(Float, default=0.0)  # Sum of severity scores (for averaging)
    last_detected = Column(DateTime(timezone=True))

    # Composite index for efficient querying
    __table_args__ = (
        # Create an index on user_id and fallacy_type
        # This allows fast lookups of specific fallacy types for a user
        # as well as all fallacy types for a specific user
        sqlalchemy.schema.Index('idx_user_fallacy_type', user_id, fallacy_type),
    )


class UserSoundReasoningCount(Base):
    __tablename__ = "user_sound_reasoning_counts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    reasoning_type = Column(String, nullable=False)  # Type of sound reasoning
    count = Column(Integer, default=0)  # Number of times this reasoning was used
    quality_sum = Column(Float, default=0.0)  # Sum of quality scores (for averaging)
    last_detected = Column(DateTime(timezone=True))

    __table_args__ = (
        sqlalchemy.schema.Index('idx_user_reasoning_type', user_id, reasoning_type),
    )


class UserBadFaithCount(Base):
    __tablename__ = "user_bad_faith_counts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    behavior_type = Column(String, nullable=False)  # Type of bad faith behavior
    count = Column(Integer, default=0)  # Number of times this behavior was detected
    severity_sum = Column(Float, default=0.0)  # Sum of severity scores
    last_detected = Column(DateTime(timezone=True))

    __table_args__ = (
        sqlalchemy.schema.Index('idx_user_bad_faith_type', user_id, behavior_type),
    )


class UserGoodFaithCount(Base):
    __tablename__ = "user_good_faith_counts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    behavior_type = Column(String, nullable=False)  # Type of good faith behavior
    count = Column(Integer, default=0)  # Number of times this behavior was detected
    quality_sum = Column(Float, default=0.0)  # Sum of quality scores
    last_detected = Column(DateTime(timezone=True))

    __table_args__ = (
        sqlalchemy.schema.Index('idx_user_good_faith_type', user_id, behavior_type),
    )
