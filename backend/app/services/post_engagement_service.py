# app/services/post_engagement_service.py
import asyncio

from fastapi import BackgroundTasks, HTTPException
from sqlalchemy import and_, update, select, func
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from typing import Dict, Any, List, Optional
#import logging
from app.core.logger import get_logger, log_execution_time
from app.RedisCache import RedisCache, get_cache
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
from database.database import SessionLocal
from app.datamodels.datamodels import User

#logger = logging.getLogger(__name__)

logger = get_logger(__name__)

class PostEngagementService:
    """Service for handling post interactions and engagement"""

    VALID_INTERACTIONS = {'like', 'dislike', 'save', 'share', 'report', 'comment'}

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
        """Update cached counts with longer expiry"""
        try:
            cache_key = f"post:{post_id}:counts"
            # Increase cache expiry time
            await self.cache.set(
                cache_key,
                counts,
                expire=self.cache_expiry * 69  # Increase cache duration
            )
            # Force a refresh of the verified counts
            await self.verify_interaction_counts(post_id)
        except Exception as e:
            logger.error(f"Cache error in _update_cache: {str(e)}")
            raise CacheError("updating counts")


    async def _get_interaction_counts(self, post_id: int) -> Dict[str, int]:
        """Get interaction counts with caching"""
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

            # Ensure all counts are initialized
            for interaction_type in self.VALID_INTERACTIONS:
                if f"{interaction_type}_count" not in counts:
                    counts[f"{interaction_type}_count"] = 0

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

    async def _cleanup_stale_data(self, post_id: int):
        """Clean up stale data for a post"""
        try:
            # Clear stale metrics
            stale_keys = await self.cache.redis.keys(f"metrics:raw:{post_id}:*")
            if stale_keys:
                await self.cache.redis.delete(*stale_keys)

            # Reset counts if needed
            await self.verify_interaction_counts(post_id)
        except Exception as e:
            logger.error(f"Error cleaning stale data: {str(e)}")

    async def run_count_verification(self):
        """Run count verification on all posts"""
        try:
            posts = self.db.query(Post).all()
            for post in posts:
                try:
                    await self.verify_and_fix_counts(post.post_id)
                except Exception as e:
                    logger.error(f"Error verifying counts for post {post.post_id}: {str(e)}")
                    continue
        except Exception as e:
            logger.error(f"Error in count verification: {str(e)}")
            raise DatabaseError("Error running count verification")

    async def verify_interaction_counts(self, post_id: int) -> Dict[str, int]:
        """Verify and fix interaction counts for a post"""
        logger.info(f"Verifying counts for post {post_id}")

        try:
            # First get counts from cache
            cache_key = f"post:{post_id}:counts"
            cached_counts = await self.cache.get(cache_key)

            if cached_counts:
                logger.info(f"Found cached counts for post {post_id}: {cached_counts}")
                return cached_counts

            logger.info(f"CACHE MISS for post {post_id}, querying database")

            #if cached_counts:
                #logger.info(f"Found cached counts for post {post_id}: {cached_counts}")
                # TEMPORARY TEST: Skip cache to see if database values work
                # return cached_counts
                #logger.info("Temporarily bypassing cache to get fresh DB counts")
                #cached_counts = None  # Force DB lookup
            #else:
                #logger.info(f"CACHE MISS for post {post_id}, querying database")


            # If no cache, get actual counts with a read-only query first
            actual_counts = (
                self.db.query(
                    InteractionType.interaction_type_name,
                    func.count(PostInteraction.interaction_id).label('count')
                )
                .join(PostInteraction, PostInteraction.interaction_type_id == InteractionType.interaction_type_id)
                .filter(PostInteraction.post_id == post_id)
                .group_by(InteractionType.interaction_type_name)
                .all()
            )

            # Convert to dictionary and ensure all counts exist
            count_dict = {
                f"{name}_count": count for name, count in actual_counts
            }

            # Ensure all interaction types have counts
            for interaction_type in self.VALID_INTERACTIONS:
                count_field = f"{interaction_type}_count"
                if count_field not in count_dict:
                    count_dict[count_field] = 0

            # Now get post with explicit locking only if we need to update
            post = (
                self.db.query(Post)
                .filter(Post.post_id == post_id)
                .with_for_update(skip_locked=True)
                .first()
            )

            if not post:
                raise PostNotFoundError(post_id)

            # Check if any counts need updating
            needs_update = any(
                getattr(post, field, 0) != count
                for field, count in count_dict.items()
            )

            if needs_update:
                logger.info(f"Updating mismatched counts for post {post_id}")
                try:
                    # Check if a transaction is already in progress
                    if self.db.in_transaction():
                        self.db.rollback()  # Roll back any existing transaction

                    # Start a new transaction
                    self.db.begin()

                    # Update counts
                    for field, count in count_dict.items():
                        setattr(post, field, count)

                    # Commit changes
                    self.db.commit()
                    logger.info(f"Updated counts in database for post {post_id}")
                except SQLAlchemyError as e:
                    if self.db.in_transaction():
                        self.db.rollback()
                    logger.error(f"Failed to update counts: {str(e)}")
                    raise DatabaseError("Error updating counts")

            # Update cache regardless of whether we updated the database
            await self.cache.set(
                cache_key,
                count_dict,
                expire=self.cache_expiry
            )
            logger.info(f"Updated cache for post {post_id} with counts: {count_dict}")

            return count_dict

        except SQLAlchemyError as e:
            logger.error(f"Database error in verify_counts: {str(e)}")
            raise DatabaseError("Error verifying counts")
        except Exception as e:
            logger.error(f"Unexpected error in verify_counts: {str(e)}")
            raise DatabaseError("Error verifying counts")

    async def repair_all_post_counts(self) -> None:
        """Repair interaction counts for all posts"""
        try:
            # Get all posts
            posts = self.db.query(Post).all()

            for post in posts:
                try:
                    await self.verify_interaction_counts(post.post_id)
                except Exception as e:
                    logger.error(f"❌ Error repairing counts for post {post.post_id}: {str(e)}")
                    continue

            logger.info("✅ Completed post count repair")

        except Exception as e:
            logger.error(f"❌ Error in repair_all_post_counts: {str(e)}")
            raise DatabaseError("Error repairing post counts")

    async def verify_and_fix_counts(self, post_id: int) -> Dict[str, int]:
        """Verify and fix all interaction counts for a post"""
        try:
            # Get post with lock
            post = (
                self.db.query(Post)
                .filter(Post.post_id == post_id)
                .with_for_update()
                .first()
            )

            if not post:
                raise PostNotFoundError(post_id)

            # Get actual counts
            actual_counts = (
                self.db.query(
                    InteractionType.interaction_type_name,
                    func.count(PostInteraction.interaction_id).label('count')
                )
                .join(PostInteraction)
                .filter(PostInteraction.post_id == post_id)
                .group_by(InteractionType.interaction_type_name)
                .all()
            )

            # Convert to dict and ensure all counts exist
            count_dict = {name: count for name, count in actual_counts}
            for interaction_type in self.VALID_INTERACTIONS:
                if interaction_type not in count_dict:
                    count_dict[interaction_type] = 0

            # Update post counts if they don't match
            updated = False
            for interaction_type in self.VALID_INTERACTIONS:
                count_field = f"{interaction_type}_count"
                actual_count = count_dict.get(interaction_type, 0)
                stored_count = getattr(post, count_field, 0) or 0

                if stored_count != actual_count:
                    logger.info(f"Fixing {count_field} for post {post_id}: {stored_count} -> {actual_count}")
                    setattr(post, count_field, actual_count)
                    updated = True

            if updated:
                self.db.commit()
                logger.info(f"✅ Updated counts for post {post_id}")

            return {f"{k}_count": getattr(post, f"{k}_count", 0) for k in self.VALID_INTERACTIONS}

        except Exception as e:
            logger.error(f"Error verifying counts: {str(e)}")
            raise DatabaseError("Error verifying counts")

    async def reconcile_saved_post(self, post_id: int, user_id: int):
        try:
            # Create a new clean transaction
            if self.db.in_transaction():
                self.db.rollback()

            self.db.begin()

            # Get save interaction type
            save_type = self.db.query(InteractionType).filter(
                InteractionType.interaction_type_name == "save"
            ).first()

            if not save_type:
                self.db.rollback()
                return

            # Get user and post with explicit locking
            user = self.db.query(User).filter(User.user_id == user_id).first()
            post = self.db.query(Post).filter(Post.post_id == post_id).with_for_update().first()

            if not user or not post:
                self.db.rollback()
                return

            # Check if interaction exists
            existing_interaction = self.db.query(PostInteraction).filter(
                PostInteraction.post_id == post_id,
                PostInteraction.user_id == user_id,
                PostInteraction.interaction_type_id == save_type.interaction_type_id
            ).first()

            # Check if post is in saved_posts
            is_saved = False
            for saved_post in user.saved_posts:
                if saved_post.post_id == post_id:
                    is_saved = True
                    break

            # Reconcile differences
            made_changes = False

            if existing_interaction and not is_saved:
                # Add to saved_posts
                user.saved_posts.append(post)
                logger.info(f"Reconciled: Added post {post_id} to user {user_id}'s saved_posts")
                made_changes = True
            elif is_saved and not existing_interaction:
                # Add interaction
                new_interaction = PostInteraction(
                    post_id=post_id,
                    user_id=user_id,
                    interaction_type_id=save_type.interaction_type_id,
                    target_type="POST"
                )
                self.db.add(new_interaction)
                logger.info(f"Reconciled: Added save interaction for post {post_id}, user {user_id}")
                made_changes = True

            # Count actual save interactions
            save_count_query = self.db.query(func.count(PostInteraction.interaction_id)).filter(
                PostInteraction.post_id == post_id,
                PostInteraction.interaction_type_id == save_type.interaction_type_id
            ).scalar()

            # Always update the save_count to reflect actual count
            if post.save_count != save_count_query:
                post.save_count = save_count_query
                logger.info(f"Reconciled: Updated save_count for post {post_id} to {save_count_query}")
                made_changes = True

            # Explicitly invalidate the cache
            cache_key = f"post:{post_id}:counts"
            await self.cache.delete(cache_key)

            # Commit changes if any were made
            if made_changes:
                self.db.commit()
                logger.info(f"Successfully reconciled saved_posts status for post {post_id}, user {user_id}")
            else:
                self.db.rollback()
                logger.info(f"No changes needed during reconciliation for post {post_id}, user {user_id}")

            # Update the cache with the new state regardless of changes
            new_counts = await self._get_interaction_counts(post_id)
            await self.cache.set(cache_key, new_counts, expire=self.cache_expiry)

        except Exception as e:
            if self.db.in_transaction():
                self.db.rollback()
            logger.error(f"Error in reconcile_saved_post: {str(e)}")


    # TODO OPTIMIZE toggle_interaction BY USING get_or_create
    # existing = db.query(PostInteraction).filter(
    #    PostInteraction.post_id == post_id,
    #    PostInteraction.user_id == user_id,
    #    PostInteraction.interaction_type_id == interaction_type_record.interaction_type_id
    # ).first()

    # Enhanced toggle_interaction method with detailed logging
    # TODO CREATE A SEPARETE METHOD FOR COMMENTS
    async def toggle_interaction(
            self,
            post_id: int,
            user_id: int,
            interaction_type: str,
            background_tasks: BackgroundTasks,
            metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Toggle a post interaction with improved persistence"""
        logger.info(f"🔍 Starting interaction toggle - Type: {interaction_type}, Post: {post_id}, User: {user_id}")

        # Get interaction type ID (outside transaction)
        interaction_type_record = await self._get_interaction_type(interaction_type)
        count_field = f"{interaction_type}_count"

        # Track results
        action = None
        is_active = None
        new_count = None

        try:
            # Always start fresh
            if self.db.in_transaction():
                self.db.rollback()

            self.db.begin()

            # First check if the interaction exists
            existing = self.db.query(PostInteraction).filter(
                PostInteraction.post_id == post_id,
                PostInteraction.user_id == user_id,
                PostInteraction.interaction_type_id == interaction_type_record.interaction_type_id
            ).first()

            # For save interactions, also check the saved_posts relationship
            is_in_saved_posts = False
            if interaction_type == "save":
                user = self.db.query(User).filter(User.user_id == user_id).first()
                if user:
                    post = self.db.query(Post).filter(Post.post_id == post_id).first()
                    if post in user.saved_posts:
                        is_in_saved_posts = True

            # Determine if this interaction should be considered active
            # For save interactions, check both the interaction table and saved_posts relationship
            if interaction_type == "save":
                is_active = is_in_saved_posts or (existing is not None)
            else:
                is_active = existing is not None

            # Commit this check transaction and start a new one for the update
            self.db.commit()

            # Now determine the action: remove if active, add if not
            if is_active:
                # REMOVE INTERACTION
                logger.info(f"Removing existing {interaction_type} interaction for post {post_id}, user {user_id}")
                action = "removed"
                is_active = False

                # Start a new transaction
                if self.db.in_transaction():
                    self.db.rollback()

                self.db.begin()

                # Get the post for updating counts
                post = self.db.query(Post).filter(Post.post_id == post_id).with_for_update().first()
                if not post:
                    self.db.rollback()
                    raise PostNotFoundError(post_id)

                # Update count
                current_count = getattr(post, count_field, 0) or 0
                new_count = max(0, current_count - 1)
                setattr(post, count_field, new_count)

                # Delete the interaction
                if existing:
                    self.db.query(PostInteraction).filter(
                        PostInteraction.interaction_id == existing.interaction_id
                    ).delete()

                # For save interactions, also handle saved_posts relationship
                if interaction_type == "save":
                    user = self.db.query(User).filter(User.user_id == user_id).first()
                    if user:
                        # Get the post specifically for the relationship
                        saved_post = self.db.query(Post).filter(Post.post_id == post_id).first()
                        if saved_post in user.saved_posts:
                            user.saved_posts.remove(saved_post)
                            logger.info(f"Removed post {post_id} from user {user_id}'s saved_posts")

                # Commit the transaction
                self.db.commit()

            else:
                # ADD INTERACTION
                logger.info(f"Adding new {interaction_type} interaction for post {post_id}, user {user_id}")
                action = "added"
                is_active = True

                # Start a new transaction
                if self.db.in_transaction():
                    self.db.rollback()

                self.db.begin()

                # Get the post for updating counts
                post = self.db.query(Post).filter(Post.post_id == post_id).with_for_update().first()
                if not post:
                    self.db.rollback()
                    raise PostNotFoundError(post_id)

                # For save interactions, handle saved_posts relationship first
                if interaction_type == "save":
                    user = self.db.query(User).filter(User.user_id == user_id).first()
                    if user:
                        # Get the post specifically for the relationship
                        saved_post = self.db.query(Post).filter(Post.post_id == post_id).first()
                        if saved_post not in user.saved_posts:
                            user.saved_posts.append(saved_post)
                            logger.info(f"Added post {post_id} to user {user_id}'s saved_posts")

                # Check one more time to avoid race conditions
                existing_check = self.db.query(PostInteraction).filter(
                    PostInteraction.post_id == post_id,
                    PostInteraction.user_id == user_id,
                    PostInteraction.interaction_type_id == interaction_type_record.interaction_type_id
                ).first()

                if not existing_check:
                    # Create new interaction
                    new_interaction = PostInteraction(
                        post_id=post_id,
                        user_id=user_id,
                        interaction_type_id=interaction_type_record.interaction_type_id,
                        target_type="POST",
                        interaction_metadata=metadata
                    )
                    self.db.add(new_interaction)

                # Update count
                current_count = getattr(post, count_field, 0) or 0
                new_count = current_count + 1
                setattr(post, count_field, new_count)

                # Handle mutual exclusivity (like/dislike)
                if interaction_type == "like":
                    dislike = self.db.query(PostInteraction).join(InteractionType).filter(
                        PostInteraction.post_id == post_id,
                        PostInteraction.user_id == user_id,
                        InteractionType.interaction_type_name == "dislike"
                    ).first()

                    if dislike:
                        self.db.delete(dislike)
                        post.dislike_count = max(0, post.dislike_count - 1)

                elif interaction_type == "dislike":
                    like = self.db.query(PostInteraction).join(InteractionType).filter(
                        PostInteraction.post_id == post_id,
                        PostInteraction.user_id == user_id,
                        InteractionType.interaction_type_name == "like"
                    ).first()

                    if like:
                        self.db.delete(like)
                        post.like_count = max(0, post.like_count - 1)

                # Commit the transaction
                self.db.commit()

            # Get fresh metrics after all transactions
            metrics = {
                "like_count": 0,
                "dislike_count": 0,
                "save_count": 0,
                "share_count": 0,
                "comment_count": 0,
                "report_count": 0
            }

            # Get post with current metrics
            post = self.db.query(Post).filter(Post.post_id == post_id).first()
            if post:
                for key in metrics.keys():
                    metrics[key] = getattr(post, key, 0) or 0

            # For saved posts, ensure the count matches reality
            if interaction_type == "save":
                # Count actual saved interactions
                save_count = self.db.query(func.count(PostInteraction.interaction_id)).join(InteractionType).filter(
                    PostInteraction.post_id == post_id,
                    InteractionType.interaction_type_name == "save"
                ).scalar() or 0

                # Update post save_count if it doesn't match
                if metrics["save_count"] != save_count:
                    logger.info(f"Correcting save_count from {metrics['save_count']} to {save_count}")
                    post = self.db.query(Post).filter(Post.post_id == post_id).with_for_update().first()
                    if post:
                        post.save_count = save_count
                        self.db.commit()
                    metrics["save_count"] = save_count

            # Update cache
            cache_key = f"post:{post_id}:counts"
            # Force cache deletion instead of just updating
            await self.cache.delete(cache_key)
            # Set new cache with updated metrics
            await self.cache.set(cache_key, metrics, expire=self.cache_expiry)

            # Record metric in background
            background_tasks.add_task(
                self.metrics.record_interaction,
                post_id,
                user_id,
                interaction_type,
                action,
                metadata
            )

            result = {
                "message": f"{interaction_type} {action} successfully",
                f"{interaction_type}_count": metrics[f"{interaction_type}_count"],
                interaction_type: is_active,
                "metrics": metrics
            }

            return result

        except SQLAlchemyError as e:
            if self.db.in_transaction():
                self.db.rollback()

            logger.error(f"Database error in toggle_interaction: {str(e)}")

            # Try to reconcile data if it's a save interaction
            if "UniqueViolation" in str(e) and interaction_type == "save":
                try:
                    await self.reconcile_saved_post(post_id, user_id)
                    logger.info(f"Attempted to reconcile saved_posts for post {post_id}, user {user_id}")

                    # Return a fallback response
                    return {
                        "message": f"{interaction_type} state reconciled",
                        interaction_type: True,  # Assume it's now saved
                        "metrics": await self._get_interaction_counts(post_id)
                    }
                except Exception as re:
                    logger.error(f"Error during reconciliation: {str(re)}")

            raise DatabaseError(f"Error processing interaction: {str(e)}")

        except Exception as e:
            if self.db.in_transaction():
                self.db.rollback()

            logger.error(f"❌ Error in toggle_interaction: {str(e)}")
            raise DatabaseError(f"Error processing interaction: {str(e)}")

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
        """
        Save or unsave a post - simplified version
        """
        try:
            # Start a new transaction
            if self.db.in_transaction():
                self.db.rollback()

            self.db.begin()

            # Get the save interaction type
            save_type = self.db.query(InteractionType).filter(
                InteractionType.interaction_type_name == "save"
            ).first()

            if not save_type:
                self.db.rollback()
                return {"message": "Save type not found", "save": False, "save_count": 0}

            # Check if post exists
            post = self.db.query(Post).filter(Post.post_id == post_id).first()
            if not post:
                self.db.rollback()
                return {"message": "Post not found", "save": False, "save_count": 0}

            # Check if a save interaction exists
            existing = self.db.query(PostInteraction).filter(
                PostInteraction.post_id == post_id,
                PostInteraction.user_id == user_id,
                PostInteraction.interaction_type_id == save_type.interaction_type_id
            ).first()

            if existing:
                # UNSAVE: Remove interaction
                self.db.delete(existing)
                if post.save_count > 0:
                    post.save_count -= 1
                new_state = False
                message = "Post unsaved successfully"
            else:
                # SAVE: Add interaction
                new_interaction = PostInteraction(
                    post_id=post_id,
                    user_id=user_id,
                    interaction_type_id=save_type.interaction_type_id,
                    target_type="POST"
                )
                self.db.add(new_interaction)
                post.save_count += 1
                new_state = True
                message = "Post saved successfully"

            # Get metrics
            metrics = {
                "like_count": post.like_count or 0,
                "dislike_count": post.dislike_count or 0,
                "save_count": post.save_count or 0,
                "share_count": post.share_count or 0,
                "comment_count": post.comment_count or 0,
                "report_count": post.report_count or 0
            }

            # Commit the transaction
            self.db.commit()

            # Update cache
            cache_key = f"post:{post_id}:counts"
            await self.cache.delete(cache_key)
            await self.cache.set(cache_key, metrics, expire=self.cache_expiry)

            # Return the response
            return {
                "message": message,
                "save": new_state,
                "save_count": metrics["save_count"],
                "metrics": metrics
            }

        except Exception as e:
            if self.db.in_transaction():
                self.db.rollback()
            logger.error(f"Error in save_post: {str(e)}")

            # Return a fallback response that still works with the frontend
            return {
                "message": f"Error processing save: {str(e)}",
                "save": False,
                "metrics": {
                    "like_count": post.like_count if 'post' in locals() else 0,
                    "dislike_count": post.dislike_count if 'post' in locals() else 0,
                    "save_count": post.save_count if 'post' in locals() else 0,
                    "share_count": post.share_count if 'post' in locals() else 0,
                    "comment_count": post.comment_count if 'post' in locals() else 0,
                    "report_count": post.report_count if 'post' in locals() else 0
                }
            }

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

    async def get_user_interaction_state(
            self,
            post_id: int,
            user_id: Optional[int]
    ) -> Dict[str, bool]:
        """Get user's interaction state for a post"""
        if not user_id:
            return {
                "like": False,
                "dislike": False,
                "save": False,
                "share": False,
                "report": False
            }

        try:
            # Initialize default state
            interaction_state = {
                "like": False,
                "dislike": False,
                "save": False,
                "share": False,
                "report": False
            }

            # Fetch interactions from PostInteraction table
            interactions = (
                self.db.query(PostInteraction)
                .join(InteractionType)
                .filter(
                    PostInteraction.post_id == post_id,
                    PostInteraction.user_id == user_id
                )
                .all()
            )

            # Create dictionary mapping interaction types to existence
            for interaction in interactions:
                interaction_type = interaction.interaction_type.interaction_type_name
                if interaction_type in interaction_state:
                    interaction_state[interaction_type] = True

            # Special check for save interactions in saved_posts table
            if not interaction_state["save"]:
                # Directly check the saved_posts relationship table
                user = self.db.query(User).filter(User.user_id == user_id).first()
                if user:
                    saved_post_ids = [post.post_id for post in user.saved_posts]
                    if post_id in saved_post_ids:
                        interaction_state["save"] = True
                        # Since we found it in saved_posts but not in interactions,
                        # we should add it to PostInteraction for consistency
                        save_type = self.db.query(InteractionType).filter(
                            InteractionType.interaction_type_name == "save"
                        ).first()
                        if save_type:
                            # Check if interaction already exists before adding
                            existing = self.db.query(PostInteraction).filter(
                                PostInteraction.post_id == post_id,
                                PostInteraction.user_id == user_id,
                                PostInteraction.interaction_type_id == save_type.interaction_type_id
                            ).first()
                            if not existing:
                                new_interaction = PostInteraction(
                                    post_id=post_id,
                                    user_id=user_id,
                                    interaction_type_id=save_type.interaction_type_id,
                                    target_type="POST"
                                )
                                self.db.add(new_interaction)
                                self.db.commit()
                                logger.info(f"Added missing save interaction for post {post_id}, user {user_id}")

            return interaction_state

        except SQLAlchemyError as e:
            logger.error(f"Error getting interaction state: {str(e)}")
            raise DatabaseError("Error retrieving interaction state")

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

    async def verify_persistence(self, post_id: int, field: str, expected_value: int) -> bool:
        """Verify that a metric was properly persisted"""
        post = self.db.query(Post).filter(Post.post_id == post_id).first()
        actual_value = getattr(post, field, 0)
        return actual_value == expected_value


async def verify_all_post_counts(): # TODO DELETE THIS/ IT IS THE SAME AS REPAIR_ALL_POST_COUNTS
    """Verify and update all post counts on startup"""
    db = SessionLocal()
    try:
        cache = get_cache()
        service = PostEngagementService(db, cache)
        await service.repair_all_post_counts()
        print("✅ All post counts verified and updated")
    except Exception as e:
        print(f"❌ Error verifying post counts: {str(e)}")
    finally:
        db.close()



