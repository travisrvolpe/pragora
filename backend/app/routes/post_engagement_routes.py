from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional
from app.utils.database_utils import get_db
from app.schemas.post_schemas import PostMetricsUpdate
from app.auth.utils import get_current_user
from app.datamodels.datamodels import User
from app.datamodels.post_datamodels import Post, PostInteraction
#from app.services.post_engagement_service import update_interaction_and_metrics
from app.services import post_engagement_service

router = APIRouter(prefix="/posts/engagement", tags=["post-engagements"])

@router.post("/{post_id}/like")
async def like_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Handle post likes and unlikes"""
    return await post_engagement_service.like_post(db, post_id, current_user.user_id)

@router.post("/{post_id}/dislike")
async def dislike_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Handle post dislikes and undislikes"""
    return await post_engagement_service.dislike_post(db, post_id, current_user.user_id)

@router.post("/{post_id}/save")
async def save_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Handle post saves and unsaves"""
    return await post_engagement_service.save_post(db, post_id, current_user.user_id)

@router.post("/{post_id}/share")
async def share_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Handle post shares"""
    return await post_engagement_service.share_post(db, post_id, current_user.user_id)

@router.post("/{post_id}/report")
async def report_post(
    post_id: int,
    reason: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Handle post reports"""
    return await post_engagement_service.report_post(db, post_id, current_user.user_id, reason)

@router.post("/{post_id}/metrics")
async def update_metrics(
    post_id: int,
    metrics: PostMetricsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update multiple metrics at once"""
    return await post_engagement_service.update_post_metrics(db, post_id, current_user.user_id, metrics)