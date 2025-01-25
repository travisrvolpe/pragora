# datamodels/post_datamodels.py
from sqlalchemy import Table, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.database import Base

# Association Table for Many-to-Many Relationship (Post Tags)
post_tags = Table(
    'post_tags',
    Base.metadata,
    Column('post_id', Integer, ForeignKey('posts.post_id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.tag_id', ondelete='CASCADE'), primary_key=True)
)

class Post(Base):
    __tablename__ = "posts"

    post_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    title = Column(String)
    subtitle = Column(String)
    content = Column(Text, nullable=False)
    image_url = Column(Text)
    caption = Column(Text)
    video_url = Column(Text)
    post_type_id = Column(Integer, ForeignKey("post_types.post_type_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id"))
    subcategory_id = Column(Integer, ForeignKey("subcategories.subcategory_id"))
    custom_subcategory = Column(String, nullable=True)
    status = Column(String, default='active')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="posts")
    post_type = relationship("PostType", back_populates="posts")
    category = relationship("Category", back_populates="posts")
    # subcategory = relationship("Subcategory", back_populates="posts") # Removed as it was causing issues in the previous version
    tags = relationship("Tag", secondary=post_tags, back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    interactions = relationship("PostInteraction", back_populates="post", cascade="all, delete-orphan")


class Tag(Base):
    __tablename__ = "tags"

    tag_id = Column(Integer, primary_key=True)
    tag_name = Column(String, unique=True, nullable=False)

    posts = relationship("Post", secondary=post_tags, back_populates="tags")

class PostType(Base):
    __tablename__ = "post_types"

    post_type_id = Column(Integer, primary_key=True)
    post_type_name = Column(String, unique=True, nullable=False)

    posts = relationship("Post", back_populates="post_type")

class Category(Base):
    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True)
    cat_name = Column(String, unique=True, nullable=False)

    posts = relationship("Post", back_populates="category")
    subcategories = relationship("Subcategory", back_populates="category", cascade="all, delete-orphan")

class Subcategory(Base):
    __tablename__ = "subcategories"

    subcategory_id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id", ondelete="CASCADE"))

    category = relationship("Category", back_populates="subcategories")


class PostInteraction(Base):
    __tablename__ = "post_interactions"

    post_intact_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False)
    post_interaction_type_id = Column(Integer, ForeignKey("post_interaction_types.post_interaction_type_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="post_interactions")
    post = relationship("Post", back_populates="interactions")
    interaction_type = relationship("PostInteractionType", back_populates="interactions")

class PostInteractionType(Base):
    __tablename__ = "post_interaction_types"

    post_interaction_type_id = Column(Integer, primary_key=True)
    post_interaction_type_name = Column(String, unique=True, nullable=False)
    interactions = relationship("PostInteraction", back_populates="interaction_type")