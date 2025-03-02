# datamodels/community_note_model.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text, Boolean, Table
from sqlalchemy.orm import relationship
from database.database import Base
from sqlalchemy.sql import func

# Association table for Community Note ratings
community_note_ratings = Table(
    'community_note_ratings',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.user_id', ondelete='CASCADE'), primary_key=True),
    Column('note_id', Integer, ForeignKey('community_notes.note_id', ondelete='CASCADE'), primary_key=True),
    Column('helpful', Boolean, default=True),
    Column('created_at', DateTime(timezone=True), server_default=func.now())
)


class CommunityNote(Base):
    __tablename__ = "community_notes"

    note_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"))

    # Note Content
    note_text = Column(Text, nullable=False)
    evidence_links = Column(JSON)  # Links to supporting evidence

    # Note Metadata
    status = Column(String, default="pending")  # pending, approved, rejected
    helpfulness_score = Column(Float, default=0.0)  # Score based on community ratings
    helpful_count = Column(Integer, default=0)
    not_helpful_count = Column(Integer, default=0)

    # Impact on post analysis
    impact_weight = Column(Float, default=1.0)  # How much this note affects post analysis

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Flag fields
    is_source_citation = Column(Boolean, default=False)  # Note provides original source
    is_fact_check = Column(Boolean, default=False)  # Note is a fact check
    is_context_addition = Column(Boolean, default=False)  # Note adds missing context

    # Relationships
    user = relationship("User", back_populates="community_notes")
    post = relationship("Post", back_populates="community_notes")
    rated_by = relationship("User", secondary=community_note_ratings, back_populates="rated_notes")