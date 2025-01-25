# app/datamodels/datamodels.py
from sqlalchemy import Table, Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.database import Base

# Association Table for Many-to-Many Relationship (Post Tags)
post_tags = Table(
    'post_tags',
    Base.metadata,
    Column('post_id', Integer, ForeignKey('posts.post_id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.tag_id', ondelete='CASCADE'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    profile = relationship("UserProfile", back_populates="user")
    sessions = relationship("Session", back_populates="user")
    posts = relationship("Post", back_populates="user")


class Session(Base):
    __tablename__ = "sessions"

    session_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    token = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    user = relationship("User", back_populates="sessions")


class UserProfile(Base):
    __tablename__ = "user_profile"

    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    username = Column(String, unique=True)
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
    reputation_cat = Column(String(50), default='Newbie')
    interests = Column(Text)
    credentials = Column(String)
    expertise_area = Column(String)
    location = Column(String(255))
    gender = Column(String(10))
    sex = Column(String(1))
    worldview_u = Column(String)
    worldview_ai = Column(String)
    date_joined = Column(DateTime(timezone=True))
    logon_time = Column(DateTime(timezone=True))
    last_active = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    role = Column(String(50), default='user')
    is_admin = Column(Boolean, default=False)
    is_instructor = Column(Boolean, default=False)
    user = relationship("User", back_populates="profile")

class Post(Base):
    __tablename__ = "posts"

    post_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    title = Column(String)
    subtitle = Column(String)
    content = Column(Text, nullable=False)
    post_type_id = Column(Integer, ForeignKey("post_types.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    subcategory_id = Column(Integer, ForeignKey("subcategories.id"))
    custom_subcategory = Column(String, nullable=True)
    status = Column(String, default='active')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="posts")
    post_type = relationship("PostType", back_populates="posts")
    category = relationship("Category", back_populates="posts")
    #subcategory = relationship("Subcategory", back_populates="posts")
    tags = relationship("Tag", secondary=post_tags, back_populates="posts")


class Tag(Base):
    __tablename__ = "tags"

    tag_id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)

    posts = relationship("Post", secondary=post_tags, back_populates="tags")

class PostType(Base):
    __tablename__ = "post_types"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)

    posts = relationship("Post", back_populates="post_type")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)

    posts = relationship("Post", back_populates="category")
    subcategories = relationship("Subcategory", back_populates="category", cascade="all, delete-orphan")

class Subcategory(Base):
    __tablename__ = "subcategories"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"))

    category = relationship("Category", back_populates="subcategories")

class PostInteraction(Base):
    __tablename__ = "post_interactions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False)
    interaction_type_id = Column(Integer, ForeignKey("interaction_types.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Comment(Base):
    __tablename__ = "comments"

    comment_id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class CommentInteraction(Base):
    __tablename__ = "comment_interactions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    comment_id = Column(Integer, ForeignKey("comments.comment_id", ondelete="CASCADE"), nullable=False)
    interaction_type_id = Column(Integer, ForeignKey("interaction_types.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class InteractionType(Base):
    __tablename__ = "interaction_types"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
