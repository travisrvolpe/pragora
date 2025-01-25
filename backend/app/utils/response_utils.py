from typing import Optional, Any, Dict, List, TypeVar

ResponseType = Dict[str, Any]

def create_response(
        message: str,
        data: Optional[Dict[str, Any]] = None,
        status: str = "success",
        meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Create a standardized API response.

    Args:
        message: Response message
        data: Response payload
        status: Response status ("success" or "error")
        meta: Additional metadata (pagination, etc.)
    """
    response = {
        "status": status,
        "message": message,
        "data": data or {}
    }

    if meta:
        response["meta"] = meta

    return response

def create_paginated_response(
        message: str,
        items: List[Dict[str, Any]],
        total: int,
        page: int,
        per_page: int,
        status: str = "success"
) -> Dict[str, Any]:
    """
    Create a paginated API response for lists (e.g., comments).

    Args:
        message: Response message
        items: List of items to include in the response
        total: Total number of items
        page: Current page number
        per_page: Number of items per page
        status: Response status ("success" or "error")
    """
    meta = {
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page  # Calculate total pages
    }

    return create_response(
        message=message,
        data={"items": items},
        status=status,
        meta=meta
    )
