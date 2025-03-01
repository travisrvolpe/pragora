# app/routes/post_engagement_routes.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy import func, and_
from sqlalchemy.orm import Session
from typing import Optional
#import logging
from app.core.logger import get_logger
from app.datamodels.datamodels import User
from app.datamodels.interaction_datamodels import PostInteraction, InteractionType
from app.datamodels.post_datamodels import Post
from app.utils.database_utils import get_db
from app.schemas.post_schemas import PostMetricsUpdate
from app.auth.utils import get_current_user
from app.schemas.schemas import UserResponse
from app.services.post_engagement_service import PostEngagementService
from app.RedisCache import get_cache
from app.core.exceptions import (
    PostEngagementError,
    PostNotFoundError,
    InvalidInteractionTypeError,
    DatabaseError,
    CacheError
)
from app.core.logger import get_logger
from database.database import SessionLocal

# Then at module level:
logger = get_logger(__name__)

router = APIRouter(prefix="/posts/engagement", tags=["post-engagements"])

@router.get("/{post_id}/counts", response_model=dict)
async def get_post_counts(
    post_id: int,
    db: Session = Depends(get_db)
):
    """Debug endpoint to verify post counts"""
    # Get post counts from Post table
    post = db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Get actual counts from interactions table
    actual_counts = (
        db.query(
            InteractionType.interaction_type_name,
            func.count(PostInteraction.interaction_id).label('count')
        )
        .join(PostInteraction)
        .filter(PostInteraction.post_id == post_id)
        .group_by(InteractionType.interaction_type_name)
        .all()
    )

    print(f"Debug - Post {post_id} counts:")
    print(f"Stored in posts table:", {
        'like_count': post.like_count,
        'dislike_count': post.dislike_count,
        'save_count': post.save_count,
        'share_count': post.share_count,
        'report_count': post.report_count
    })
    print(f"Actual interaction counts:", {name: count for name, count in actual_counts})

    return {
        "stored_counts": {
            'like_count': post.like_count,
            'dislike_count': post.dislike_count,
            'save_count': post.save_count,
            'share_count': post.share_count,
            'report_count': post.report_count
        },
        "actual_counts": {
            name: count for name, count in actual_counts
        }
    }


def get_engagement_service(
        db: Session = Depends(get_db),
        cache=Depends(get_cache)
) -> PostEngagementService:
    return PostEngagementService(db, cache)


@router.options("/{post_id}/like")
@router.options("/{post_id}/dislike")
@router.options("/{post_id}/save")
@router.options("/{post_id}/share")
@router.options("/{post_id}/report")
async def engagement_options():
    """Handle CORS preflight requests for engagement endpoints"""
    return {"message": "OK"}


@router.post("/{post_id}/like")
async def like_post(
        post_id: int,
        background_tasks: BackgroundTasks,
        current_user: UserResponse = Depends(get_current_user),
        service: PostEngagementService = Depends(get_engagement_service)
):
    """
    Like or unlike a post

    Args:
        post_id: ID of the post to like/unlike
        background_tasks: FastAPI background tasks handler
        current_user: Currently authenticated user
        service: Post engagement service instance

    Returns:
        Dict containing updated like status and count
    """
    try:
        return await service.like_post(
            post_id=post_id,
            user_id=current_user.user_id,
            background_tasks=background_tasks
        )
    except PostEngagementError as e:
        # Re-raise service-specific exceptions
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in like_post: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@router.post("/{post_id}/dislike")
async def dislike_post(
        post_id: int,
        background_tasks: BackgroundTasks,
        current_user: UserResponse = Depends(get_current_user),
        service: PostEngagementService = Depends(get_engagement_service)
):
    """
    Dislike or remove dislike from a post

    Args:
        post_id: ID of the post to dislike/un-dislike
        background_tasks: FastAPI background tasks handler
        current_user: Currently authenticated user
        service: Post engagement service instance

    Returns:
        Dict containing updated dislike status and count
    """
    try:
        return await service.dislike_post(
            post_id=post_id,
            user_id=current_user.user_id,
            background_tasks=background_tasks
        )
    except PostEngagementError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in dislike_post: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


# We'll create this as a standalone function outside of any existing transaction
@router.post("/{post_id}/save")
async def save_post(
        post_id: int,
        background_tasks: BackgroundTasks,
        current_user: UserResponse = Depends(get_current_user)
):
    """
    Save or unsave a post with handling for unique constraint violations
    """
    logger.info(f"Starting save operation for post {post_id}, user {current_user.user_id}")

    # Create a completely new database connection
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker
    from database.database import DATABASE_URL

    # Create a dedicated connection
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    NewSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = NewSessionLocal()

    try:
        # First, check if the interaction already exists without starting a transaction
        save_type = db.query(InteractionType).filter(
            InteractionType.interaction_type_name == "save"
        ).first()

        if not save_type:
            logger.error("Save interaction type not found")
            raise HTTPException(status_code=500, detail="Save interaction type not found")

        # Check current save state
        existing_interaction = db.query(PostInteraction).filter(
            PostInteraction.post_id == post_id,
            PostInteraction.user_id == current_user.user_id,
            PostInteraction.interaction_type_id == save_type.interaction_type_id
        ).first()

        # Get the user and their saved posts
        user = db.query(User).filter(User.user_id == current_user.user_id).first()
        if not user:
            logger.error(f"User {current_user.user_id} not found")
            raise HTTPException(status_code=404, detail="User not found")

        # Check if post exists
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            logger.error(f"Post {post_id} not found")
            raise HTTPException(status_code=404, detail="Post not found")

        # Check if post is in saved_posts
        is_in_saved_posts = False
        for saved_post in user.saved_posts:
            if saved_post.post_id == post_id:
                is_in_saved_posts = True
                break

        # Get current count
        current_count = post.save_count or 0

        logger.info(
            f"Current state: existing_interaction={existing_interaction is not None}, in_saved_posts={is_in_saved_posts}, count={current_count}")

        # Close this session and start a fresh one for the transaction
        db.close()
        db = NewSessionLocal()

        # Start a transaction
        db.begin()

        try:
            # We'll use raw SQL for critical operations to have more control
            if existing_interaction or is_in_saved_posts:
                # REMOVE - User already saved the post, so remove it
                logger.info(f"Removing save for post {post_id}")

                # 1. Delete from post_interactions using safe parameterized query
                db.execute(
                    text(
                        "DELETE FROM post_interactions WHERE post_id = :post_id AND user_id = :user_id AND interaction_type_id = :interaction_type_id"),
                    {
                        "post_id": post_id,
                        "user_id": current_user.user_id,
                        "interaction_type_id": save_type.interaction_type_id
                    }
                )

                # 2. Delete from saved_posts
                db.execute(
                    text("DELETE FROM saved_posts WHERE post_id = :post_id AND user_id = :user_id"),
                    {
                        "post_id": post_id,
                        "user_id": current_user.user_id
                    }
                )

                # 3. Update the post's save_count safely
                db.execute(
                    text("UPDATE posts SET save_count = GREATEST(0, save_count - 1) WHERE post_id = :post_id"),
                    {"post_id": post_id}
                )

                action = "removed"
                is_active = False

            else:
                # ADD - User hasn't saved the post, so add it
                logger.info(f"Adding save for post {post_id}")

                # 1. Safely insert into post_interactions with conflict handling
                db.execute(
                    text("""
                    INSERT INTO post_interactions (post_id, user_id, interaction_type_id, target_type) 
                    VALUES (:post_id, :user_id, :interaction_type_id, 'POST')
                    ON CONFLICT (post_id, user_id, interaction_type_id) DO NOTHING
                    """),
                    {
                        "post_id": post_id,
                        "user_id": current_user.user_id,
                        "interaction_type_id": save_type.interaction_type_id
                    }
                )

                # 2. Safely insert into saved_posts
                db.execute(
                    text("""
                    INSERT INTO saved_posts (user_id, post_id)
                    VALUES (:user_id, :post_id)
                    ON CONFLICT (user_id, post_id) DO NOTHING
                    """),
                    {
                        "user_id": current_user.user_id,
                        "post_id": post_id
                    }
                )

                # 3. Update the post's save_count safely
                db.execute(
                    text("UPDATE posts SET save_count = save_count + 1 WHERE post_id = :post_id"),
                    {"post_id": post_id}
                )

                action = "added"
                is_active = True

            # Commit transaction
            db.commit()
            logger.info(f"Successfully committed changes. Save {action}.")

        except Exception as e:
            # Rollback on error
            db.rollback()
            logger.error(f"Error in save transaction: {str(e)}")
            raise

        # Get fresh post data for the response
        post = db.query(Post).filter(Post.post_id == post_id).first()
        new_count = post.save_count or 0

        # Update cache in background
        cache = get_cache()
        cache_key = f"post:{post_id}:counts"
        background_tasks.add_task(cache.delete, cache_key)

        # Build response
        result = {
            "message": f"save {action} successfully",
            "save_count": new_count,
            "save": is_active,
            "metrics": {
                "like_count": post.like_count or 0,
                "dislike_count": post.dislike_count or 0,
                "save_count": new_count,
                "share_count": post.share_count or 0,
                "comment_count": post.comment_count or 0,
                "report_count": post.report_count or 0
            }
        }

        logger.info(f"Save operation completed successfully: {action}, new count: {new_count}")
        return result

    except HTTPException:
        # Re-raise HTTP exceptions directly
        raise
    except Exception as e:
        logger.error(f"Unexpected error in save_post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing save: {str(e)}")
    finally:
        # Always close the database connection
        db.close()


'''
@router.post("/{post_id}/save")
async def save_post(
        post_id: int,
        background_tasks: BackgroundTasks,
        current_user: UserResponse = Depends(get_current_user)
):
    """
    Save or unsave a post with robust transaction handling
    """
    # Create a completely separate, isolated database session for this request
    isolated_db = SessionLocal()

    try:
        logger.info(f"Processing save request for post {post_id}, user {current_user.user_id}")

        # Get save interaction type without transaction
        save_type = isolated_db.query(InteractionType).filter(
            InteractionType.interaction_type_name == "save"
        ).first()

        if not save_type:
            logger.error("Save interaction type not found")
            raise HTTPException(status_code=500, detail="Save interaction type not found")

        # Check if post exists without transaction
        post = isolated_db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            logger.error(f"Post {post_id} not found")
            raise HTTPException(status_code=404, detail="Post not found")

        # Get user without transaction
        user = isolated_db.query(User).filter(User.user_id == current_user.user_id).first()
        if not user:
            logger.error(f"User {current_user.user_id} not found")
            raise HTTPException(status_code=404, detail="User not found")

        # Check for existing interaction without transaction
        existing = isolated_db.query(PostInteraction).filter(
            PostInteraction.post_id == post_id,
            PostInteraction.user_id == current_user.user_id,
            PostInteraction.interaction_type_id == save_type.interaction_type_id
        ).first()

        # Check if post is in saved_posts without transaction
        is_in_saved_posts = False
        for saved_post in user.saved_posts:
            if saved_post.post_id == post_id:
                is_in_saved_posts = True
                break

        # Get current count
        current_count = post.save_count or 0

        logger.info(
            f"Current state: existing={existing is not None}, in_saved_posts={is_in_saved_posts}, count={current_count}")

        # Now, explicitly begin a transaction for the modifications
        isolated_db.begin()

        # Reload objects with lock to ensure consistency
        post = isolated_db.query(Post).filter(Post.post_id == post_id).with_for_update().first()
        user = isolated_db.query(User).filter(User.user_id == current_user.user_id).with_for_update().first()

        try:
            if existing or is_in_saved_posts:
                # REMOVE save
                logger.info(f"Removing save for post {post_id}, user {current_user.user_id}")

                if existing:
                    isolated_db.delete(existing)

                if is_in_saved_posts:
                    for saved_post in list(user.saved_posts):
                        if saved_post.post_id == post_id:
                            user.saved_posts.remove(saved_post)
                            break

                # Update count
                new_count = max(0, current_count - 1)
                post.save_count = new_count
                action = "removed"
                is_active = False
            else:
                # ADD save
                logger.info(f"Adding save for post {post_id}, user {current_user.user_id}")

                new_interaction = PostInteraction(
                    post_id=post_id,
                    user_id=current_user.user_id,
                    interaction_type_id=save_type.interaction_type_id,
                    target_type="POST"
                )
                isolated_db.add(new_interaction)

                post = isolated_db.merge(post)  # Ensure post is attached to session
                user.saved_posts.append(post)

                # Update count
                new_count = current_count + 1
                post.save_count = new_count
                action = "added"
                is_active = True

            # Commit the transaction
            isolated_db.commit()
            logger.info(f"Successfully {action} save for post {post_id}, new count: {new_count}")

            # Update cache in background to avoid delaying response
            cache = get_cache()
            cache_key = f"post:{post_id}:counts"

            background_tasks.add_task(cache.delete, cache_key)

            # Collect updated metrics without transaction
            fresh_counts = {}
            interaction_types = ["like", "dislike", "save", "share", "report", "comment"]

            for interaction_name in interaction_types:
                count_key = f"{interaction_name}_count"
                if interaction_name == "save":
                    fresh_counts[count_key] = new_count
                else:
                    actual_count = getattr(post, count_key, 0)
                    fresh_counts[count_key] = actual_count

            # Return result
            return {
                "message": f"save {action} successfully",
                "save_count": new_count,
                "save": is_active,
                "metrics": fresh_counts
            }

        except Exception as e:
            # Roll back transaction on error
            isolated_db.rollback()
            logger.error(f"Error in save transaction: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing save: {str(e)}")

    except HTTPException:
        # Re-raise HTTP exceptions without modification
        raise
    except Exception as e:
        # Log and convert other exceptions
        logger.error(f"Unexpected error in save_post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing save: {str(e)}")
    finally:
        # Always close the session
        if isolated_db:
            isolated_db.close()
            logger.info(f"Closed isolated database session for save operation")'''


@router.post("/{post_id}/share")
async def share_post(
        post_id: int,
        background_tasks: BackgroundTasks,
        current_user: UserResponse = Depends(get_current_user),
        service: PostEngagementService = Depends(get_engagement_service)
):
    """
    Record a post share

    Args:
        post_id: ID of the shared post
        background_tasks: FastAPI background tasks handler
        current_user: Currently authenticated user
        service: Post engagement service instance

    Returns:
        Dict containing updated share count
    """
    try:
        return await service.share_post(
            post_id=post_id,
            user_id=current_user.user_id,
            background_tasks=background_tasks
        )
    except PostEngagementError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in share_post: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@router.post("/{post_id}/report")
async def report_post(
        post_id: int,
        reason: str,
        background_tasks: BackgroundTasks,
        current_user: UserResponse = Depends(get_current_user),
        service: PostEngagementService = Depends(get_engagement_service)
):
    """
    Report a post

    Args:
        post_id: ID of the post to report
        reason: Reason for reporting
        background_tasks: FastAPI background tasks handler
        current_user: Currently authenticated user
        service: Post engagement service instance

    Returns:
        Dict containing report status
    """
    try:
        return await service.report_post(
            post_id=post_id,
            user_id=current_user.user_id,
            reason=reason,
            background_tasks=background_tasks
        )
    except PostEngagementError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in report_post: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@router.post("/{post_id}/metrics")
async def update_metrics(
        post_id: int,
        background_tasks: BackgroundTasks,
        metrics: PostMetricsUpdate,
        current_user: UserResponse = Depends(get_current_user),
        service: PostEngagementService = Depends(get_engagement_service),
        db: Session = Depends(get_db)
):
    """
    Update multiple metrics for a post

    Args:
        post_id: ID of the post
        background_tasks: FastAPI background tasks handler
        metrics: Metrics to update
        current_user: Currently authenticated user
        service: Post engagement service instance
        db: Database session

    Returns:
        Dict containing updated metrics
    """
    try:
        return await service.update_post_metrics(
            db=db,
            post_id=post_id,
            user_id=current_user.user_id,
            background_tasks=background_tasks,
            metrics=metrics
        )
    except PostEngagementError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in update_metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@router.get("/{post_id}/debug")
async def debug_post_interactions(
        post_id: int,
        db: Session = Depends(get_db)
):
    """Debug endpoint to check post interaction state"""
    try:
        # Get post
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # Get actual interaction counts
        counts = (
            db.query(
                InteractionType.interaction_type_name,
                func.count(PostInteraction.interaction_id)
            )
            .outerjoin(PostInteraction, and_(
                PostInteraction.interaction_type_id == InteractionType.interaction_type_id,
                PostInteraction.post_id == post_id
            ))
            .group_by(InteractionType.interaction_type_name)
            .all()
        )

        return {
            "stored_counts": {
                "like_count": post.like_count,
                "dislike_count": post.dislike_count,
                "save_count": post.save_count,
                "share_count": post.share_count,
                "report_count": post.report_count
            },
            "actual_counts": {
                name: count for name, count in counts
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))