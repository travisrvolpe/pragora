# datamodels/comment_datamodels.py
from sqlalchemy import Integer, String, DateTime, ForeignKey, Text, Boolean, Index, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, validates, backref
from database.database import Base
from sqlalchemy.sql.schema import Column

class Comment(Base):
    __tablename__ = "comments"

    comment_id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False)

    # Enhanced threading support
    parent_comment_id = Column(Integer, ForeignKey("comments.comment_id", ondelete="CASCADE"), nullable=True)
    root_comment_id = Column(Integer, ForeignKey("comments.comment_id"), nullable=True)
    path = Column(String, nullable=False)  # Materialized path for efficient tree traversal
    depth = Column(Integer, default=0)  # Nesting level


    # Metrics
    like_count = Column(Integer, default=0)
    dislike_count = Column(Integer, default=0)
    reply_count = Column(Integer, default=0)
    report_count = Column(Integer, default=0)

    # Real-time tracking
    last_activity = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    active_viewers = Column(Integer, default=0)

    # Status and timestamps
    is_edited = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    edit_history = Column(JSON, nullable=True)  # Store edit history
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")
    replies = relationship(
        "Comment",
        backref=backref(
            "parent",
            remote_side="[Comment.comment_id]"
        ),
        foreign_keys="[Comment.parent_comment_id]",
        cascade="all, delete-orphan",
        lazy='select'
    )

    root_comment = relationship(
        "Comment",
        foreign_keys="[Comment.root_comment_id]",
        remote_side="[Comment.comment_id]",
        backref="child_comments"
    )

    interactions = relationship(
        "CommentInteraction",
        back_populates="comment",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_comments_user_id", user_id),
        Index("ix_comments_post_id", post_id),
        Index("ix_comments_parent_id", parent_comment_id),
        Index("ix_comments_path", path),  # Index for path queries
        Index("ix_comments_root_id", root_comment_id),  # Index for root comment queries
    )

    @validates('path')
    def validate_path(self, key, path):
        """Ensure path follows the correct format (e.g., '1.2.3')"""
        if not path:
            return '0'  # Root level comment
        return path

    def update_reply_count(self, session):
        """Update reply count and propagate changes up the chain"""
        if self.parent_comment_id:
            parent = session.query(Comment).get(self.parent_comment_id)
            if parent:
                parent.reply_count = len(parent.replies)
                parent.update_reply_count(session)