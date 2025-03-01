# utils/database_utils.py
import asyncio

from sqlalchemy.orm import sessionmaker

from app.RedisCache import get_cache
from app.datamodels.datamodels import User
from database.database import engine
from app.datamodels.post_datamodels import Category, Subcategory, PostType, Post
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
             "subcategories": ["Health & Wellness", "Mental Health", "Fitness & Physical Health", "Personal Growth",
                               "Skill Development", "Mindfulness & Meditation", "Productivity & Time Management",
                               "Relationships & Social Skills", "Financial Well-being", "Parenting & Family",
                               "Education & Learning", "Life Hacks", "Meal Planning"]},
            {"name": "Home & Habitat",
             "subcategories": ["Home Design", "Gardening & Landscaping", "DIY", "Smart Homes",
                               "Organization & Decluttering", "Eco-Friendly Practices", "Home Cooking",
                               "Fashion & Style", "Real Estate & Housing Markets"]},
            {"name": "Nature & Environment",
             "subcategories": ["Pets & Wildlife", "Resource Conservation", "Environmental Stewardship",
                               "Outdoor Activities", "Disaster Resilience", "Natural Phenomena",
                               "Urban Nature", "Agriculture", "Forestry"]},
            {"name": "Science & Technology",
             "subcategories": ["Physics", "Chemistry", "Biology", "Computer Science", "Engineering",
                               "Space Exploration", "Healthcare & Medical Advancements",
                               "Emerging Technologies & Future Trends", "Systems Theory", "Digital Technology",
                               "Social Sciences", "Citizen Science", "Data Science & Machine Learning",
                               "Energy Technologies", "Autonomous Technologies & Artificial Intelligence"]},
            {"name": "Philosophy",
             "subcategories": ["Ethics", "Metaphysics", "Logic & Critical Thinking", "Epistemology",
                               "Philosophy of Mind", "Political Philosophy", "Aesthetics",
                               "Philosophical Systems & Schools"]},
            {"name": "Economics & Business",
             "subcategories": ["Finance", "Entrepreneurship", "Career Development", "Market Trends",
                               "Economic Theory", "Budgeting & Retirement Planning", "Business Ethics & Responsibility",
                               "Small Business Management", "Global Trade & Supply Chains", "Investing",
                               "Cooperatives"]},
            {"name": "Society & Culture",
             "subcategories": ["Politics", "History", "Anthropology", "Arts & Literature",
                               "Languages & Linguistics", "Religion & Spirituality", "Cultural Traditions",
                               "Food & Cuisine", "Migration & Demographics", "Civilization Growth & Decline"]},
            {"name": "Civic Engagement",
             "subcategories": ["Volunteerism", "Governance", "Community Development", "Civic Advocacy",
                               "Economic Opportunity Initiatives", "Public Policy", "Global Citizenship"]},
            {"name": "Entertainment & Leisure",
             "subcategories": ["Pop Culture", "Media", "Gaming", "Music", "Film & Television",
                               "Sports & Recreation", "Creative Arts", "Travel & Exploration",
                               "Hobbies & Collecting", "Live Events & Performances"]},
            {"name": "Miscellaneous", "subcategories": []}
        ]

        for cat_data in categories_data:
            category = db.query(Category).filter(Category.cat_name == cat_data["name"]).first()
            if not category:
                category = Category(cat_name=cat_data["name"])
                db.add(category)
                db.flush()

                for sub_name in cat_data["subcategories"]:
                    # Check if subcategory already exists for this category
                    existing_subcategory = db.query(Subcategory).filter(
                        Subcategory.name == sub_name,
                        Subcategory.category_id == category.category_id
                    ).first()

                    if not existing_subcategory:
                        subcategory = Subcategory(name=sub_name, category_id=category.category_id)
                        db.add(subcategory)
            else:
                # Category exists, check and add missing subcategories
                for sub_name in cat_data["subcategories"]:
                    existing_subcategory = db.query(Subcategory).filter(
                        Subcategory.name == sub_name,
                        Subcategory.category_id == category.category_id
                    ).first()

                    if not existing_subcategory:
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


async def sync_saved_posts(db: Session = None):
    """Sync saved_posts table with save interactions and vice versa"""
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        # Get save interaction type
        save_type = db.query(InteractionType).filter(
            InteractionType.interaction_type_name == "save"
        ).first()

        if not save_type:
            logger.warning("Save interaction type not found, skipping saved posts sync")
            return

        # Get all users
        users = db.query(User).all()
        sync_count = 0

        for user in users:
            # Get saved_posts relationship
            saved_posts = set(user.saved_posts)
            saved_post_ids = {post.post_id for post in saved_posts}

            # Get save interactions
            saved_interactions = db.query(PostInteraction).filter(
                PostInteraction.user_id == user.user_id,
                PostInteraction.interaction_type_id == save_type.interaction_type_id
            ).all()

            saved_interaction_post_ids = {interaction.post_id for interaction in saved_interactions}

            # Find posts in saved_posts but not in interactions
            posts_to_add_interaction = saved_post_ids - saved_interaction_post_ids

            # Find posts in interactions but not in saved_posts
            posts_to_add_relationship = saved_interaction_post_ids - saved_post_ids

            made_changes = False

            # Add missing interactions
            for post_id in posts_to_add_interaction:
                post = db.query(Post).get(post_id)
                if post:
                    new_interaction = PostInteraction(
                        post_id=post_id,
                        user_id=user.user_id,
                        interaction_type_id=save_type.interaction_type_id,
                        target_type="POST"
                    )
                    db.add(new_interaction)
                    made_changes = True
                    sync_count += 1
                    logger.info(f"Added save interaction for user {user.user_id}, post {post_id}")

            # Add missing relationships
            for post_id in posts_to_add_relationship:
                post = db.query(Post).get(post_id)
                if post and post not in user.saved_posts:
                    user.saved_posts.append(post)
                    made_changes = True
                    sync_count += 1
                    logger.info(f"Added saved_posts relationship for user {user.user_id}, post {post_id}")

            # Commit changes for this user if any were made
            if made_changes:
                db.commit()

        logger.info(f"Saved posts synchronization completed successfully. Synced {sync_count} items")
        return sync_count

    except Exception as e:
        db.rollback()
        logger.error(f"Error synchronizing saved posts: {str(e)}")
        raise
    finally:
        if close_db:
            db.close()


async def periodic_sync_saved_posts():
    """Periodic task to sync saved_posts table with save interactions"""
    # Use a global flag or Redis lock to prevent multiple instances
    sync_task_running_key = "sync_task_running"
    cache = get_cache()

    try:
        # Try to set a lock
        lock_acquired = await cache.redis.set(sync_task_running_key, "1", nx=True, ex=3600)
        if not lock_acquired:
            logger.info("Sync task already running, skipping this instance")
            return

        logger.info("Starting periodic saved posts sync task")
        while True:
            try:
                count = await sync_saved_posts()
                logger.info(f"Periodic sync completed, synced {count} items")
                # Run every hour
                await asyncio.sleep(3600)
            except Exception as e:
                logger.error(f"Error in periodic saved posts sync: {str(e)}")
                # Wait 5 minutes on error then retry
                await asyncio.sleep(300)
    finally:
        # Release the lock when done
        await cache.redis.delete(sync_task_running_key)

# TODO modify your periodic sync task to be more resilient to application restarts.
# Currently, if the application restarts, the task gets cancelled but might leave the database in an inconsistent state.
# Consider adding checkpoints or transaction savepoints.