from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional
from app.datamodels.post_datamodels import Post, PostInteraction
from app.schemas.post_schemas import PostMetricsUpdate


async def update_interaction_and_metrics(db, post_id, user_id, interaction_type, interaction_value):
    try:
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # Get or create interaction
        interaction = db.query(PostInteraction).filter(
            PostInteraction.user_id == user_id,
            PostInteraction.post_id == post_id
        ).first()

        if not interaction:
            interaction = PostInteraction(
                user_id=user_id,
                post_id=post_id
            )
            db.add(interaction)

        # Update interaction state
        current_state = getattr(interaction, interaction_type)
        setattr(interaction, interaction_type, not current_state)

        # Update metric count
        metric_field = f"{interaction_type}s_count"
        if current_state:
            setattr(post, metric_field, getattr(post, metric_field) - 1)
        else:
            setattr(post, metric_field, getattr(post, metric_field) + 1)

        db.commit()

        return {
            "message": f"Post {interaction_type} updated successfully",
            f"{interaction_type}d": not current_state,
            f"{interaction_type}s_count": getattr(post, metric_field)
        }

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


async def like_post(db: Session, post_id: int, user_id: int):
    """Handle post likes and unlikes"""
    return await update_interaction_and_metrics(
        db,
        post_id,
        user_id,
        "like",
        True,
        "dislike"  # Remove dislike when liking
    )


async def dislike_post(db: Session, post_id: int, user_id: int):
    """Handle post dislikes and undislikes"""
    return await update_interaction_and_metrics(
        db,
        post_id,
        user_id,
        "dislike",
        True,
        "like"  # Remove like when disliking
    )


async def save_post(db: Session, post_id: int, user_id: int):
    """Handle post saves and unsaves"""
    return await update_interaction_and_metrics(
        db,
        post_id,
        user_id,
        "save",
        True
    )


async def report_post(db: Session, post_id: int, user_id: int, reason: str):
    """Handle post reports"""
    try:
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # Check for existing report
        existing_report = db.query(PostInteraction).filter(
            PostInteraction.user_id == user_id,
            PostInteraction.post_id == post_id,
            PostInteraction.reported == True
        ).first()

        if existing_report:
            raise HTTPException(status_code=400, detail="You have already reported this post")

        # Create report interaction
        interaction = PostInteraction(
            user_id=user_id,
            post_id=post_id,
            reported=True,
            report_reason=reason
        )
        db.add(interaction)

        # Increment report count
        post.reports_count = (post.reports_count or 0) + 1

        db.commit()
        db.refresh(post)

        return {
            "message": "Post reported successfully",
            "reports_count": post.reports_count
        }

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


async def share_post(db: Session, post_id: int, user_id: int):
    """Handle post shares"""
    try:
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # Create share interaction
        interaction = PostInteraction(
            user_id=user_id,
            post_id=post_id,
            shared=True
        )
        db.add(interaction)

        # Increment share count
        post.shares_count = (post.shares_count or 0) + 1

        db.commit()
        db.refresh(post)

        return {
            "message": "Post shared successfully",
            "shares_count": post.shares_count
        }

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


async def update_post_metrics(db: Session, post_id: int, user_id: int, metrics: PostMetricsUpdate):
    """Update multiple metrics at once"""
    try:
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        metrics_dict = metrics.dict(exclude_unset=True)
        updates = {}

        for key, value in metrics_dict.items():
            metric_field = f"{key}_count"
            if hasattr(post, metric_field):
                current_value = getattr(post, metric_field) or 0
                setattr(post, metric_field, max(0, current_value + value))
                updates[metric_field] = getattr(post, metric_field)

        db.commit()
        db.refresh(post)

        return {
            "message": "Metrics updated successfully",
            "updates": updates
        }

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))