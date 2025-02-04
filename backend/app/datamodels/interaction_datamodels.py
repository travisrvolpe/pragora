# app/datamodels/interaction_datamodels.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Index, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.database import Base
import enum


class InteractionTargetType(enum.Enum):
    POST = "post"
    COMMENT = "comment"


class BaseInteraction(Base):
    """Abstract base class for interactions"""
    __abstract__ = True

    interaction_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    target_type = Column(Enum(InteractionTargetType), nullable=False)
    interaction_type_id = Column(Integer, ForeignKey("interaction_types.interaction_type_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    metadata = Column(JSON, nullable=True)  # For storing interaction-specific data (e.g., report reason)

    user = relationship("User", back_populates="interactions")
    interaction_type = relationship("InteractionType", back_populates="interactions")


class PostInteraction(BaseInteraction):
    __tablename__ = "post_interactions"

    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        Index('idx_post_user_type', post_id, user_id, interaction_type_id, unique=True),
        Index('idx_post_type', post_id, interaction_type_id),
    )

    post = relationship("Post", back_populates="interactions")


class CommentInteraction(BaseInteraction):
    __tablename__ = "comment_interactions"

    comment_id = Column(Integer, ForeignKey("comments.comment_id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        Index('idx_comment_user_type', comment_id, user_id, interaction_type_id, unique=True),
        Index('idx_comment_type', comment_id, interaction_type_id),
    )

    comment = relationship("Comment", back_populates="interactions")


class InteractionType(Base):
    """Generic interaction type that can be used for both posts and comments"""
    __tablename__ = "interaction_types"

    interaction_type_id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer)
    allowed_targets = Column(JSON)  # List of target types this interaction is valid for
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    interactions = relationship("BaseInteraction", back_populates="interaction_type")