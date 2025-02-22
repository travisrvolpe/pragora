# backend/app/lib/graphql/resolvers/comments.py

from typing import List, Optional
from datetime import datetime
from strawberry.types import Info
from app.services.comment_service import CommentService
from app.schemas.comment_schemas import CommentCreate, CommentResponse

class CommentResolvers:
    def __init__(self, comment_service: CommentService):
        self.comment_service = comment_service

    async def get_comments(
        self,
        info: Info,
        post_id: int,
        parent_comment_id: Optional[int] = None,
        page: int = 1,
        page_size: int = 20
    ) -> List[CommentResponse]:
        """Query resolver for fetching multiple comments"""
        if not info.context.user:
            # You might want to allow public viewing of comments
            # If so, remove this check
            raise Exception("Authentication required")

        return await self.comment_service.get_comment_thread(
            post_id=post_id,
            parent_id=parent_comment_id,
            page=page,
            page_size=page_size
        )

    async def get_comment(
        self,
        info: Info,
        comment_id: int
    ) -> Optional[CommentResponse]:
        """Query resolver for fetching a single comment"""
        if not info.context.user:
            raise Exception("Authentication required")

        return await self.comment_service.get_comment(comment_id=comment_id)

    async def create_comment(
        self,
        info: Info,
        input: CommentCreate
    ) -> CommentResponse:
        """Mutation resolver for creating a comment"""
        if not info.context.user:
            raise Exception("Authentication required")

        return await self.comment_service.create_comment(
            user_id=info.context.user.user_id,
            comment_data=input
        )

    async def update_comment(
        self,
        info: Info,
        input: dict
    ) -> CommentResponse:
        """Mutation resolver for updating a comment"""
        if not info.context.user:
            raise Exception("Authentication required")

        return await self.comment_service.update_comment(
            comment_id=input["comment_id"],
            user_id=info.context.user.user_id,
            content=input["content"]
        )

    async def delete_comment(
        self,
        info: Info,
        comment_id: int
    ) -> bool:
        """Mutation resolver for deleting a comment"""
        if not info.context.user:
            raise Exception("Authentication required")

        result = await self.comment_service.delete_comment(
            comment_id=comment_id,
            user_id=info.context.user.user_id
        )
        return result["status"] == "success"

    async def like_comment(
        self,
        info: Info,
        comment_id: int
    ) -> CommentResponse:
        """Mutation resolver for liking a comment"""
        if not info.context.user:
            raise Exception("Authentication required")

        return await self.comment_service.handle_interaction(
            comment_id=comment_id,
            user_id=info.context.user.user_id,
            interaction_type="like"
        )

    async def dislike_comment(
        self,
        info: Info,
        comment_id: int
    ) -> CommentResponse:
        """Mutation resolver for disliking a comment"""
        if not info.context.user:
            raise Exception("Authentication required")

        return await self.comment_service.handle_interaction(
            comment_id=comment_id,
            user_id=info.context.user.user_id,
            interaction_type="dislike"
        )

    async def report_comment(
        self,
        info: Info,
        comment_id: int,
        reason: str
    ) -> CommentResponse:
        """Mutation resolver for reporting a comment"""
        if not info.context.user:
            raise Exception("Authentication required")

        return await self.comment_service.handle_interaction(
            comment_id=comment_id,
            user_id=info.context.user.user_id,
            interaction_type="report",
            metadata={"reason": reason}
        )