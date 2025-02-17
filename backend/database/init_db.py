# database/init_db.py
from sqlalchemy.orm import Session
from database.database import Base, engine, SessionLocal
from app.core.logger import logger
from app.datamodels.datamodels import User, UserProfile, Session as UserSession
from app.datamodels.post_datamodels import Post, Category, Subcategory, PostType
from app.datamodels.comment_datamodels import Comment
from app.datamodels.interaction_datamodels import (
    InteractionType,
    PostInteraction,
    CommentInteraction
)


async def init_categories(db: Session):
    """Initialize categories in the database"""
    try:
        categories_data = [
            {"name": "Self-Development",
             "subcategories": ["Health & Wellness", "Personal Growth", "Skill Development"]},
            {"name": "Home & Habitat", "subcategories": ["Home Design", "Gardening", "DIY", "Smart Homes"]},
            # ... rest of your categories
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
    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing categories: {str(e)}")
        raise


async def init_post_types(db: Session):
    """Initialize post types in the database"""
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
    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing post types: {str(e)}")
        raise


async def init_post_interaction_types(db: Session):
    """Initialize interaction types in the database"""
    try:
        interaction_types = [
            {"id": 1, "name": "like", "display_order": 1, "is_active": True},
            {"id": 2, "name": "dislike", "display_order": 2, "is_active": True},
            {"id": 3, "name": "save", "display_order": 3, "is_active": True},
            {"id": 4, "name": "share", "display_order": 4, "is_active": True},
            {"id": 5, "name": "report", "display_order": 5, "is_active": True}
        ]

        for type_data in interaction_types:
            existing = db.query(InteractionType).filter_by(interaction_type_id=type_data["id"]).first()

            if existing:
                if existing.interaction_type_name != type_data["name"]:
                    existing.interaction_type_name = type_data["name"]
            else:
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
        logger.error(f"Error initializing interaction types: {str(e)}")
        raise


async def init_db():
    """Initialize the database with tables and initial data"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)

        # Get a database session
        db = SessionLocal()
        try:
            # Initialize all required data
            await init_categories(db)
            await init_post_types(db)
            await init_post_interaction_types(db)

            logger.info("✅ Database initialized successfully")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {str(e)}")
        raise


if __name__ == "__main__":
    import asyncio

    asyncio.run(init_db())