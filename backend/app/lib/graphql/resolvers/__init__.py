# app/lib/graphql/resolvers/__init__.py
from typing import Dict, Any
from .comments import CommentResolvers
from app.services.comment_service import CommentService
from database.database import SessionLocal

def get_resolvers() -> Dict[str, Any]:
    """Get all resolvers for the GraphQL schema"""
    db = SessionLocal()
    comment_service = CommentService(db)
    comment_resolvers = CommentResolvers(comment_service)

    return {
        "Query": {
            "comment": comment_resolvers.resolve_comment,
            "comments": comment_resolvers.resolve_comments,
        },
        "Mutation": {
            "createComment": comment_resolvers.resolve_create_comment,
            "updateComment": comment_resolvers.resolve_update_comment,
            "deleteComment": comment_resolvers.resolve_delete_comment,
            "likeComment": comment_resolvers.resolve_like_comment,
            "dislikeComment": comment_resolvers.resolve_dislike_comment,
            "reportComment": comment_resolvers.resolve_report_comment,
        },
        "Subscription": {
            "commentAdded": comment_resolvers.resolve_comment_added,
            "commentUpdated": comment_resolvers.resolve_comment_updated,
            "commentDeleted": comment_resolvers.resolve_comment_deleted,
            "commentActivity": comment_resolvers.resolve_comment_activity,
        }
    }

__all__ = ['get_resolvers']
