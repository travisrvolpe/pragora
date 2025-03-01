# app/middleware/cors_middleware.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

logger = logging.getLogger(__name__)


def setup_cors_middleware(app: FastAPI):
    """Set up CORS middleware - minimal version"""

    # Add standard CORSMiddleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*", "Authorization", "Content-Type"],
        expose_headers=["Content-Type", "Content-Length"],
        max_age=3600
    )

    logger.info("CORS middleware configured")

    return app