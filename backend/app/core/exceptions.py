# app/core/exceptions.py
from fastapi import HTTPException
from typing import Any, Dict, Optional

class BaseCustomError(HTTPException):
    """Base class for custom exceptions"""
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)

class PostEngagementError(BaseCustomError):
    """Base exception for post engagement errors"""
    def __init__(self, detail: str, status_code: int = 400):
        super().__init__(status_code=status_code, detail=detail)

class PostNotFoundError(PostEngagementError):
    """Raised when a post is not found"""
    def __init__(self, post_id: int):
        super().__init__(
            detail=f"Post {post_id} not found",
            status_code=404
        )

class InteractionError(PostEngagementError):
    """Raised when there's an error with post interactions"""
    pass

class InvalidInteractionTypeError(InteractionError):
    """Raised when an invalid interaction type is provided"""
    def __init__(self, interaction_type: str):
        super().__init__(
            detail=f"Invalid interaction type: {interaction_type}",
            status_code=400
        )

class DuplicateInteractionError(InteractionError):
    """Raised when a duplicate interaction is attempted"""
    def __init__(self, interaction_type: str):
        super().__init__(
            detail=f"Duplicate {interaction_type} interaction",
            status_code=409
        )

class DatabaseError(PostEngagementError):
    """Raised when a database operation fails"""
    def __init__(self, operation: str):
        super().__init__(
            detail=f"Database error during {operation}",
            status_code=500
        )

class CacheError(PostEngagementError):
    """Raised when a cache operation fails"""
    def __init__(self, operation: str):
        super().__init__(
            detail=f"Cache error during {operation}",
            status_code=500
        )