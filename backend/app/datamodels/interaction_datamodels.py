from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Index, Enum, JSON, Sequence
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, declared_attr
from database.database import Base
from enum import Enum as PyEnum
import sqlalchemy as sa


class InteractionTargetType(str, PyEnum):
    POST = "POST"
    COMMENT = "COMMENT"


class BaseInteraction(Base):
    __abstract__ = True

    interaction_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    target_type = Column(Enum(InteractionTargetType, name="interactiontargettype",
                              create_type=False), nullable=False)
    interaction_type_id = Column(Integer, ForeignKey("interaction_types.interaction_type_id"),
                                 nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    interaction_metadata = Column(JSON, nullable=True)

    @declared_attr
    def user(cls):
        return relationship("User", back_populates=f"{cls.__tablename__}")

    @declared_attr
    def interaction_type(cls):
        return relationship("InteractionType", back_populates=f"{cls.__tablename__}")

class PostInteraction(BaseInteraction):
    reply = None
    comment = None
    report = None
    like = None
    share = None
    dislike = None
    __tablename__ = "post_interactions"

    #interaction_id = Column(
    #    Integer,
    #    Sequence('post_interactions_interaction_id_seq'),
    #    primary_key=True,
    #    nullable=False
    #)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        Index("idx_post_user_type", "post_id", "user_id", "interaction_type_id", unique=True),
        Index("idx_post_type", "post_id", "interaction_type_id"),
    )

    post = relationship("Post", back_populates="interactions")


class CommentInteraction(BaseInteraction):
    __tablename__ = "comment_interactions"

    reply = None
    report = None
    like = None
    share = None
    dislike = None

    # Override interaction_id from BaseInteraction to add sequence
    interaction_id = Column(
        Integer,
        Sequence('comment_interactions_interaction_id_seq'),
        primary_key=True,
        nullable=False
    )
    comment_id = Column(Integer, ForeignKey("comments.comment_id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        Index("idx_comment_user_type", "comment_id", "user_id", "interaction_type_id", unique=True),
        Index("idx_comment_type", "comment_id", "interaction_type_id"),
    )

    comment = relationship("Comment", back_populates="interactions")

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