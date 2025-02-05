from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Index, Enum, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, declared_attr
from database.database import Base
from enum import Enum
import sqlalchemy as sa

class InteractionTargetType(str, Enum):
    POST = "POST"  # ✅ Enum values are case-sensitive!
    COMMENT = "COMMENT"

class BaseInteraction(Base):
    __abstract__ = True

    interaction_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    #target_type = Column(Enum(InteractionTargetType), nullable=False)
    target_type = Column(sa.Enum(InteractionTargetType, name="interactiontargettype"), nullable=False)
    interaction_type_id = Column(Integer, ForeignKey("interaction_types.interaction_type_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    interaction_metadata = Column(JSON, nullable=True)

    @declared_attr
    def user(cls):
        name = "post_interactions" if cls.__name__ == "PostInteraction" else "comment_interactions"
        return relationship("User", back_populates=name)

    @declared_attr
    def interaction_type(cls):
        name = "post_interactions" if cls.__name__ == "PostInteraction" else "comment_interactions"
        return relationship("InteractionType", back_populates=name)

class PostInteraction(BaseInteraction):
    __tablename__ = "post_interactions"

    #interaction_id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column("post_id", Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        Index("idx_post_user_type", "post_id", "user_id", "interaction_type_id", unique=True),
        Index("idx_post_type", "post_id", "interaction_type_id"),
    )

    post = relationship("Post", back_populates="interactions")
    #@declared_attr
    #def post(cls):
        #return relationship("Post", back_populates="interactions")

class CommentInteraction(BaseInteraction):
    __tablename__ = "comment_interactions"

    #interaction_id = Column(Integer, primary_key=True, autoincrement=True)
    comment_id = Column("comment_id", Integer, ForeignKey("comments.comment_id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        Index("idx_comment_user_type", "comment_id", "user_id", "interaction_type_id", unique=True),
        Index("idx_comment_type", "comment_id", "interaction_type_id"),
    )

    @declared_attr
    def comment(cls):
        return relationship("Comment", back_populates="interactions")

class InteractionType(Base):
    __tablename__ = "interaction_types"

    interaction_type_id = Column(Integer, primary_key=True)
    interaction_type_name = Column(String(50), unique=True, nullable=False)  # Changed from name to interaction_type_name
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer)
    allowed_targets = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    post_interactions = relationship("PostInteraction", back_populates="interaction_type")
    comment_interactions = relationship("CommentInteraction", back_populates="interaction_type")