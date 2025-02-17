# app/middleware/auth_middleware.py
from typing import Optional, List
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from app.core.config import settings
from app.auth.utils import get_current_user
from app.datamodels.datamodels import User
from database.database import SessionLocal
import logging
import json

logger = logging.getLogger(__name__)


class AuthMiddleware:
    def __init__(self):
        self.public_paths: List[str] = [
            "/auth/login",
            "/auth/register",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/",
        ]
        self.graphql_path = "/graphql"

    def is_public_path(self, path: str) -> bool:
        return any(path.startswith(public_path) for public_path in self.public_paths)

    async def get_token_from_request(self, request: Request) -> Optional[str]:
        """Extract auth token from various sources"""
        # Try Authorization header
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header[7:]

        # Handle WebSocket upgrade requests
        if request.headers.get("upgrade", "").lower() == "websocket":
            # Try query parameters for WebSocket
            token = request.query_params.get("token")
            if token:
                return token

        # Handle GraphQL specific cases
        if request.url.path == self.graphql_path:
            try:
                # Try parsing the body for GraphQL requests
                body = await request.body()
                if body:
                    data = json.loads(body)

                    # Check for token in payload (subscription)
                    if 'payload' in data and 'Authorization' in data['payload']:
                        auth = data['payload']['Authorization']
                        if auth.startswith('Bearer '):
                            return auth[7:]
                        return auth

                    # Check for token in extensions (query/mutation)
                    if 'extensions' in data and 'authorization' in data['extensions']:
                        auth = data['extensions']['authorization']
                        if auth.startswith('Bearer '):
                            return auth[7:]
                        return auth

            except Exception as e:
                logger.debug(f"Error parsing request body: {str(e)}")
                pass

        return None

    async def authenticate_request(self, request: Request) -> Optional[User]:
        """Authenticate the request and return user if valid"""
        db = SessionLocal()
        try:
            token = await self.get_token_from_request(request)
            if not token:
                return None

            user = await get_current_user(request, token, db)
            if user:
                logger.info(f"Successfully authenticated user {user.user_id}")
            return user

        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return None
        finally:
            db.close()

    async def __call__(self, request: Request, call_next):
        """Process the request"""
        # Skip auth for public paths and OPTIONS
        if self.is_public_path(request.url.path) or request.method == "OPTIONS":
            return await call_next(request)

        # Special handling for GraphQL
        if request.url.path == self.graphql_path:
            user = await self.authenticate_request(request)
            if user:
                request.state.user = user
            return await call_next(request)

        # Regular request authentication
        user = await self.authenticate_request(request)
        if not user:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Authentication required"}
            )

        request.state.user = user
        logger.info(f"Authenticated user {user.user_id} for {request.url.path}")

        return await call_next(request)


# Create instance
auth_middleware = AuthMiddleware()