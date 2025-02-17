# utils/database_utils.py
from sqlalchemy.orm import sessionmaker
from database.database import engine
from app.datamodels.post_datamodels import Category, Subcategory, PostType
from sqlalchemy.orm import Session
#from app.datamodels.post_datamodels import PostInteractionType
from app.datamodels.interaction_datamodels import PostInteraction, InteractionType
from app.core.exceptions import DatabaseError
from app.core.logger import logger
from database.database import SessionLocal
from typing import AsyncGenerator

async def get_db() -> AsyncGenerator:
    """Dependency for getting database sessions"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def init_categories():
    db = SessionLocal()
    try:
        categories_data = [
            {"name": "Self-Development",
             "subcategories": ["Health & Wellness", "Personal Growth", "Skill Development"]},
            {"name": "Home & Habitat", "subcategories": ["Home Design", "Gardening", "DIY", "Smart Homes"]},
            {"name": "Nature & Environment", "subcategories": ["Animals", "Sustainability", "Conservation"]},
            {"name": "Science & Technology", "subcategories": ["Engineering", "AI"]},
            {"name": "Philosophy", "subcategories": ["Ethics", "Metaphysics"]},
            {"name": "Economics & Business", "subcategories": ["Finance", "Entrepreneurship"]},
            {"name": "Society & Culture", "subcategories": ["Politics", "History"]},
            {"name": "Civic Engagement", "subcategories": ["Volunteerism", "Governance"]},
            {"name": "Entertainment", "subcategories": ["Pop Culture", "Media"]},
            {"name": "Miscellaneous", "subcategories": []}
        ]

        for cat_data in categories_data:
            category = db.query(Category).filter(Category.cat_name == cat_data["name"]).first()
            if not category:
                category = Category(cat_name=cat_data["name"])
                db.add(category)
                db.flush()

                for sub_name in cat_data["subcategories"]:
                    subcategory = Subcategory(name=sub_name, category_id=category.category_id)
                    db.add(subcategory)

        db.commit()
    finally:
        db.close()


async def init_post_types():
    db = SessionLocal()
    try:
        post_types_data = [
            {"id": 1, "name": "thoughts"},
            {"id": 2, "name": "image"},
            {"id": 3, "name": "article"},
            {"id": 4, "name": "video"}
        ]

        for type_data in post_types_data:
            post_type = db.query(PostType).filter(PostType.post_type_id == type_data["id"]).first()
            if not post_type:
                post_type = PostType(
                    post_type_id=type_data["id"],
                    post_type_name=type_data["name"]
                )
                db.add(post_type)

        db.commit()
    finally:
        db.close()


async def init_post_interaction_types(db: Session):
    """Ensure interaction types are correctly seeded"""
    interaction_types = [
        {"id": 1, "name": "like", "display_order": 1, "is_active": True},
        {"id": 2, "name": "dislike", "display_order": 2, "is_active": True},
        {"id": 3, "name": "save", "display_order": 3, "is_active": True},
        {"id": 4, "name": "share", "display_order": 4, "is_active": True},
        {"id": 5, "name": "report", "display_order": 5, "is_active": True}
    ]

    try:
        for type_data in interaction_types:
            existing = db.query(InteractionType).filter_by(interaction_type_id=type_data["id"]).first()

            if existing:
                # **Fix incorrect names caused by Alembic**
                if existing.interaction_type_name != type_data["name"]:
                    existing.interaction_type_name = type_data["name"]
            else:
                # Insert new interaction type if missing
                new_type = InteractionType(
                    interaction_type_id=type_data["id"],
                    interaction_type_name=type_data["name"],
                    display_order=type_data["display_order"],
                    is_active=type_data["is_active"]
                )
                db.add(new_type)

        db.commit()

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error initializing interaction types: {str(e)}")
        raise DatabaseError("Failed to initialize interaction types")
