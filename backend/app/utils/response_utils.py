from typing import Optional, Any, Dict


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