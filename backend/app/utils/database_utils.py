# utils/database_utils.py
import asyncio

from sqlalchemy.orm import sessionmaker

from app.RedisCache import get_cache
from app.datamodels.user_datamodels import User
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
            {"id": 1, "name": "Self-Development",
             "subcategories": [
                 {"id": 1, "name": "Health & Wellness"},
                 {"id": 2, "name": "Mental Health"},
                 {"id": 3, "name": "Fitness & Physical Health"},
                 {"id": 4, "name": "Personal Growth"},
                 {"id": 5, "name": "Skill Development"},
                 {"id": 6, "name": "Mindfulness & Meditation"},
                 {"id": 7, "name": "Productivity & Time Management"},
                 {"id": 8, "name": "Relationships & Social Skills"},
                 {"id": 9, "name": "Financial Well-being"},
                 {"id": 10, "name": "Parenting & Family"},
                 {"id": 11, "name": "Education & Learning"},
                 {"id": 12, "name": "Life Hacks"},
                 {"id": 13, "name": "Meal Planning"}
             ]},
            {"id": 2, "name": "Home & Habitat",
             "subcategories": [
                 {"id": 14, "name": "Home Design"},
                 {"id": 15, "name": "Gardening & Landscaping"},
                 {"id": 16, "name": "DIY"},
                 {"id": 17, "name": "Smart Homes"},
                 {"id": 18, "name": "Organization & Decluttering"},
                 {"id": 19, "name": "Eco-Friendly Practices"},
                 {"id": 20, "name": "Home Cooking"},
                 {"id": 21, "name": "Fashion & Style"},
                 {"id": 22, "name": "Real Estate & Housing Markets"}
             ]},
            {"id": 3, "name": "Nature & Environment",
             "subcategories": [
                 {"id": 23, "name": "Pets & Wildlife"},
                 {"id": 24, "name": "Resource Conservation"},
                 {"id": 25, "name": "Environmental Stewardship"},
                 {"id": 26, "name": "Outdoor Activities"},
                 {"id": 27, "name": "Disaster Resilience"},
                 {"id": 28, "name": "Natural Phenomena"},
                 {"id": 29, "name": "Urban Nature"},
                 {"id": 30, "name": "Agriculture"},
                 {"id": 31, "name": "Forestry"}
             ]},
            {"id": 4, "name": "Science & Technology",
             "subcategories": [
                 {"id": 32, "name": "Physics"},
                 {"id": 33, "name": "Chemistry"},
                 {"id": 34, "name": "Biology"},
                 {"id": 35, "name": "Computer Science"},
                 {"id": 36, "name": "Engineering"},
                 {"id": 37, "name": "Space Exploration"},
                 {"id": 38, "name": "Healthcare & Medical Advancements"},
                 {"id": 39, "name": "Emerging Technologies & Future Trends"},
                 {"id": 40, "name": "Systems Theory"},
                 {"id": 41, "name": "Digital Technology"},
                 {"id": 42, "name": "Social Sciences"},
                 {"id": 43, "name": "Citizen Science"},
                 {"id": 44, "name": "Data Science & Machine Learning"},
                 {"id": 45, "name": "Energy Technologies"},
                 {"id": 46, "name": "Autonomous Technologies & Artificial Intelligence"}
             ]},
            {"id": 5, "name": "Philosophy",
             "subcategories": [
                 {"id": 47, "name": "Ethics"},
                 {"id": 48, "name": "Metaphysics"},
                 {"id": 49, "name": "Logic & Critical Thinking"},
                 {"id": 50, "name": "Epistemology"},
                 {"id": 51, "name": "Philosophy of Mind"},
                 {"id": 52, "name": "Political Philosophy"},
                 {"id": 53, "name": "Aesthetics"},
                 {"id": 54, "name": "Philosophical Systems & Schools"}
             ]},
            {"id": 6, "name": "Economics & Business",
             "subcategories": [
                 {"id": 55, "name": "Finance"},
                 {"id": 56, "name": "Entrepreneurship"},
                 {"id": 57, "name": "Career Development"},
                 {"id": 58, "name": "Market Trends"},
                 {"id": 59, "name": "Economic Theory"},
                 {"id": 60, "name": "Budgeting & Retirement Planning"},
                 {"id": 61, "name": "Business Ethics & Responsibility"},
                 {"id": 62, "name": "Small Business Management"},
                 {"id": 63, "name": "Global Trade & Supply Chains"},
                 {"id": 64, "name": "Investing"},
                 {"id": 65, "name": "Cooperatives"}
             ]},
            {"id": 7, "name": "Society & Culture",
             "subcategories": [
                 {"id": 66, "name": "Politics"},
                 {"id": 67, "name": "History"},
                 {"id": 68, "name": "Anthropology"},
                 {"id": 69, "name": "Arts & Literature"},
                 {"id": 70, "name": "Languages & Linguistics"},
                 {"id": 71, "name": "Religion & Spirituality"},
                 {"id": 72, "name": "Cultural Traditions"},
                 {"id": 73, "name": "Food & Cuisine"},
                 {"id": 74, "name": "Migration & Demographics"},
                 {"id": 75, "name": "Civilization Growth & Decline"}
             ]},
            {"id": 8, "name": "Civic Engagement",
             "subcategories": [
                 {"id": 76, "name": "Volunteerism"},
                 {"id": 77, "name": "Governance"},
                 {"id": 78, "name": "Community Development"},
                 {"id": 79, "name": "Civic Advocacy"},
                 {"id": 80, "name": "Economic Opportunity Initiatives"},
                 {"id": 81, "name": "Public Policy"},
                 {"id": 82, "name": "Global Citizenship"}
             ]},
            {"id": 9, "name": "Entertainment & Leisure",
             "subcategories": [
                 {"id": 83, "name": "Pop Culture"},
                 {"id": 84, "name": "Media"},
                 {"id": 85, "name": "Gaming"},
                 {"id": 86, "name": "Music"},
                 {"id": 87, "name": "Film & Television"},
                 {"id": 88, "name": "Sports & Recreation"},
                 {"id": 89, "name": "Creative Arts"},
                 {"id": 90, "name": "Travel & Exploration"},
                 {"id": 91, "name": "Hobbies & Collecting"},
                 {"id": 92, "name": "Live Events & Performances"}
             ]},
            {"id": 10, "name": "Miscellaneous", "subcategories": []}
        ]

        for cat_data in categories_data:
            category = db.query(Category).filter(Category.category_id == cat_data["id"]).first()
            if not category:
                # Create with specific ID
                category = Category(category_id=cat_data["id"], cat_name=cat_data["name"])
                db.add(category)
                db.flush()
            else:
                # Update name if needed
                if category.cat_name != cat_data["name"]:
                    category.cat_name = cat_data["name"]
                    db.add(category)

            # Process subcategories
            for sub_data in cat_data["subcategories"]:
                subcategory = db.query(Subcategory).filter(
                    Subcategory.subcategory_id == sub_data["id"]
                ).first()

                if not subcategory:
                    # Create new subcategory with specified ID
                    subcategory = Subcategory(
                        subcategory_id=sub_data["id"],
                        name=sub_data["name"],
                        category_id=category.category_id
                    )
                    db.add(subcategory)
                else:
                    # Update existing subcategory if needed
                    if subcategory.name != sub_data["name"] or subcategory.category_id != category.category_id:
                        subcategory.name = sub_data["name"]
                        subcategory.category_id = category.category_id
                        db.add(subcategory)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error initializing categories: {str(e)}")
        raise
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


async def repair_saved_posts_database(db: Session = None):
    """One-time repair function to fix inconsistencies between saved_posts table and post_interactions"""
    print("Starting comprehensive saved posts repair...")

    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        # Get the save interaction type
        save_type = db.query(InteractionType).filter(
            InteractionType.interaction_type_name == "save"
        ).first()

        if not save_type:
            print("Save interaction type not found!")
            return

        print(f"Found save interaction type ID: {save_type.interaction_type_id}")

        # 1. First, let's fix all posts with incorrect save_count
        all_posts = db.query(Post).all()
        count_updates = 0

        for post in all_posts:
            # Get actual count from post_interactions table
            actual_count = db.query(PostInteraction).filter(
                PostInteraction.post_id == post.post_id,
                PostInteraction.interaction_type_id == save_type.interaction_type_id
            ).count()

            # Update if different
            if post.save_count != actual_count:
                print(f"Fixing post {post.post_id} save_count: {post.save_count} → {actual_count}")
                post.save_count = actual_count
                count_updates += 1

        # Commit count updates
        if count_updates > 0:
            db.commit()
            print(f"Updated save_count for {count_updates} posts")

        # 2. Now let's reconcile saved_posts relationships
        # Get all users
        users = db.query(User).all()
        relationship_updates = 0
        interaction_updates = 0

        for user in users:
            # Get saved posts from the many-to-many relationship
            saved_posts_from_relationship = set(post.post_id for post in user.saved_posts)

            # Get saved posts from post_interactions
            saved_interactions = db.query(PostInteraction).filter(
                PostInteraction.user_id == user.user_id,
                PostInteraction.interaction_type_id == save_type.interaction_type_id
            ).all()
            saved_posts_from_interactions = set(interaction.post_id for interaction in saved_interactions)

            print(
                f"User {user.user_id}: {len(saved_posts_from_relationship)} in relationship, {len(saved_posts_from_interactions)} in interactions")

            # Find discrepancies
            missing_from_relationship = saved_posts_from_interactions - saved_posts_from_relationship
            missing_from_interactions = saved_posts_from_relationship - saved_posts_from_interactions

            # Fix relationship issues
            for post_id in missing_from_relationship:
                post = db.query(Post).get(post_id)
                if post:
                    user.saved_posts.append(post)
                    relationship_updates += 1
                    print(f"Added post {post_id} to user {user.user_id}'s saved_posts relationship")

            # Fix interaction issues
            for post_id in missing_from_interactions:
                post = db.query(Post).get(post_id)
                if post:
                    new_interaction = PostInteraction(
                        user_id=user.user_id,
                        post_id=post_id,
                        interaction_type_id=save_type.interaction_type_id,
                        target_type="POST"
                    )
                    db.add(new_interaction)
                    interaction_updates += 1
                    print(f"Added save interaction for user {user.user_id}, post {post_id}")

            # Commit changes for this user
            if missing_from_relationship or missing_from_interactions:
                db.commit()

        print(
            f"✅ Repair completed: Fixed {count_updates} post counts, {relationship_updates} relationships, {interaction_updates} interactions")
        return True

    except Exception as e:
        db.rollback()
        print(f"❌ Error during repair: {str(e)}")
        return False
    finally:
        if close_db:
            db.close()

# TODO modify your periodic sync task to be more resilient to application restarts.
# Currently, if the application restarts, the task gets cancelled but might leave the database in an inconsistent state.
# Consider adding checkpoints or transaction savepoints.