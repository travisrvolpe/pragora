# app/services/post_engagement_service.py
from fastapi import BackgroundTasks
#from sqlalchemy import and_, update, select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Dict, Any, List, Optional
import logging

from app.cache import RedisCache
from app.core.config import settings
from app.core.exceptions import (
    PostNotFoundError,
    InvalidInteractionTypeError,
    DatabaseError,
    CacheError
)
from app.core.metrics import get_metrics_collector
from app.datamodels.post_datamodels import Post
from app.datamodels.interaction_datamodels import PostInteraction, InteractionType
from app.schemas.post_schemas import PostMetricsUpdate

logger = logging.getLogger(__name__)


class PostEngagementService:
    """Service for handling post interactions and engagement"""

    VALID_INTERACTIONS = {'like', 'dislike', 'save', 'share', 'report'}

    def __init__(self, db: Session, cache: RedisCache):
        self.db = db
        self.cache = cache
        self.metrics = get_metrics_collector(cache)
        self.cache_expiry = settings.CACHE_EXPIRY_SECONDS

    async def _get_cached_counts(self, post_id: int) -> Optional[Dict[str, int]]:
        """Get cached interaction counts"""
        try:
            cache_key = f"post:{post_id}:counts"
            return await self.cache.get(cache_key)
        except Exception as e:
            logger.error(f"Cache error in _get_cached_counts: {str(e)}")
            raise CacheError("retrieving counts")

    async def _update_cache(self, post_id: int, counts: Dict[str, int]):
        """Update cached counts"""
        try:
            cache_key = f"post:{post_id}:counts"
            await self.cache.set(
                cache_key,
                counts,
                expire=self.cache_expiry
            )
        except Exception as e:
            logger.error(f"Cache error in _update_cache: {str(e)}")
            raise CacheError("updating counts")

    async def _get_interaction_counts(self, post_id: int) -> Dict[str, int]:
        """Get interaction counts with caching"""
        # Try cache first
        # TODO Add a cache expiration policy (e.g., refresh every minute / 30 min...).
        cached_counts = await self._get_cached_counts(post_id)
        if cached_counts:
            return cached_counts

        try:
            # Get counts from database
            counts = {}
            for interaction_type in self.VALID_INTERACTIONS:
                count = (
                    self.db.query(PostInteraction)
                    .join(InteractionType)
                    .filter(
                        PostInteraction.post_id == post_id,
                        InteractionType.interaction_type_name == interaction_type
                    )
                    .count()
                )
                counts[f"{interaction_type}_count"] = count

            # Update cache
            await self._update_cache(post_id, counts)
            return counts

        except SQLAlchemyError as e:
            logger.error(f"Database error in _get_interaction_counts: {str(e)}")
            raise DatabaseError("retrieving interaction counts")

    async def _verify_post(self, post_id: int) -> Post:
        """Verify post exists and return it"""
        post = self.db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise PostNotFoundError(post_id)
        return post

    async def _get_interaction_type(self, interaction_type: str) -> InteractionType:
        """Get interaction type record"""
        if interaction_type not in self.VALID_INTERACTIONS:
            raise InvalidInteractionTypeError(interaction_type)

        interaction_type_record = (
            self.db.query(InteractionType)
            .filter(InteractionType.interaction_type_name == interaction_type)
            .first()
        )

        if not interaction_type_record:
            raise DatabaseError("retrieving interaction type")

        return interaction_type_record

    # TODO OPTIMIZE toggle_interaction BY USING get_or_create
    # existing = db.query(PostInteraction).filter(
    #    PostInteraction.post_id == post_id,
    #    PostInteraction.user_id == user_id,
    #    PostInteraction.interaction_type_id == interaction_type_record.interaction_type_id
    # ).first()

    async def toggle_interaction(
            self,
            post_id: int,
            user_id: int,
            interaction_type: str,
            background_tasks: BackgroundTasks,
            metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Toggle a post interaction (like, dislike, save, etc.)"""

        try:
            logger.info(f"🔄 Processing interaction: {interaction_type} for post {post_id} by user {user_id}")

            # Step 1: Verify that the post exists
            post = await self._verify_post(post_id)
            logger.info(f"✅ Verified post {post_id}")

            # Step 2: Verify that the interaction type exists
            interaction_type_record = await self._get_interaction_type(interaction_type)
            logger.info(
                f"✅ Verified interaction type '{interaction_type}' (ID: {interaction_type_record.interaction_type_id})")

            # Step 3: Check for existing interaction
            existing = (
                self.db.query(PostInteraction)
                .filter(
                    PostInteraction.post_id == post_id,
                    PostInteraction.user_id == user_id,
                    PostInteraction.interaction_type_id == interaction_type_record.interaction_type_id
                )
                .first()
            )

            action = "remove" if existing else "add"
            logger.info(f"📝 Existing interaction found: {bool(existing)} (Action: {action})")

            try:
                # Step 4: Insert or remove interaction
                if existing:
                    logger.info(f"❌ Removing interaction for post {post_id}, user {user_id}")
                    self.db.delete(existing)
                    column_name = f"{interaction_type}_count"  # Make sure this matches DB column names
                    current_value = getattr(post, column_name, 0)  # Default to 0 if None

                    if current_value is None:
                        logger.warning(f"⚠️ {column_name} is None for post {post_id}. Setting it to 0.")
                        current_value = 0

                    setattr(post, column_name, max(0, current_value - 1))
                else:
                    logger.info(f"✅ Adding new interaction for post {post_id}, user {user_id}")

                    new_interaction = PostInteraction(
                        post_id=post_id,
                        user_id=user_id,
                        interaction_type_id=interaction_type_record.interaction_type_id,
                        target_type="POST"  # ✅ FIX: Ensure target_type is set
                    )

                    self.db.add(new_interaction)
                    column_name = f"{interaction_type}_count"
                    current_value = getattr(post, column_name, 0)  # Default to 0 if None
                    setattr(post, column_name, current_value + 1)

                # Step 5: Commit changes to database
                logger.info(f"🔄 Committing changes to database for post {post_id}")
                self.db.commit()

                # Step 6: Update cache and record metrics in background tasks
                background_tasks.add_task(self._update_cache, post_id,
                                          {f"{interaction_type}_count": getattr(post, f"{interaction_type}_count")})

                background_tasks.add_task(
                    self.metrics.record_interaction,
                    post_id,
                    user_id,
                    interaction_type,
                    action,
                    metadata
                )

                logger.info(f"✅ Interaction successfully {action}d for post {post_id}, user {user_id}")

                return {
                    "message": f"{interaction_type} {action}d successfully",
                    f"{interaction_type}_count": getattr(post, f"{interaction_type}_count"),
                    interaction_type: action == "add"
                }

            except SQLAlchemyError as e:
                self.db.rollback()
                logger.error(f"❌ Database error in toggle_interaction: {str(e)}")
                raise DatabaseError("Error processing interaction")

        except PostNotFoundError as e:
            logger.error(f"❌ Post not found: {str(e)}")
            raise DatabaseError("Post not found")

        except InvalidInteractionTypeError as e:
            logger.error(f"❌ Invalid interaction type: {str(e)}")
            raise DatabaseError("Invalid interaction type")

        except DatabaseError as e:
            logger.error(f"❌ General database error: {str(e)}")
            raise e

        except Exception as e:
            logger.error(f"❌ Unexpected error in toggle_interaction: {str(e)}")
            raise DatabaseError("Unexpected error while processing interaction")

    # Specific interaction methods
    async def like_post(
            self,
            post_id: int,
            user_id: int,
            background_tasks: BackgroundTasks
    ) -> Dict[str, Any]:
        """Handle post likes"""
        return await self.toggle_interaction(
            post_id,
            user_id,
            "like",
            background_tasks
        )

    async def dislike_post(
            self,
            post_id: int,
            user_id: int,
            background_tasks: BackgroundTasks
    ) -> Dict[str, Any]:
        """Handle post dislikes"""
        return await self.toggle_interaction(
            post_id,
            user_id,
            "dislike",
            background_tasks
        )

    async def save_post(
            self,
            post_id: int,
            user_id: int,
            background_tasks: BackgroundTasks
    ) -> Dict[str, Any]:
        """Handle post saves"""
        return await self.toggle_interaction(
            post_id,
            user_id,
            "save",
            background_tasks
        )

    async def share_post(
            self,
            post_id: int,
            user_id: int,
            background_tasks: BackgroundTasks
    ) -> Dict[str, Any]:
        """Handle post shares"""
        return await self.toggle_interaction(
            post_id,
            user_id,
            "share",
            background_tasks
        )

    async def report_post(
            self,
            post_id: int,
            user_id: int,
            reason: str,
            background_tasks: BackgroundTasks
    ) -> Dict[str, Any]:
        """Handle post reports"""
        try:
            result = await self.toggle_interaction(
                post_id=post_id,
                user_id=user_id,
                interaction_type="report",
                background_tasks=background_tasks,
                metadata={"reason": reason}
            )

            if result.get("report", False):
                # Update interaction metadata if needed
                interaction = (
                    self.db.query(PostInteraction)
                    .filter(
                        PostInteraction.post_id == post_id,
                        PostInteraction.user_id == user_id
                    )
                    .first()
                )
                if interaction and not interaction.interaction_metadata:
                    interaction.interaction_metadata = {"reason": reason}
                    self.db.commit()

            return result
        except Exception as e:
            logger.error(f"Error in report_post: {str(e)}")
            raise DatabaseError("processing report")

    async def get_user_interactions(
            self,
            post_ids: List[int],
            user_id: int
    ) -> Dict[int, List[str]]:
        """Get all interactions for multiple posts"""
        try:
            interactions = (
                self.db.query(
                    PostInteraction.post_id,
                    InteractionType.interaction_type_name
                )
                .join(InteractionType)
                .filter(
                    PostInteraction.post_id.in_(post_ids),
                    PostInteraction.user_id == user_id
                )
                .all()
            )

            return {
                post_id: [
                    interaction_type
                    for pid, interaction_type in interactions
                    if pid == post_id
                ]
                for post_id in post_ids
            }

        except SQLAlchemyError as e:
            logger.error(f"Error getting user interactions: {str(e)}")
            raise DatabaseError("retrieving user interactions")

    async def update_post_metrics(
            self,
            db: Session,
            post_id: int,
            user_id: int,
            background_tasks: BackgroundTasks,
            metrics: PostMetricsUpdate
    ) -> Dict[str, Any]:
        """
        Update multiple post metrics at once

        Args:
            db: Database session
            post_id: ID of the post to update
            user_id: ID of the user making the update
            background_tasks: FastAPI background tasks handler
            metrics: PostMetricsUpdate object containing metrics to update

        Returns:
            Dict containing updated metrics
        """
        try:
            # Verify post exists
            post = await self._verify_post(post_id)

            # Initialize metrics dict to store updates
            metrics_updates = {}
            metrics_data = metrics.dict(exclude_unset=True)  # Only get set values

            # Map metric names to post fields
            #Should this be plural or lowercase
            metric_fields = {
                'like': 'like_count',
                'dislike': 'dislike_count',
                'share': 'share_count',
                'save': 'save_count',
                'comment': 'comment_count',
                'report': 'report_count'
            }

            # Update each provided metric
            for metric_name, new_value in metrics_data.items():
                if metric_name in metric_fields:
                    field_name = metric_fields[metric_name]
                    # Ensure non-negative values
                    validated_value = max(0, new_value)
                    setattr(post, field_name, validated_value)
                    metrics_updates[field_name] = validated_value

            try:
                self.db.commit()

                # Update cache in background
                if metrics_updates:
                    background_tasks.add_task(
                        self._update_cache,
                        post_id,
                        metrics_updates
                    )

                # Record metrics update
                background_tasks.add_task(
                    self.metrics.record_interaction,
                    post_id,
                    user_id,
                    "metrics_update",
                    "update",
                    {"updates": metrics_updates}
                )

                # Return current metrics state
                return {
                    "message": "Metrics updated successfully",
                    "metrics": {
                        "like_count": post.like_count,
                        "dislike_count": post.dislike_count,
                        "share_count": post.share_count,
                        "save_count": post.save_count,
                        "comment_count": post.comment_count,
                        "report_count": post.report_count
                    }
                }

            except SQLAlchemyError as e:
                self.db.rollback()
                logger.error(f"Database error in update_post_metrics: {str(e)}")
                raise DatabaseError("updating metrics")

        except (PostNotFoundError, DatabaseError) as e:
            raise e
        except Exception as e:
            logger.error(f"Unexpected error in update_post_metrics: {str(e)}")
            raise DatabaseError("processing metrics update")