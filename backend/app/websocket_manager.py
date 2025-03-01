from typing import Dict, Set, Optional, Any, AsyncGenerator
from fastapi import WebSocket, WebSocketDisconnect
import logging
import json
import asyncio
from datetime import datetime
from asyncio import Queue, CancelledError

logger = logging.getLogger(__name__)


class PubSub:
    def __init__(self):
        self._subscribers: Dict[str, Set[Queue]] = {}
        self._lock = asyncio.Lock()

    async def subscribe(self, channel: str) -> Queue:
        queue: Queue = Queue()
        async with self._lock:
            if channel not in self._subscribers:
                self._subscribers[channel] = set()
            self._subscribers[channel].add(queue)
        return queue

    async def unsubscribe(self, channel: str, queue: Queue) -> None:
        async with self._lock:
            if channel in self._subscribers:
                self._subscribers[channel].discard(queue)
                if not self._subscribers[channel]:
                    del self._subscribers[channel]

    async def publish(self, channel: str, message: Any) -> None:
        if channel not in self._subscribers:
            return

        async with self._lock:
            subscribers = self._subscribers[channel].copy()

        for queue in subscribers:
            try:
                await queue.put(message)
            except Exception as e:
                logger.error(f"Error publishing to subscriber: {str(e)}")
                await self.unsubscribe(channel, queue)


class WebSocketManager:
    def __init__(self):
        self.pubsub = PubSub()
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        self.active_users: Dict[int, Set[int]] = {}

    async def connect(
            self,
            websocket: WebSocket,
            post_id: int,
            user_id: Optional[int] = None
    ) -> None:
        try:
            await websocket.accept()

            if post_id not in self.active_connections:
                self.active_connections[post_id] = set()
            if post_id not in self.active_users:
                self.active_users[post_id] = set()

            self.active_connections[post_id].add(websocket)

            if user_id:
                self.active_users[post_id].add(user_id)
                await self._broadcast_user_count(post_id)

            logger.info(f"Client connected to post {post_id}")

        except Exception as e:
            logger.error(f"Error in connect: {str(e)}")
            if websocket in self.active_connections.get(post_id, set()):
                await self.disconnect(websocket, post_id, user_id)
            raise

    async def disconnect(
            self,
            websocket: WebSocket,
            post_id: int,
            user_id: Optional[int] = None
    ) -> None:
        try:
            if post_id in self.active_connections:
                self.active_connections[post_id].discard(websocket)

                if user_id:
                    self.active_users[post_id].discard(user_id)
                    await self._broadcast_user_count(post_id)

                if not self.active_connections[post_id]:
                    del self.active_connections[post_id]
                    if post_id in self.active_users:
                        del self.active_users[post_id]

            logger.info(f"Client disconnected from post {post_id}")

        except Exception as e:
            logger.error(f"Error in disconnect: {str(e)}")
            raise

    async def _broadcast_user_count(self, post_id: int) -> None:
        if post_id in self.active_users:
            await self.broadcast_to_post(
                post_id,
                {
                    "type": "active_users",
                    "count": len(self.active_users[post_id])
                }
            )

    async def broadcast_to_post(
            self,
            post_id: int,
            message: Dict[str, Any]
    ) -> None:
        if post_id not in self.active_connections:
            return

        message["timestamp"] = datetime.utcnow().isoformat()
        message_json = json.dumps(message)

        disconnected = set()

        for connection in self.active_connections[post_id]:
            try:
                await connection.send_text(message_json)
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {str(e)}")
                disconnected.add(connection)

        # Clean up failed connections
        for conn in disconnected:
            self.active_connections[post_id].discard(conn)

    async def subscribe(
            self,
            post_id: int,
            event: str
    ) -> AsyncGenerator[Dict[str, Any], None]:
        channel = f"{post_id}:{event}"
        queue = await self.pubsub.subscribe(channel)

        try:
            while True:
                message = await queue.get()
                yield message
                queue.task_done()
        except CancelledError:
            await self.pubsub.unsubscribe(channel, queue)
            logger.info(f"Subscription cancelled for {channel}")
            raise
        except Exception as e:
            await self.pubsub.unsubscribe(channel, queue)
            logger.error(f"Error in subscription: {str(e)}")
            raise

    async def publish(
            self,
            post_id: int,
            event: str,
            data: Dict[str, Any]
    ) -> None:
        channel = f"{post_id}:{event}"
        await self.pubsub.publish(channel, data)

    def get_active_users(self, post_id: int) -> int:
        return len(self.active_users.get(post_id, set()))


# Create singleton instance
manager = WebSocketManager()