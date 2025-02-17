# websocket_manager.py
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Optional, Set
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # Track active connections by post_id
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Track active users by post_id
        self.active_users: Dict[int, Set[int]] = {}
        # Track user's connection count (for handling multiple tabs)
        self.user_connections: Dict[int, int] = {}

    async def connect(self, websocket: WebSocket, post_id: int, user_id: Optional[int] = None):
        """Connect a apolloClient to a post's WebSocket"""
        try:
            await websocket.accept()

            # Initialize post connections if needed
            if post_id not in self.active_connections:
                self.active_connections[post_id] = []
            if post_id not in self.active_users:
                self.active_users[post_id] = set()

            # Add connection
            self.active_connections[post_id].append(websocket)

            # Track user if authenticated
            if user_id:
                self.active_users[post_id].add(user_id)
                self.user_connections[user_id] = self.user_connections.get(user_id, 0) + 1

            # Broadcast active user count
            await self.broadcast_active_users(post_id)

            logger.info(
                f"Client connected to post {post_id}. Active connections: {len(self.active_connections[post_id])}")

        except Exception as e:
            logger.error(f"Error in connect: {str(e)}")
            raise

    async def disconnect(self, websocket: WebSocket, post_id: int, user_id: Optional[int] = None):
        """Disconnect a apolloClient from a post's WebSocket"""
        try:
            if post_id in self.active_connections:
                self.active_connections[post_id].remove(websocket)

                # Clean up user tracking if authenticated
                if user_id:
                    self.user_connections[user_id] = self.user_connections.get(user_id, 1) - 1

                    # Only remove user from active users if no more connections
                    if self.user_connections[user_id] <= 0:
                        if post_id in self.active_users:
                            self.active_users[post_id].discard(user_id)
                        self.user_connections.pop(user_id, None)

                # Clean up empty post entries
                if not self.active_connections[post_id]:
                    self.active_connections.pop(post_id)
                    self.active_users.pop(post_id, None)
                else:
                    # Broadcast updated active user count
                    await self.broadcast_active_users(post_id)

            logger.info(f"Client disconnected from post {post_id}")

        except Exception as e:
            logger.error(f"Error in disconnect: {str(e)}")
            raise

    async def broadcast_to_post(self, post_id: int, message: dict):
        """Broadcast a message to all clients connected to a post"""
        if post_id not in self.active_connections:
            return

        # Add timestamp to message
        message["timestamp"] = datetime.utcnow().isoformat()

        # Serialize message
        message_json = json.dumps(message)

        # Track failed connections for cleanup
        failed_connections = []

        for connection in self.active_connections[post_id]:
            try:
                await connection.send_text(message_json)
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {str(e)}")
                failed_connections.append(connection)

        # Clean up failed connections
        for failed in failed_connections:
            try:
                self.active_connections[post_id].remove(failed)
            except ValueError:
                pass

    async def broadcast_active_users(self, post_id: int):
        """Broadcast active user count to all clients on a post"""
        if post_id in self.active_users:
            await self.broadcast_to_post(
                post_id,
                {
                    "type": "active_users",
                    "count": len(self.active_users[post_id])
                }
            )

    def get_active_users(self, post_id: int) -> int:
        """Get number of active users for a post"""
        return len(self.active_users.get(post_id, set()))


# Create singleton instance
manager = ConnectionManager()