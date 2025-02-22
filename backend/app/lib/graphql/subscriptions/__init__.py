# app/lib/graphql/subscriptions/__init__.py
from typing import AsyncGenerator
from database.database import SessionLocal
from app.services.comment_service import CommentService
from .comments import CommentSubscriptions

# Create global instances
comment_subscriptions = CommentSubscriptions()

async def get_comment_service():
    """Get a database session and comment service instance"""
    db = SessionLocal()
    try:
        yield CommentService(db)
    finally:
        db.close()

# Export subscription handlers that combine service and subscription logic
async def comment_added_subscription(post_id: int) -> AsyncGenerator:
    """Subscription for new comments"""
    async for service in get_comment_service():
        async for comment in comment_subscriptions.comment_added(None, post_id):
            # Enrich comment data with latest DB state if needed
            yield await service.get_comment(comment.comment_id)

async def comment_updated_subscription(post_id: int) -> AsyncGenerator:
    """Subscription for comment updates"""
    async for service in get_comment_service():
        async for comment in comment_subscriptions.comment_updated(None, post_id):
            yield await service.get_comment(comment.comment_id)

async def comment_deleted_subscription(post_id: int) -> AsyncGenerator:
    """Subscription for deleted comments"""
    async for service in get_comment_service():
        async for comment_id in comment_subscriptions.comment_deleted(None, post_id):
            yield comment_id

async def comment_activity_subscription(post_id: int) -> AsyncGenerator:
    """Subscription for comment activity"""
    async for service in get_comment_service():
        async for activity in comment_subscriptions.comment_activity(None, post_id):
            # Enrich activity data if needed
            yield activity

__all__ = [
    'comment_subscriptions',
    'comment_added_subscription',
    'comment_updated_subscription',
    'comment_deleted_subscription',
    'comment_activity_subscription'
]