# websocket_routes.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
import json
import logging
from datetime import datetime

from app.websocket_manager import manager
from app.auth.utils import get_current_user
from app.services.comment_service import CommentService
from database.database import SessionLocal
from app.utils.database_utils import get_db

logger = logging.getLogger(__name__)
router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token", auto_error=False)


@router.websocket("/ws/post/{post_id}")
async def websocket_endpoint(
        websocket: WebSocket,
        post_id: int,
        token: Optional[str] = None,
        db: SessionLocal = Depends(get_db)
):
    user_id = None
    try:
        # Accept connection and authenticate if token provided
        if token:
            try:
                user = await get_current_user(None, token, db)
                user_id = user.user_id
                logger.info(f"Authenticated user {user_id} connected to post {post_id}")
            except HTTPException as e:
                logger.warning(f"Invalid token provided: {str(e)}")
                await websocket.close(code=1008, reason="Invalid authentication")
                return

        # Connect to WebSocket manager
        await manager.connect(websocket, post_id, user_id)
        comment_service = CommentService(db)

        try:
            while True:
                # Receive message
                data = await websocket.receive_json()

                # Validate message structure
                if "type" not in data:
                    continue

                # Process different message types
                if data["type"] == "new_comment":
                    if not user_id:
                        continue  # Silently ignore - unauthenticated users can't comment

                    try:
                        # Create comment using service
                        comment = await comment_service.create_comment(
                            user_id=user_id,
                            comment_data=data["comment"]
                        )

                        # Broadcast comment to all clients
                        await manager.broadcast_to_post(
                            post_id,
                            {
                                "type": "new_comment",
                                "comment": comment.dict()
                            }
                        )
                    except Exception as e:
                        logger.error(f"Error creating comment: {str(e)}")
                        await websocket.send_json({
                            "type": "error",
                            "message": "Failed to create comment"
                        })

                elif data["type"] == "typing":
                    if not user_id:
                        continue

                    # Broadcast typing status
                    await manager.broadcast_to_post(
                        post_id,
                        {
                            "type": "typing",
                            "user_id": user_id,
                            "username": data.get("username", "Anonymous")
                        }
                    )

                elif data["type"] == "ping":
                    # Respond to ping messages to keep connection alive
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.utcnow().isoformat()
                    })

        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected for post {post_id}")
            await manager.disconnect(websocket, post_id, user_id)

        except Exception as e:
            logger.error(f"Error in WebSocket connection: {str(e)}")
            await manager.disconnect(websocket, post_id, user_id)
            await websocket.close(code=1011)

    except Exception as e:
        logger.error(f"Error establishing WebSocket connection: {str(e)}")
        await websocket.close(code=1011)