# app/datamodels/datamodels.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.database import Base


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
    content = Column(Text, nullable=False)
    status = Column(String, default='active')  # Add this line
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", backref="posts")