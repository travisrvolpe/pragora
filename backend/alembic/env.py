from logging.config import fileConfig
from sqlalchemy import create_engine
from sqlalchemy import pool
from alembic import context
import os
import sys

# Add the project root directory to the Python path
sys.path.append(os.getcwd())

# Import Base
from database.database import Base, DATABASE_URL

# Import all models that need to be included in migrations
from app.datamodels.user_datamodels import User, UserProfile, Session
from app.datamodels.post_datamodels import Post, Category, Subcategory, PostType
from app.datamodels.comment_datamodels import Comment  # Add this
from app.datamodels.interaction_datamodels import (    # Add these
    InteractionType,
    PostInteraction,
    CommentInteraction
)

# Target metadata setup
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = create_engine(DATABASE_URL)

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()