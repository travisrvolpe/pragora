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
from app.datamodels.user_datamodels import User

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
        """Ensure saved_posts and PostInteraction records are in sync for a user/post pair"""
        try:
            self.db.begin()
            # Get save interaction type
            save_type = self.db.query(InteractionType).filter(
                InteractionType.interaction_type_name == "save"
            ).first()

            if not save_type:
                return

            # Check if interaction exists
            existing_interaction = self.db.query(PostInteraction).filter(
                PostInteraction.post_id == post_id,
                PostInteraction.user_id == user_id,
                PostInteraction.interaction_type_id == save_type.interaction_type_id
            ).first()

            # Get user and post
            user = self.db.query(User).filter(User.user_id == user_id).first()
            post = self.db.query(Post).filter(Post.post_id == post_id).first()

            if not user or not post:
                return

            # Check if post is in saved_posts
            is_saved = post in user.saved_posts

            # Reconcile differences
            if existing_interaction and not is_saved:
                # Add to saved_posts
                user.saved_posts.append(post)
                logger.info(f"Reconciled: Added post {post_id} to user {user_id}'s saved_posts")
                self.db.commit()
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
                self.db.commit()
        except Exception as e:
            logger.error(f"Error in reconcile_saved_post: {str(e)}")
            self.db.rollback()

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
        try:
            logger.info(f"🔍 Starting interaction toggle - Type: {interaction_type}, Post: {post_id}, User: {user_id}")

            # Get interaction type record without locking
            interaction_type_record = await self._get_interaction_type(interaction_type)
            count_field = f"{interaction_type}_count"

            # Special handling for save operations which are more prone to transaction conflicts
            if interaction_type == "save":
                # Use a completely fresh session for save operations
                new_db = SessionLocal()
                try:
                    # Create a new service instance with the fresh session
                    cache = get_cache()
                    fresh_service = PostEngagementService(new_db, cache)

                    # Use special _toggle_save_interaction method that doesn't rely on existing transactions
                    return await fresh_service._toggle_save_interaction(
                        post_id=post_id,
                        user_id=user_id,
                        interaction_type_record=interaction_type_record,
                        count_field=count_field,
                        background_tasks=background_tasks,
                        metadata=metadata
                    )
                finally:
                    # Always close the fresh session
                    new_db.close()

            # For non-save interactions, use the original code
            # Check if there's an active transaction and roll it back if so
            if self.db.in_transaction():
                logger.info(f"Rolling back existing transaction before starting new one")
                self.db.rollback()

            # Start a new transaction explicitly
            self.db.begin()

            try:
                # Get post with short-term lock
                post = (
                    self.db.query(Post)
                    .filter(Post.post_id == post_id)
                    .with_for_update(skip_locked=True)
                    .first()
                )

                if not post:
                    self.db.rollback()
                    raise PostNotFoundError(post_id)

                # No need to get user for non-save interactions
                user = None

                # Check for existing interaction
                existing = (
                    self.db.query(PostInteraction)
                    .filter(
                        PostInteraction.post_id == post_id,
                        PostInteraction.user_id == user_id,
                        PostInteraction.interaction_type_id == interaction_type_record.interaction_type_id
                    )
                    .first()
                )

                current_count = getattr(post, count_field, 0) or 0

                if existing:
                    # Remove interaction
                    self.db.delete(existing)
                    new_count = max(0, current_count - 1)
                    setattr(post, count_field, new_count)
                    action = "removed"
                    is_active = False
                else:
                    # Add interaction
                    new_interaction = PostInteraction(
                        post_id=post_id,
                        user_id=user_id,
                        interaction_type_id=interaction_type_record.interaction_type_id,
                        target_type="POST",
                        interaction_metadata=metadata
                    )
                    self.db.add(new_interaction)

                    new_count = current_count + 1
                    setattr(post, count_field, new_count)
                    action = "added"
                    is_active = True

                # Handle mutual exclusivity
                if interaction_type == "like" and action == "added":
                    dislike = (
                        self.db.query(PostInteraction)
                        .join(InteractionType)
                        .filter(
                            PostInteraction.post_id == post_id,
                            PostInteraction.user_id == user_id,
                            InteractionType.interaction_type_name == "dislike"
                        )
                        .first()
                    )
                    if dislike:
                        self.db.delete(dislike)
                        post.dislike_count = max(0, post.dislike_count - 1)

                elif interaction_type == "dislike" and action == "added":
                    like = (
                        self.db.query(PostInteraction)
                        .join(InteractionType)
                        .filter(
                            PostInteraction.post_id == post_id,
                            PostInteraction.user_id == user_id,
                            InteractionType.interaction_type_name == "like"
                        )
                        .first()
                    )
                    if like:
                        self.db.delete(like)
                        post.like_count = max(0, post.like_count - 1)

                # Commit changes
                self.db.commit()

                # Invalidate and update cache
                cache_key = f"post:{post_id}:counts"
                await self.cache.delete(cache_key)

                # Get fresh counts after commit
                fresh_counts = await self._get_interaction_counts(post_id)

                # Update cache with verified counts
                await self.cache.set(
                    cache_key,
                    fresh_counts,
                    expire=self.cache_expiry
                )

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
                    f"{interaction_type}_count": new_count,
                    interaction_type: is_active,  # Return boolean value for frontend
                    "metrics": fresh_counts  # Always include complete metrics
                }

                return result

            except SQLAlchemyError as e:
                if self.db.in_transaction():
                    self.db.rollback()
                logger.error(f"Database error in toggle_interaction: {str(e)}")
                raise DatabaseError(f"Error processing {interaction_type}: {str(e)}")
            except Exception as e:
                if self.db.in_transaction():
                    self.db.rollback()
                logger.error(f"Unexpected error in toggle_interaction: {str(e)}")
                raise DatabaseError(f"Error processing {interaction_type}: {str(e)}")

        except Exception as e:
            logger.error(f"❌ Error in toggle_interaction: {str(e)}")
            raise DatabaseError(f"Error processing {interaction_type}: {str(e)}")

    async def _toggle_save_interaction(
            self,
            post_id: int,
            user_id: int,
            interaction_type_record: InteractionType,
            count_field: str,
            background_tasks: BackgroundTasks,
            metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Special handler for save interactions to prevent transaction conflicts"""
        logger.info(f"Using special save handler for post {post_id}, user {user_id}")

        # Make sure we're not already in a transaction
        if self.db.in_transaction():
            logger.info(f"Rolling back existing transaction before save operation")
            self.db.rollback()

        try:
            # Get post without locking first to verify it exists
            post = self.db.query(Post).filter(Post.post_id == post_id).first()
            if not post:
                raise PostNotFoundError(post_id)

            # Get user
            user = self.db.query(User).filter(User.user_id == user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            # Start transaction
            self.db.begin()

            # Now get with lock
            post = self.db.query(Post).filter(Post.post_id == post_id).with_for_update().first()

            # Check for existing interaction
            existing = self.db.query(PostInteraction).filter(
                PostInteraction.post_id == post_id,
                PostInteraction.user_id == user_id,
                PostInteraction.interaction_type_id == interaction_type_record.interaction_type_id
            ).first()

            # Check if post is in saved_posts
            is_in_saved_posts = False
            for saved_post in user.saved_posts:
                if saved_post.post_id == post_id:
                    is_in_saved_posts = True
                    break

            logger.info(f"Save state: existing={existing is not None}, in_saved_posts={is_in_saved_posts}")

            # Get current count
            current_count = getattr(post, count_field, 0) or 0

            if existing or is_in_saved_posts:
                # REMOVE save
                if existing:
                    self.db.delete(existing)

                if is_in_saved_posts:
                    for saved_post in list(user.saved_posts):
                        if saved_post.post_id == post_id:
                            user.saved_posts.remove(saved_post)
                            break

                # Update count
                new_count = max(0, current_count - 1)
                setattr(post, count_field, new_count)

                action = "removed"
                is_active = False
            else:
                # ADD save
                new_interaction = PostInteraction(
                    post_id=post_id,
                    user_id=user_id,
                    interaction_type_id=interaction_type_record.interaction_type_id,
                    target_type="POST",
                    interaction_metadata=metadata
                )
                self.db.add(new_interaction)

                user.saved_posts.append(post)

                # Update count
                new_count = current_count + 1
                setattr(post, count_field, new_count)

                action = "added"
                is_active = True

            # Commit changes
            self.db.commit()
            logger.info(f"Save {action} successful")

            # Update cache
            cache_key = f"post:{post_id}:counts"
            await self.cache.delete(cache_key)

            # Get fresh counts (using the new session)
            fresh_counts = {}
            for interaction_name in self.VALID_INTERACTIONS:
                count_key = f"{interaction_name}_count"
                actual_count = self.db.query(PostInteraction).join(InteractionType).filter(
                    PostInteraction.post_id == post_id,
                    InteractionType.interaction_type_name == interaction_name
                ).count()
                fresh_counts[count_key] = actual_count

            # Update cache with verified counts
            await self.cache.set(
                cache_key,
                fresh_counts,
                expire=self.cache_expiry
            )

            # Record metric in background
            background_tasks.add_task(
                self.metrics.record_interaction,
                post_id,
                user_id,
                "save",
                action,
                metadata
            )

            result = {
                "message": f"save {action} successfully",
                "save_count": new_count,
                "save": is_active,
                "metrics": fresh_counts
            }

            return result

        except Exception as e:
            if self.db.in_transaction():
                self.db.rollback()
            logger.error(f"Error in toggle_save: {str(e)}")
            raise DatabaseError(f"Error processing save: {str(e)}")



    '''async def toggle_save(
            self,
            post_id: int,
            user_id: int,
            background_tasks: BackgroundTasks,
    ) -> Dict[str, Any]:
        """
        Specialized version of toggle_interaction just for save operations
        with better transaction handling
        """
        logger.info(f"🔍 Starting save toggle for post {post_id}, user {user_id}")

        # Create a new session specifically for this operation
        # This avoids conflicts with other ongoing transactions
        db_session = SessionLocal()

        try:
            # Get save interaction type record
            save_type = db_session.query(InteractionType).filter(
                InteractionType.interaction_type_name == "save"
            ).first()

            if not save_type:
                raise ValueError("Save interaction type not found")

            logger.info(f"Found save type ID: {save_type.interaction_type_id}")

            # Begin the transaction
            db_session.begin()

            # Get post with for_update to ensure consistency
            post = db_session.query(Post).filter(Post.post_id == post_id).with_for_update().first()

            if not post:
                db_session.rollback()
                raise PostNotFoundError(post_id)

            logger.info(f"Got post {post_id} with current save_count: {post.save_count}")

            # Get user
            user = db_session.query(User).filter(User.user_id == user_id).first()
            if not user:
                db_session.rollback()
                raise HTTPException(status_code=404, detail="User not found")

            logger.info(f"Got user {user_id}")

            # Check for existing interaction
            existing = db_session.query(PostInteraction).filter(
                PostInteraction.post_id == post_id,
                PostInteraction.user_id == user_id,
                PostInteraction.interaction_type_id == save_type.interaction_type_id
            ).first()

            # Check if post is in user's saved_posts
            saved_posts_ids = [p.post_id for p in user.saved_posts]
            is_in_saved_posts = post_id in saved_posts_ids

            logger.info(f"Existing interaction: {existing is not None}, In saved_posts: {is_in_saved_posts}")

            # Get current save count (with null check)
            current_save_count = post.save_count or 0

            if existing or is_in_saved_posts:
                # REMOVE the save
                logger.info(f"Removing save for post {post_id}, user {user_id}")

                # Try to remove the interaction record if it exists
                if existing:
                    try:
                        db_session.delete(existing)
                        logger.info(f"Deleted existing interaction record")
                    except Exception as e:
                        logger.error(f"Error deleting interaction: {str(e)}")
                        db_session.rollback()
                        raise DatabaseError(f"Error removing save interaction: {str(e)}")

                # Try to remove from saved_posts if it exists
                if is_in_saved_posts:
                    try:
                        for saved_post in list(user.saved_posts):
                            if saved_post.post_id == post_id:
                                user.saved_posts.remove(saved_post)
                                break
                        logger.info(f"Removed post from user's saved_posts")
                    except Exception as e:
                        logger.error(f"Error removing from saved_posts: {str(e)}")
                        db_session.rollback()
                        raise DatabaseError(f"Error removing from saved_posts: {str(e)}")

                # Update the save count
                new_save_count = max(0, current_save_count - 1)
                post.save_count = new_save_count
                logger.info(f"Updated save_count: {current_save_count} -> {new_save_count}")

                action = "removed"
                is_active = False

            else:
                # ADD the save
                logger.info(f"Adding save for post {post_id}, user {user_id}")

                # Add a new interaction record
                try:
                    new_interaction = PostInteraction(
                        post_id=post_id,
                        user_id=user_id,
                        interaction_type_id=save_type.interaction_type_id,
                        target_type="POST"
                    )
                    db_session.add(new_interaction)
                    logger.info(f"Added new interaction record")
                except Exception as e:
                    logger.error(f"Error adding interaction: {str(e)}")
                    db_session.rollback()
                    raise DatabaseError(f"Error adding save interaction: {str(e)}")

                # Add to saved_posts
                try:
                    user.saved_posts.append(post)
                    logger.info(f"Added post to user's saved_posts")
                except Exception as e:
                    logger.error(f"Error adding to saved_posts: {str(e)}")
                    db_session.rollback()
                    raise DatabaseError(f"Error adding to saved_posts: {str(e)}")

                # Update the save count
                new_save_count = current_save_count + 1
                post.save_count = new_save_count
                logger.info(f"Updated save_count: {current_save_count} -> {new_save_count}")

                action = "added"
                is_active = True

            # Try to commit the changes
            try:
                db_session.commit()
                logger.info(f"Successfully committed save {action} transaction")
            except Exception as e:
                logger.error(f"Error committing changes: {str(e)}")
                db_session.rollback()
                raise DatabaseError(f"Error saving changes: {str(e)}")

            # For the cache operations, use the original self.cache
            # Update cache
            cache_key = f"post:{post_id}:counts"
            await self.cache.delete(cache_key)
            logger.info(f"Deleted cache key: {cache_key}")

            # Get fresh counts
            fresh_counts = {}
            for interaction_type in self.VALID_INTERACTIONS:
                count = db_session.query(PostInteraction).join(InteractionType).filter(
                    PostInteraction.post_id == post_id,
                    InteractionType.interaction_type_name == interaction_type
                ).count()
                fresh_counts[f"{interaction_type}_count"] = count

            logger.info(f"Fresh counts from DB: {fresh_counts}")

            # Update cache
            await self.cache.set(
                cache_key,
                fresh_counts,
                expire=self.cache_expiry
            )
            logger.info(f"Updated cache with fresh counts")

            # Record metric in background
            background_tasks.add_task(
                self.metrics.record_interaction,
                post_id,
                user_id,
                "save",
                action,
                None
            )

            # Build result
            result = {
                "message": f"save {action} successfully",
                "save_count": new_save_count,
                "save": is_active,
                "metrics": fresh_counts
            }

            logger.info(f"Returning result: {result}")
            return result

        except (PostNotFoundError, DatabaseError) as e:
            # Known errors are already handled
            logger.error(f"Known error: {str(e)}")
            raise e
        except Exception as e:
            # Catch any other errors
            logger.error(f"Unexpected error in toggle_save: {str(e)}")
            if db_session.in_transaction():
                db_session.rollback()
            raise DatabaseError(f"Error processing save: {str(e)}")
        finally:
            # Always close the session
            db_session.close()'''

    # Helper method for handling like/dislike exclusivity
    def _handle_like_dislike_exclusivity(self, post, user_id, opposite_type):
        """Helper to handle mutual exclusivity between like and dislike"""
        opposite_type_record = self.db.query(InteractionType).filter(
            InteractionType.interaction_type_name == opposite_type
        ).first()

        if opposite_type_record:
            existing_opposite = self.db.query(PostInteraction).filter(
                PostInteraction.post_id == post.post_id,
                PostInteraction.user_id == user_id,
                PostInteraction.interaction_type_id == opposite_type_record.interaction_type_id
            ).first()

            if existing_opposite:
                self.db.delete(existing_opposite)
                # Update the count
                count_field = f"{opposite_type}_count"
                current_opposite_count = getattr(post, count_field, 0) or 0
                setattr(post, count_field, max(0, current_opposite_count - 1))

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
        """Handle post saves using specialized toggle_save method"""
        return await self.toggle_save(
            post_id=post_id,
            user_id=user_id,
            background_tasks=background_tasks
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
            # Fetch actual interaction records instead of just names
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
            interaction_types = [i.interaction_type.interaction_type_name for i in interactions]

            return {
                "like": "like" in interaction_types,
                "dislike": "dislike" in interaction_types,
                "save": "save" in interaction_types,
                "share": "share" in interaction_types,
                "report": "report" in interaction_types
            }
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

    async def reconcile_saved_post(self, post_id: int, user_id: int):
        """
        Ensure saved_posts and PostInteraction records are in sync for a user/post pair.
        This method creates a new transaction to fix any inconsistencies between the
        two different ways of tracking saved posts.
        """
        logger.info(f"Starting reconciliation for post {post_id}, user {user_id}")

        # Use a fresh database session to avoid transaction conflicts
        if self.db.in_transaction():
            self.db.rollback()

        try:
            # Begin a new transaction
            self.db.begin()

            # Get save interaction type
            save_type = self.db.query(InteractionType).filter(
                InteractionType.interaction_type_name == "save"
            ).first()

            if not save_type:
                logger.error("Save interaction type not found")
                self.db.rollback()
                return

            # Check if interaction exists
            existing_interaction = self.db.query(PostInteraction).filter(
                PostInteraction.post_id == post_id,
                PostInteraction.user_id == user_id,
                PostInteraction.interaction_type_id == save_type.interaction_type_id
            ).first()

            # Get user and post
            user = self.db.query(User).filter(User.user_id == user_id).first()
            post = self.db.query(Post).filter(Post.post_id == post_id).first()

            if not user or not post:
                logger.error(f"User {user_id} or post {post_id} not found")
                self.db.rollback()
                return

            # Check if post is in saved_posts
            is_in_saved_posts = False
            for saved_post in user.saved_posts:
                if saved_post.post_id == post_id:
                    is_in_saved_posts = True
                    break

            logger.info(
                f"Reconciliation state: interaction_exists={existing_interaction is not None}, is_in_saved_posts={is_in_saved_posts}")

            # Reconcile differences
            if existing_interaction and not is_in_saved_posts:
                # Add to saved_posts
                user.saved_posts.append(post)
                logger.info(f"Reconciled: Added post {post_id} to user {user_id}'s saved_posts")
            elif is_in_saved_posts and not existing_interaction:
                # Add interaction
                new_interaction = PostInteraction(
                    post_id=post_id,
                    user_id=user_id,
                    interaction_type_id=save_type.interaction_type_id,
                    target_type="POST"
                )
                self.db.add(new_interaction)
                logger.info(f"Reconciled: Added save interaction for post {post_id}, user {user_id}")

            # Update post.save_count to reflect the correct state
            actual_count = self.db.query(PostInteraction).filter(
                PostInteraction.post_id == post_id,
                PostInteraction.interaction_type_id == save_type.interaction_type_id
            ).count()

            if post.save_count != actual_count:
                logger.info(f"Reconciled: Updating post.save_count from {post.save_count} to {actual_count}")
                post.save_count = actual_count

            # Commit the changes
            self.db.commit()
            logger.info("Reconciliation completed successfully")

            # Also update the cache
            cache_key = f"post:{post_id}:counts"
            await self.cache.delete(cache_key)

        except Exception as e:
            logger.error(f"Error in reconcile_saved_post: {str(e)}")
            if self.db.in_transaction():
                self.db.rollback()

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



