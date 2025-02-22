from typing import Optional, Any, Dict, List
from pydantic import BaseModel,  model_validator

ResponseType = Dict[str, Any]

class Response(BaseModel):
    status: str = "success"
    message: str
    #data: Dict[str, Any] = Field(default_factory=dict)
    meta: Optional[Dict[str, Any]] = None
    data: Dict[str, Any]

    @classmethod
    @model_validator(mode='before')
    def set_defaults(cls, values):
        if not isinstance(values, dict):
            return values
        if 'data' not in values:
            values['data'] = {}
        return values

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