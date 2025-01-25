# app/utils/error_handlers.py
# To centralize error handling logic. You could define custom exception classes and handlers that transform database
# exceptions and other errors into user-friendly API responses. This promotes consistent error reporting across your application.

from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from fastapi.responses import JSONResponse
from fastapi import Request

def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
            status_code=500,
            content={"detail": "Database error occurred"}
        )

def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
            status_code=500,
            content={"detail": "An internal error occurred"}
    )