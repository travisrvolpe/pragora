from typing import Optional, Any, Dict, List, TypeVar
from pydantic import BaseModel, Field
from fastapi import HTTPException

ResponseType = Dict[str, Any]

class Response(BaseModel):
    status: str = "success"
    message: str
    data: Dict[str, Any] = Field(default_factory=dict)
    meta: Optional[Dict[str, Any]] = None

def create_response(
    message: str,
    data: Optional[Dict[str, Any]] = None,
    status: str = "success",
    meta: Optional[Dict[str, Any]] = None
) -> Response:
    """
    Create a standardized API response.
    """
    response = Response(
        status=status,
        message=message,
        data=data or {},
        meta=meta,
    )

    return response

class PaginatedResponse(BaseModel):
    status: str = "success"
    message: str
    data: Dict[str, List]
    meta: Dict[str, int]


def create_paginated_response(
        message: str,
        items: List[Dict[str, Any]],
        total: int,
        page: int,
        per_page: int,
        status: str = "success"
) -> PaginatedResponse:

    meta = {
      "total": total,
      "page": page,
      "per_page": per_page,
      "pages": (total + per_page - 1) // per_page  # Calculate total pages
    }

    response = PaginatedResponse(
      status=status,
      message=message,
      data={"items": items},
      meta=meta
    )

    return response