# backend/app/applib/graphql/subscriptions/comments.py
import asyncio
from typing import AsyncGenerator, Optional, Dict, Any
from datetime import datetime
from strawberry.types import Info
from database.database import SessionLocal
from app.core.exceptions import DatabaseError
from strawberry.subscriptions import Subscription
from app.schemas.comment_schemas import CommentResponse
from app.services.comment_service import CommentService

class CommentSubscriptions:
    def __init__(self):
        self._subscribers: Dict[int, set] = {}  # post_id -> set of subscriber queues

    async def _broadcast_to_post(self, post_id: int, data: Any) -> None:
        """Broadcast data to all subscribers of a post"""
        if post_id in self._subscribers:
            for queue in self._subscribers[post_id]:
                await queue.put(data)

    async def _add_subscriber(self, post_id: int, queue: asyncio.Queue) -> None:
        """Add a subscriber queue for a post"""
        if post_id not in self._subscribers:
            self._subscribers[post_id] = set()
        self._subscribers[post_id].add(queue)

    async def _remove_subscriber(self, post_id: int, queue: asyncio.Queue) -> None:
        """Remove a subscriber queue from a post"""
        if post_id in self._subscribers:
            self._subscribers[post_id].discard(queue)
            if not self._subscribers[post_id]:
                del self._subscribers[post_id]

    async def comment_added(
        self,
        info: Info,
        post_id: int
    ) -> AsyncGenerator[CommentResponse, None]:
        """Subscribe to new comments on a post"""
        queue: asyncio.Queue[CommentResponse] = asyncio.Queue()
        await self._add_subscriber(post_id, queue)

        try:
            while True:
                comment = await queue.get()
                yield comment
        except asyncio.CancelledError:
            await self._remove_subscriber(post_id, queue)

    async def comment_updated(
        self,
        info: Info,
        post_id: int
    ) -> AsyncGenerator[CommentResponse, None]:
        """Subscribe to comment updates on a post"""
        queue: asyncio.Queue[CommentResponse] = asyncio.Queue()
        await self._add_subscriber(post_id, queue)

        try:
            while True:
                comment = await queue.get()
                yield comment
        except asyncio.CancelledError:
            await self._remove_subscriber(post_id, queue)

    async def comment_deleted(
        self,
        info: Info,
        post_id: int
    ) -> AsyncGenerator[str, None]:
        """Subscribe to comment deletions on a post"""
        queue: asyncio.Queue[str] = asyncio.Queue()
        await self._add_subscriber(post_id, queue)

        try:
            while True:
                comment_id = await queue.get()
                yield comment_id
        except asyncio.CancelledError:
            await self._remove_subscriber(post_id, queue)

    async def comment_activity(
        self,
        info: Info,
        post_id: int
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Subscribe to comment activity updates on a post"""
        queue: asyncio.Queue[Dict[str, Any]] = asyncio.Queue()
        await self._add_subscriber(post_id, queue)

        try:
            while True:
                activity = await queue.get()
                yield {
                    "comment_id": activity["comment_id"],
                    "active_viewers": activity["active_viewers"],
                    "last_activity": activity["last_activity"]
                }
        except asyncio.CancelledError:
            await self._remove_subscriber(post_id, queue)

    # Methods to trigger broadcasts
    async def notify_comment_added(self, post_id: int, comment: CommentResponse) -> None:
        await self._broadcast_to_post(post_id, comment)

    async def notify_comment_updated(self, post_id: int, comment: CommentResponse) -> None:
        await self._broadcast_to_post(post_id, comment)

    async def notify_comment_deleted(self, post_id: int, comment_id: str) -> None:
        await self._broadcast_to_post(post_id, comment_id)

    async def notify_comment_activity(
        self,
        post_id: int,
        comment_id: str,
        active_viewers: int,
        last_activity: datetime
    ) -> None:
        await self._broadcast_to_post(post_id, {
            "comment_id": comment_id,
            "active_viewers": active_viewers,
            "last_activity": last_activity.isoformat()
        })

# Create a global instance for use across the application
comment_subscriptions = CommentSubscriptions()