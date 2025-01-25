# datamodels/comment_datamodels.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.database import Base


class Comment(Base):
    __tablename__ = "comments"

    comment_id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")
    interactions = relationship("CommentInteraction", back_populates="comment", cascade="all, delete-orphan")

class CommentInteraction(Base):
    __tablename__ = "comment_interactions"

    comment_intact_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    comment_id = Column(Integer, ForeignKey("comments.comment_id", ondelete="CASCADE"), nullable=False)
    comment_interaction_types_id = Column(Integer, ForeignKey("comment_interaction_types.comment_interaction_types_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="comment_interactions")
    comment = relationship("Comment", back_populates="interactions")
    interaction_type = relationship("CommentInteractionType", back_populates="interactions")


class CommentInteractionType(Base):
    __tablename__ = "comment_interaction_types"

    comment_interaction_types_id = Column(Integer, primary_key=True)
    comment_interaction_types_name = Column(String, unique=True, nullable=False)
    interactions = relationship("CommentInteraction", back_populates="interaction_type")