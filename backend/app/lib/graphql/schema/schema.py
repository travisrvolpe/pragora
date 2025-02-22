# backend/app/lib/graphql/schema/schema.py
import strawberry
import logging
#from dataclasses import asdict
from typing import AsyncGenerator, List, Optional
from strawberry.types import Info
from datetime import datetime
from database.database import SessionLocal
from app.lib.graphql.subscriptions import (
    comment_added_subscription,
    comment_updated_subscription,
    comment_deleted_subscription,
    comment_activity_subscription
)

from app.schemas.comment_schemas import (
    CommentCreate as CommentCreateModel,
    CommentResponse,
    CommentMetrics as CommentMetricsModel
)

from app.services.comment_service import CommentService
from app.lib.graphql.context import get_authenticated_context, extract_token
from app.utils.token_debug import verify_and_debug_token
#from app.core.logger import get_logger

logger = logging.getLogger(__name__)

# Type definitions
@strawberry.type
class User:
    user_id: int
    username: str
    email: str
    avatar_img: Optional[str]
    reputation_score: Optional[int]
    expertise_area: Optional[str]
    credentials: Optional[str]
    created_at: str
    updated_at: Optional[str]

@strawberry.type
class CommentMetrics:
    like_count: int
    dislike_count: int
    reply_count: int
    report_count: int

@strawberry.type
class CommentInteractionState:
    like: bool
    dislike: bool
    report: bool

@strawberry.type
class CommentActivity:
    comment_id: int
    active_viewers: int
    last_activity: str

@strawberry.type
class Comment:
    comment_id: int
    content: str
    user_id: int
    post_id: int
    parent_comment_id: Optional[int]
    path: str
    depth: int
    root_comment_id: Optional[int]
    user: User
    username: str
    avatar_img: Optional[str]
    reputation_score: Optional[int]
    metrics: CommentMetrics
    interaction_state: CommentInteractionState
    is_edited: bool
    is_deleted: bool
    created_at: str
    updated_at: Optional[str]
    last_activity: str
    active_viewers: int
    replies: Optional[List['Comment']]

# Input types
@strawberry.input
class CreateCommentInput:
    content: str
    post_id: int
    parent_comment_id: Optional[int] = None

@strawberry.input
class UpdateCommentInput:
    comment_id: int
    content: str
#
# 2. Helper conversion functions: CommentResponse -> Comment
#    Adjust these as needed to match actual field names.
#

def _to_user(u) -> User:
    print(f"Converting user to GraphQL type: {u}")
    print(f"User profile data: {u.profile if hasattr(u, 'profile') else 'No profile'}")
    if not u:
        return User(
            user_id=0,
            username="",
            email="",
            avatar_img=None,
            reputation_score=None,
            expertise_area=None,
            credentials=None,
            created_at="",
            updated_at=None
        )
    return User(
        user_id=u.user_id,
        username=u.username,
        email=u.email,
        avatar_img=u.avatar_img,
        reputation_score=u.reputation_score,
        expertise_area=u.expertise_area,
        credentials=u.credentials,
        created_at=str(u.created_at),
        updated_at=str(u.updated_at) if u.updated_at else None
    )

def _to_comment_metrics(m: CommentMetricsModel) -> CommentMetrics:
    if not m:
        return CommentMetrics(
            like_count=0, dislike_count=0, reply_count=0, report_count=0
        )
    return CommentMetrics(
        like_count=m.like_count,
        dislike_count=m.dislike_count,
        reply_count=m.reply_count,
        report_count=m.report_count
    )


def _to_interaction_state(r) -> CommentInteractionState:
    """Convert interaction state from service response to GraphQL type"""
    if not r:
        return CommentInteractionState(like=False, dislike=False, report=False)

    # Handle both dictionary and object cases
    if isinstance(r, dict):
        interaction_state = r.get('interaction_state', {})
        return CommentInteractionState(
            like=interaction_state.get('like', False),
            dislike=interaction_state.get('dislike', False),
            report=interaction_state.get('report', False)
        )

    # Handle object with interaction_state attribute
    if hasattr(r, 'interaction_state'):
        state = r.interaction_state
        return CommentInteractionState(
            like=getattr(state, 'like', False),
            dislike=getattr(state, 'dislike', False),
            report=getattr(state, 'report', False)
        )

    # Default case
    return CommentInteractionState(like=False, dislike=False, report=False)

def _to_comment(cr: Optional[CommentResponse]) -> Optional[Comment]:
    """
    Convert a CommentResponse (from the service layer) into the
    Strawberry GraphQL Comment type. Handles recursion for replies too.
    """
    if not cr:
        return None

    # Recursively convert replies if present
    nested_replies: Optional[List[Comment]] = None
    if cr.replies:
        nested_replies = [_to_comment(reply) for reply in cr.replies]

    return Comment(
        comment_id=cr.comment_id,
        content=cr.content,
        user_id=cr.user_id,
        post_id=cr.post_id,
        parent_comment_id=cr.parent_comment_id,
        path=cr.path,
        depth=cr.depth,
        root_comment_id=cr.root_comment_id,
        user=_to_user(cr.user),
        username=cr.username,
        avatar_img=cr.avatar_img,
        reputation_score=cr.reputation_score,
        metrics=_to_comment_metrics(cr.metrics),
        interaction_state=_to_interaction_state(cr),
        is_edited=cr.is_edited,
        is_deleted=cr.is_deleted,
        created_at=str(cr.created_at),
        updated_at=str(cr.updated_at) if cr.updated_at else None,
        last_activity=str(cr.last_activity),
        active_viewers=cr.active_viewers,
        replies=nested_replies
    )

#
# 3. Query, Mutation, and Subscription classes that
#    call the service and then convert to Comment
#

@strawberry.type
class Query:
    @strawberry.field
    async def comment(self, info: Info, comment_id: int) -> Optional[Comment]:
        """Fetch a single comment by its comment_id."""
        try:
            db = SessionLocal()
            # Add debug logging
            print(f"Processing comment query for ID: {comment_id}")
            print(f"Auth context: {info.context}")

            user = await get_authenticated_context(info)
            print(f"Authenticated user: {user.user_id if user else 'None'}")

            comment_service = CommentService(db)
            cr = await comment_service.get_comment(
                comment_id=comment_id,
                user_id=user.user_id if user else None
            )
            return _to_comment(cr)
        except Exception as e:
            print(f"Error in comment query: {str(e)}")
            raise
        finally:
            db.close()

    @strawberry.field
    async def comments(
        self,
        info: Info,
        post_id: int,
        parent_comment_id: Optional[int] = None,
        page: int = 1,
        page_size: int = 20
    ) -> List[Comment]:
        """Fetch a list of comments for a given post or parent comment."""
        db = SessionLocal()
        try:
            user = await get_authenticated_context(info)  # This now returns None if not authenticated
            comment_service = CommentService(db)
            cr_list = await comment_service.get_comment_thread(
                post_id=post_id,
                parent_id=parent_comment_id,
                page=page,
                page_size=page_size,
                user_id=user.user_id if user else None
            )
            return [_to_comment(cr) for cr in cr_list if cr is not None]
        finally:
            db.close()


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_comment(self, info: Info, input: CreateCommentInput) -> Comment:
        db = SessionLocal()
        try:
            user = await get_authenticated_context(info)
            if not user:
                raise Exception("Authentication required")

            pydantic_data = CommentCreateModel(**vars(input))
            comment_service = CommentService(db)
            cr = await comment_service.create_comment(
                user_id=user.user_id,
                comment_data=pydantic_data
            )
            return _to_comment(cr)
        finally:
            db.close()

    @strawberry.mutation
    async def update_comment(self, info: Info, input: UpdateCommentInput) -> Comment:
        db = SessionLocal()
        try:
            user = await get_authenticated_context(info)
            if not user:
                raise Exception("Authentication required")

            comment_service = CommentService(db)
            cr = await comment_service.update_comment(
                comment_id=input.comment_id,
                user_id=user.user_id,
                content=input.content
            )
            return _to_comment(cr)
        finally:
            db.close()

    @strawberry.mutation
    async def delete_comment(self, info: Info, comment_id: int) -> bool:
        db = SessionLocal()
        try:
            user = await get_authenticated_context(info)
            if not user:
                raise Exception("Authentication required")

            comment_service = CommentService(db)
            result = await comment_service.delete_comment(
                comment_id=comment_id,
                user_id=user.user_id
            )
            return result.get("status") == "success"
        finally:
            db.close()

    @strawberry.mutation
    async def like_comment(self, info: Info, comment_id: int) -> Comment:
        db = SessionLocal()
        try:
            user = await get_authenticated_context(info)
            if not user:
                raise Exception("Authentication required")

            comment_service = CommentService(db)
            cr = await comment_service.handle_interaction(
                comment_id=comment_id,
                user_id=user.user_id,
                interaction_type="like"
            )
            return _to_comment(cr)
        finally:
            db.close()

    @strawberry.mutation
    async def dislike_comment(self, info: Info, comment_id: int) -> Comment:
        db = SessionLocal()
        try:
            user = await get_authenticated_context(info)
            if not user:
                raise Exception("Authentication required")

            comment_service = CommentService(db)
            cr = await comment_service.handle_interaction(
                comment_id=comment_id,
                user_id=user.user_id,
                interaction_type="dislike"
            )
            return _to_comment(cr)
        finally:
            db.close()

    @strawberry.mutation
    async def report_comment(
        self,
        info: Info,
        comment_id: int,
        reason: str
    ) -> Comment:
        db = SessionLocal()
        try:
            user = await get_authenticated_context(info)
            if not user:
                raise Exception("Authentication required")

            comment_service = CommentService(db)
            cr = await comment_service.handle_interaction(
                comment_id=comment_id,
                user_id=user.user_id,
                interaction_type="report",
                metadata={"reason": reason}
            )
            return _to_comment(cr)
        finally:
            db.close()


@strawberry.type
class Subscription:
    @strawberry.subscription
    async def comment_added(self, info: Info, post_id: int) -> AsyncGenerator[Comment, None]:
        """Subscribe to new comments on a post"""
        db = SessionLocal()
        try:
            user = await get_authenticated_context(info)
            if not user:
                logger.error("Authentication required for subscription")
                raise Exception("Authentication required for subscription")

            logger.info(f"User {user.user_id} subscribed to comments for post {post_id}")
            comment_service = CommentService(db)
            async for cr in comment_added_subscription(post_id):
                comment = await comment_service.get_comment(cr.comment_id, user.user_id)
                logger.debug(f"New comment {cr.comment_id} broadcast to user {user.user_id}")
                yield _to_comment(comment)
        except Exception as e:
            logger.error(f"Error in comment subscription: {str(e)}")
            raise
        finally:
            db.close()

    @strawberry.subscription
    async def comment_updated(self, post_id: int) -> AsyncGenerator[Comment, None]:
        """Subscribe to comment updates on a post"""
        db = SessionLocal()
        try:
            comment_service = CommentService(db)
            async for cr in comment_updated_subscription(post_id):
                yield _to_comment(
                    await comment_service.get_comment(cr.comment_id)
                )
        finally:
            db.close()

    @strawberry.subscription
    async def comment_deleted(self, post_id: int) -> AsyncGenerator[str, None]:
        """Subscribe to comment deletions on a post"""
        async for comment_id in comment_deleted_subscription(post_id):
            yield comment_id

    @strawberry.subscription
    async def comment_activity(self, post_id: int) -> AsyncGenerator[CommentActivity, None]:
        """Subscribe to comment activity updates"""
        db = SessionLocal()
        try:
            comment_service = CommentService(db)
            async for activity in comment_activity_subscription(post_id):
                yield CommentActivity(
                    comment_id=activity["comment_id"],
                    active_viewers=activity["active_viewers"],
                    last_activity=activity["last_activity"]
                )
        finally:
            db.close()

# Create the schema
schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription
)

# Explicitly export the classes
__all__ = ['Query', 'Mutation', 'Subscription', 'schema']