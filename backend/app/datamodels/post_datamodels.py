# datamodels/post_datamodels.py
from sqlalchemy import Table, Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, backref
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
    likes_count = Column(Integer, default=0)
    dislikes_count = Column(Integer, default=0)
    loves_count = Column(Integer, default=0)
    hates_count = Column(Integer, default=0)
    saves_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    reports_count = Column(Integer, default=0)

    # Timestamps and Status
    status = Column(String, default='active')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="posts")
    post_type = relationship("PostType", back_populates="posts")
    category = relationship("Category", back_populates="posts")
    tags = relationship("Tag", secondary=post_tags, back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    interactions = relationship("PostInteraction", back_populates="post", cascade="all, delete-orphan")
    saved_by_users = relationship("User", secondary=saved_posts_table, back_populates="saved_posts")
    replies = relationship(
        'Post',
        backref=backref('parent', remote_side=[post_id]), # Unresolved reference 'backref'
        cascade="all, delete-orphan"
    )
    analysis = relationship("PostAnalysis", back_populates="post", uselist=False)
    engagement = relationship("PostEngagement", back_populates="post", uselist=False)
    #if adding threaded posts parent_post_id = Column(Integer, ForeignKey("posts.post_id"), nullable=True)
    # subcategory = relationship("Subcategory", back_populates="posts") # Removed as it was causing issues in the previous version


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


class PostInteraction(Base):
    __tablename__ = "post_interactions"

    post_intact_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False)
    post_interaction_type_id = Column(Integer, ForeignKey("post_interaction_types.post_interaction_type_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="post_interactions")
    post = relationship("Post", back_populates="interactions")
    interaction_type = relationship("PostInteractionType", back_populates="interactions")

class PostInteractionType(Base):
    __tablename__ = "post_interaction_types"

    post_interaction_type_id = Column(Integer, primary_key=True)
    post_interaction_type_name = Column(String, unique=True, nullable=False)
    interactions = relationship("PostInteraction", back_populates="interaction_type")


class PostAnalysis(Base):
    __tablename__ = "post_analysis"

    analysis_id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"))

    # Logical Analysis
    fallacy_score = Column(Float)
    fallacy_types = Column(JSON)  # List of detected fallacies
    evidence_score = Column(Float)
    evidence_types = Column(JSON)  # Types of evidence found
    bias_score = Column(Float)
    bias_types = Column(JSON)  # Detected biases

    # Implementation Analysis
    action_score = Column(Float)  # How actionable is the content
    implementation_complexity = Column(Float)
    resource_requirements = Column(JSON)
    estimated_timeline = Column(JSON)

    # AI Analysis Metadata
    analysis_version = Column(String)
    analyzed_at = Column(DateTime, default=func.now())
    confidence_score = Column(Float)

    post = relationship("Post", back_populates="analysis")


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

    # Quality Metrics
    quality_score = Column(Float)
    relevance_score = Column(Float)
    credibility_score = Column(Float)

    # Engagement Score (calculated from above metrics)
    engagement_score = Column(Float)
    last_calculated = Column(DateTime, default=func.now())

    post = relationship("Post", back_populates="engagement")