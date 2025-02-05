from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Import Base
from database.database import Base

# Import all models
from app.datamodels.datamodels import User, UserProfile, Session
from app.datamodels.post_datamodels import Post, Category, Subcategory, PostType
from app.datamodels.comment_datamodels import Comment
from app.datamodels.interaction_datamodels import (
    InteractionType,
    PostInteraction,
    CommentInteraction
)

DATABASE_URL = "postgresql://postgres:ugabuga22@localhost:5432/pragora"
UPLOAD_FOLDER = "./media/posts/"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_all_tables():
    Base.metadata.create_all(bind=engine)
    print("All Tables Created")

def seed_database():
    """Seeds the database with initial data (optional)."""
    db = SessionLocal()
    try:
        db.commit()
        print("Database seeded with initial data.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_all_tables()
    seed_database()
    print("Database initialized.")