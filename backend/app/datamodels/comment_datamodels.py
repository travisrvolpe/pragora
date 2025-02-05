# datamodels/comment_datamodels.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.database import Base


class Comment(Base):
    __tablename__ = "comments"

    comment_id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False)
    parent_comment_id = Column(Integer, ForeignKey("comments.comment_id", ondelete="CASCADE"), nullable=True)

    # Metrics
    like_count = Column(Integer, default=0)
    dislike_count = Column(Integer, default=0)
    replie_count = Column(Integer, default=0)
    report_count = Column(Integer, default=0)

    # Status and timestamps
    is_edited = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")
    # TODO ADD REPLIES
    #replies = relationship("Comment",
    #                       backref="parent",
    #                       remote_side=[comment_id],
    #                       cascade="all, delete-orphan")
    interactions = relationship("CommentInteraction", back_populates="comment", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_comments_user_id", user_id),
        Index("ix_comments_post_id", post_id),
        Index("ix_comments_parent_id", parent_comment_id),
    )