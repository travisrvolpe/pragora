def create_response(message: str, data: dict = None, status: str = "success"):
    """Create a consistent API response structure."""
    return {
        "status": status,
        "message": message,
        "data": data or {}
    }
