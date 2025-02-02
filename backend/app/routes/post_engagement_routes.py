# routes/post_engagement_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional
from app.utils.database_utils import get_db
from app.schemas.post_schemas import PostCreate, PostResponse, PostInteractionCreate, PostMetricsUpdate, PostEngagementUpdate
from app.services import post_engagement_service
from app.auth.utils import get_current_user
from app.datamodels.datamodels import User
from app.datamodels.post_datamodels import Post, PostInteraction
router = APIRouter(prefix="/posts", tags=["post-engagements"])

@router.post("/{post_id}/metrics")
async def update_metrics(
    post_id: int,
    metrics: PostMetricsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await post_engagement_service.update_post_metrics(db, post_id, current_user.user_id, metrics)

@router.post("/{post_id}/like")
async def like_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await post_engagement_service.like_post(db, post_id, current_user.user_id)

@router.post("/{post_id}/dislike")
async def dislike_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await post_engagement_service.dislike_post(db, post_id, current_user.user_id)

@router.post("/{post_id}/save")
async def save_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await post_engagement_service.save_post(db, post_id, current_user.user_id)

@router.post("/{post_id}/report")
async def report_post(
    post_id: int,
    reason: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await post_engagement_service.report_post(db, post_id, current_user.user_id, reason)

@router.post("/{post_id}/share")
async def share_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await post_engagement_service.share_post(db, post_id, current_user.user_id)


@router.post("/{post_id}/save")
async def save_post(
        post_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    try:
        # Check if post exists
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # Check if already saved
        existing_interaction = db.query(PostInteraction).filter(
            PostInteraction.user_id == current_user.user_id,
            PostInteraction.post_id == post_id,
            PostInteraction.saved == True
        ).first()

        if existing_interaction:
            # Toggle save off
            existing_interaction.saved = False
            post.saves_count = max(0, post.saves_count - 1)
            message = "Post unsaved successfully"
        else:
            # Create new save interaction
            interaction = PostInteraction(
                user_id=current_user.user_id,
                post_id=post_id,
                saved=True
            )
            db.add(interaction)
            post.saves_count = (post.saves_count or 0) + 1
            message = "Post saved successfully"

        db.commit()
        return {"message": message, "saved": not existing_interaction}

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{post_id}/report")
async def report_post(
        post_id: int,
        reason: str,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    try:
        # Check if post exists
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # Create report interaction
        interaction = PostInteraction(
            user_id=current_user.user_id,
            post_id=post_id,
            reported=True,
            report_reason=reason  # You'll need to add this field to PostInteraction model
        )
        db.add(interaction)

        # Increment report count
        post.reports_count = (post.reports_count or 0) + 1

        db.commit()
        return {"message": "Post reported successfully"}

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{post_id}/like")
async def like_post(
        post_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    try:
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        existing_interaction = db.query(PostInteraction).filter(
            PostInteraction.user_id == current_user.user_id,
            PostInteraction.post_id == post_id
        ).first()

        if existing_interaction and existing_interaction.liked:
            # Unlike
            existing_interaction.liked = False
            post.likes_count = max(0, post.likes_count - 1)
            message = "Post unliked successfully"
        else:
            # Like
            if existing_interaction:
                existing_interaction.liked = True
                existing_interaction.disliked = False
            else:
                interaction = PostInteraction(
                    user_id=current_user.user_id,
                    post_id=post_id,
                    liked=True
                )
                db.add(interaction)

            post.likes_count = (post.likes_count or 0) + 1
            if existing_interaction and existing_interaction.disliked:
                post.dislikes_count = max(0, post.dislikes_count - 1)

            message = "Post liked successfully"

        db.commit()
        return {
            "message": message,
            "liked": not (existing_interaction and existing_interaction.liked),
            "likes_count": post.likes_count,
            "dislikes_count": post.dislikes_count
        }

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
