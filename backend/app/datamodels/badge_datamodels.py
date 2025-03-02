# datamodels/badge_datamodels.py
import sqlalchemy
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text, Boolean
from sqlalchemy.orm import relationship
from database.database import Base
from sqlalchemy.sql import func


class BadgeCategory(Base):
    __tablename__ = "badge_categories"

    badge_category_id = Column(Integer, primary_key=True)
    badge_name = Column(String, nullable=False)
    badge_description = Column(Text)
    is_merit = Column(Boolean, default=True)  # True for merits, False for demerits

    badges = relationship("Badge", back_populates="category")


class Badge(Base):
    __tablename__ = "badges"

    badge_id = Column(Integer, primary_key=True)
    badge_category_id = Column(Integer, ForeignKey("badge_categories.badge_category_id"))
    badge_name = Column(String, nullable=False)
    badge_description = Column(Text)
    badge_icon_url = Column(String)
    badge_threshold = Column(Integer, nullable=False)  # Points needed to earn badge
    is_merit = Column(Boolean, default=True)  # True for merits, False for demerits

    badge_category = relationship("BadgeCategory", back_populates="badges")
    user_badges = relationship("UserBadge", back_populates="badge")


class UserBadge(Base):
    __tablename__ = "user_badges"

    user_badge_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.badge_id"), nullable=False)
    badge_current_points = Column(Integer, default=0)  # Current points toward this badge
    badge_earned = Column(Boolean, default=False)  # Whether the badge has been earned
    badge_earned_at = Column(DateTime(timezone=True), nullable=True)  # When the badge was earned
    badge_first_progress_at = Column(DateTime(timezone=True), server_default=func.now())  # When progress first started
    badge_last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="badges")
    badge = relationship("Badge", back_populates="user_badges")

    # Enforce unique constraint on user_id + badge_id
    __table_args__ = (
        sqlalchemy.UniqueConstraint('user_id', 'badge_id', name='uix_user_badge'),
    )