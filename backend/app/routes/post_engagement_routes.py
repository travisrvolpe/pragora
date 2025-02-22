# app/routes/post_engagement_routes.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy import func, and_
from sqlalchemy.orm import Session
from typing import Optional
#import logging
from app.core.logger import get_logger
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


@router.post("/{post_id}/save")
async def save_post(
        post_id: int,
        background_tasks: BackgroundTasks,
        current_user: UserResponse = Depends(get_current_user),
        service: PostEngagementService = Depends(get_engagement_service)
):
    """
    Save or unsave a post

    Args:
        post_id: ID of the post to save/unsave
        background_tasks: FastAPI background tasks handler
        current_user: Currently authenticated user
        service: Post engagement service instance

    Returns:
        Dict containing updated save status and count
    """
    try:
        return await service.save_post(
            post_id=post_id,
            user_id=current_user.user_id,
            background_tasks=background_tasks
        )
    except PostEngagementError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in save_post: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


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