# services/comment_service.py
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from app.datamodels.comment_datamodels import Comment
from app.schemas.comment_schemas import CommentCreate, CommentResponse, CommentMetrics
from app.datamodels.interaction_datamodels import CommentInteraction, InteractionType
from app.datamodels.datamodels import User, UserProfile
from app.datamodels.post_datamodels import Post
from app.core.exceptions import DatabaseError
from datetime import datetime
from app.websocket_manager import manager

class CommentService:
    def __init__(self, db: Session):
        self.db = db

    def _calculate_path(self, parent_id: Optional[int] = None) -> str:
        """Calculate materialized path for new comment"""
        if not parent_id:
            return '0'  # Root level comment

        parent = self.db.query(Comment).filter(Comment.comment_id == parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")

        return f"{parent.path}.{parent_id}"

    def _calculate_depth(self, path: str) -> int:
        """Calculate nesting depth from path"""
        return len(path.split('.')) - 1

    def _get_root_comment_id(self, path: str) -> Optional[int]:
        """Get root comment ID from path"""
        parts = path.split('.')
        return int(parts[1]) if len(parts) > 1 else None

    async def create_comment(
            self,
            user_id: int,
            comment_data: CommentCreate
    ) -> CommentResponse:
        """Create a new comment with real-time updates"""
        try:
            # Calculate comment hierarchy data
            path = self._calculate_path(comment_data.parent_comment_id)
            depth = self._calculate_depth(path)
            root_comment_id = self._get_root_comment_id(path)

            # Create comment instance
            db_comment = Comment(
                content=comment_data.content,
                user_id=user_id,
                post_id=comment_data.post_id,
                parent_comment_id=comment_data.parent_comment_id,
                path=path,
                depth=depth,
                root_comment_id=root_comment_id,
                active_viewers=manager.get_active_users(comment_data.post_id)
            )

            self.db.add(db_comment)

            # Update parent comment's reply count if this is a reply
            if comment_data.parent_comment_id:
                parent = self.db.query(Comment).get(comment_data.parent_comment_id)
                if parent:
                    parent.reply_count += 1

            # Update post's comment count
            post = self.db.query(Post).get(comment_data.post_id)
            if post:
                post.comment_count += 1

            self.db.commit()
            self.db.refresh(db_comment)

            # Get complete comment data
            comment_response = await self.get_comment(db_comment.comment_id)

            # Broadcast new comment to all connected clients
            await manager.broadcast_to_post(
                comment_data.post_id,
                {
                    "type": "new_comment",
                    "comment": comment_response.dict()
                }
            )

            return comment_response

        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    async def update_comment(
            self,
            comment_id: int,
            user_id: int,
            content: str
    ) -> CommentResponse:
        """Update a comment with real-time updates"""
        try:
            comment = self.db.query(Comment).filter(
                Comment.comment_id == comment_id,
                Comment.user_id == user_id
            ).first()

            if not comment:
                raise HTTPException(status_code=404, detail="Comment not found")

            # Store previous content in edit history
            if not comment.edit_history:
                comment.edit_history = []

            comment.edit_history.append({
                "content": comment.content,
                "edited_at": datetime.utcnow().isoformat()
            })

            comment.content = content
            comment.is_edited = True
            comment.updated_at = func.now()

            self.db.commit()
            self.db.refresh(comment)

            # Get complete updated comment data
            comment_response = await self.get_comment(comment_id)

            # Broadcast comment update
            await manager.broadcast_to_post(
                comment.post_id,
                {
                    "type": "update_comment",
                    "comment": comment_response.dict()
                }
            )

            return comment_response

        except HTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    async def delete_comment(self, comment_id: int, user_id: int) -> Dict[str, Any]:
        """Soft delete a comment with real-time updates"""
        try:
            comment = self.db.query(Comment).filter(
                Comment.comment_id == comment_id,
                Comment.user_id == user_id
            ).first()

            if not comment:
                raise HTTPException(status_code=404, detail="Comment not found")

            # Perform soft delete
            comment.is_deleted = True
            comment.content = "[deleted]"
            comment.updated_at = func.now()

            # Update database
            self.db.commit()
            self.db.refresh(comment)

            # Get complete updated comment data
            comment_response = await self.get_comment(comment_id)

            # Broadcast deletion to all connected clients
            await manager.broadcast_to_post(
                comment.post_id,
                {
                    "type": "delete_comment",
                    "comment": comment_response.dict()
                }
            )

            return {
                "status": "success",
                "message": "Comment deleted successfully",
                "comment_id": comment_id
            }

        except HTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))


    async def get_comment(self, comment_id: int, user_id: Optional[int] = None) -> CommentResponse:
        """Get a single comment with all related data"""
        try:
            # Get comment with user data using a single join query
            comment = (
                self.db.query(Comment)
                .join(User)
                .outerjoin(UserProfile)  # Use outerjoin for optional profile
                .filter(Comment.comment_id == comment_id)
                .first()
            )

            if not comment:
                raise HTTPException(status_code=404, detail="Comment not found")

            # Get interaction state if user_id provided
            interaction_state = {
                "like": False,
                "dislike": False,
                "report": False
            }

            if user_id:
                interactions = (
                    self.db.query(CommentInteraction)
                    .join(InteractionType)
                    .filter(
                        CommentInteraction.comment_id == comment_id,
                        CommentInteraction.user_id == user_id
                    )
                    .all()
                )

                for interaction in interactions:
                    interaction_state[interaction.interaction_type.interaction_type_name] = True

            # Get real-time active viewers count from WebSocket manager
            active_viewers = manager.get_active_users(comment.post_id)

            # Convert to response model
            return CommentResponse(
                comment_id=comment.comment_id,
                user_id=comment.user_id,
                post_id=comment.post_id,
                content=comment.content,
                parent_comment_id=comment.parent_comment_id,
                path=comment.path,
                depth=comment.depth,
                root_comment_id=comment.root_comment_id,
                metrics=CommentMetrics(
                    like_count=comment.like_count,
                    dislike_count=comment.dislike_count,
                    reply_count=comment.reply_count,
                    report_count=comment.report_count
                ),
                username=comment.user.profile.username if comment.user.profile else f"user_{comment.user_id}",
                avatar_img=comment.user.profile.avatar_img if comment.user.profile else None,
                reputation_score=comment.user.profile.reputation_score if comment.user.profile else 0,
                interaction_state=interaction_state,
                is_edited=comment.is_edited,
                is_deleted=comment.is_deleted,
                created_at=comment.created_at,
                updated_at=comment.updated_at,
                last_activity=comment.last_activity,
                active_viewers=active_viewers  # Add real-time viewer count
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


    async def get_comment_thread(
            self,
            post_id: int,
            parent_id: Optional[int] = None,
            page: int = 1,
            page_size: int = 20,
            user_id: Optional[int] = None
    ) -> List[CommentResponse]:
        """Get a thread of comments with real-time data"""
        try:
            query = self.db.query(Comment)

            if parent_id:
                # Get replies to a specific comment
                parent = self.db.query(Comment).get(parent_id)
                if not parent:
                    raise HTTPException(status_code=404, detail="Parent comment not found")
                query = query.filter(Comment.path.like(f"{parent.path}.{parent_id}%"))
            else:
                # Get root level comments
                query = query.filter(
                    Comment.post_id == post_id,
                    Comment.depth == 0
                )

            # Optimize query with joins
            query = query.join(User).outerjoin(UserProfile)

            # Add ordering - newest first for root comments, oldest first for replies
            if parent_id:
                query = query.order_by(Comment.created_at.asc())
            else:
                query = query.order_by(Comment.created_at.desc())

            # Apply pagination
            total = query.count()
            comments = query.offset((page - 1) * page_size).limit(page_size).all()

            # Get all comment IDs for bulk interaction query
            comment_ids = [c.comment_id for c in comments]

            # Bulk fetch interactions if user is authenticated
            interaction_states = {}
            if user_id:
                interactions = (
                    self.db.query(CommentInteraction)
                    .join(InteractionType)
                    .filter(
                        CommentInteraction.comment_id.in_(comment_ids),
                        CommentInteraction.user_id == user_id
                    )
                    .all()
                )

                for comment_id in comment_ids:
                    interaction_states[comment_id] = {
                        "like": False,
                        "dislike": False,
                        "report": False
                    }

                for interaction in interactions:
                    interaction_states[interaction.comment_id][
                        interaction.interaction_type.interaction_type_name
                    ] = True

            # Convert to response models with real-time data
            responses = []
            for comment in comments:
                response = await self.get_comment(
                    comment.comment_id,
                    user_id,
                    interaction_state=interaction_states.get(comment.comment_id)
                )
                responses.append(response)

            return responses

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


    async def update_activity(
            self,
            comment_id: int,
            active_viewers: Optional[int] = None
    ) -> None:
        """Update comment activity tracking and broadcast changes"""
        try:
            comment = self.db.query(Comment).get(comment_id)
            if not comment:
                return

            if active_viewers is not None:
                comment.active_viewers = active_viewers

            comment.last_activity = func.now()
            self.db.commit()

            # Broadcast activity update
            await manager.broadcast_to_post(
                comment.post_id,
                {
                    "type": "comment_activity",
                    "comment_id": comment_id,
                    "active_viewers": active_viewers,
                    "last_activity": comment.last_activity.isoformat()
                }
            )

        except Exception as e:
            self.db.rollback()
            print(f"Error updating comment activity: {str(e)}")

    async def handle_interaction(
            self,
            comment_id: int,
            user_id: int,
            interaction_type: str,
            metadata: Optional[Dict[str, Any]] = None
    ) -> CommentResponse:
        """Handle comment interactions (like, dislike, report)"""
        try:
            comment = self.db.query(Comment).get(comment_id)
            if not comment:
                raise HTTPException(status_code=404, detail="Comment not found")

            # Get the interaction type ID
            interaction_type_record = (
                self.db.query(InteractionType)
                .filter(InteractionType.interaction_type_name == interaction_type)
                .first()
            )
            if not interaction_type_record:
                raise HTTPException(status_code=400, detail="Invalid interaction type")

            # Check for existing interaction
            existing_interaction = (
                self.db.query(CommentInteraction)
                .filter(
                    CommentInteraction.comment_id == comment_id,
                    CommentInteraction.user_id == user_id,
                    CommentInteraction.interaction_type_id == interaction_type_record.interaction_type_id
                )
                .first()
            )

            # Toggle interaction
            if existing_interaction:
                self.db.delete(existing_interaction)
                # Decrement counter
                setattr(comment, f"{interaction_type}_count",
                        getattr(comment, f"{interaction_type}_count") - 1)
            else:
                # Create new interaction
                new_interaction = CommentInteraction(
                    comment_id=comment_id,
                    user_id=user_id,
                    interaction_type_id=interaction_type_record.interaction_type_id,
                    target_type="comment",
                    interaction_metadata=metadata
                )
                self.db.add(new_interaction)
                # Increment counter
                setattr(comment, f"{interaction_type}_count",
                        getattr(comment, f"{interaction_type}_count") + 1)

            self.db.commit()
            self.db.refresh(comment)

            # Get updated comment data
            return await self.get_comment(comment_id, user_id)

        except HTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

