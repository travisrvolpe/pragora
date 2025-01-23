# datamodels.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship # , Mapped, mapped_column
from database.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    #username = Column(String, unique=True, nullable=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Add relationship to profile
    profile = relationship("UserProfile",
                           back_populates="user",
                           foreign_keys="[UserProfile.user_id]",
                           uselist=False)


class Session(Base):
    __tablename__ = "sessions"

    session_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    token = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)


class UserProfile(Base):
    __tablename__ = "user_profile"

    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    avatar_img = Column(String, default='default_url')
    username = Column(String, unique=True)
    about = Column(Text)
    post_cnt = Column(Integer, default=0)
    comment_cnt = Column(Integer, default=0)
    upvote_cnt = Column(Integer, default=0)
    is_messaging = Column(Boolean, default=True)
    is_networking = Column(Boolean, default=True)
    reputation_score = Column(Integer, default=5)
    reputation_cat = Column(String(50), default='Newbie')
    interests = Column(Text)
    credentials = Column(String)
    expertise_area = Column(String)
    location = Column(String(255))
    worldview_u = Column(String)
    worldview_ai = Column(String)
    date_joined = Column(DateTime(timezone=True))
    last_active = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship with User model
    user = relationship("User",
                        back_populates="profile",
                        foreign_keys="[UserProfile.user_id]" )