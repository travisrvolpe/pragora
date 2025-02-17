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

logger = logging.getLogger(__name__)


class AuthMiddleware:
    def __init__(self):
        # Define public paths that don't need authentication
        self.public_paths: List[str] = [
            "/auth/login",
            "/auth/register",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/",  # Root path
        ]
        self.graphql_path = "/graphql"

    def is_public_path(self, path: str) -> bool:
        return any(path.startswith(public_path) for public_path in self.public_paths)

    async def get_token_from_request(self, request: Request) -> Optional[str]:
        """Extract token from various sources in the request"""
        # Try Authorization header first
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            return auth_header.split(" ")[1]

        # For WebSocket requests, check query parameters
        if "ws" in request.url.scheme and "token" in request.query_params:
            return request.query_params["token"]

        # For GraphQL WebSocket connections, check connection params
        if request.url.path == self.graphql_path and hasattr(request, 'json'):
            try:
                body = await request.json()
                if 'payload' in body and 'Authorization' in body['payload']:
                    return body['payload']['Authorization'].replace('Bearer ', '')
            except:
                pass

        return None

    async def authenticate_request(self, request: Request) -> Optional[User]:
        """Authenticate a request and return the user if valid"""
        db = SessionLocal()
        try:
            token = await self.get_token_from_request(request)
            if not token:
                return None

            # Use existing get_current_user function
            user = await get_current_user(request, token, db)
            return user

        except JWTError as e:
            logger.error(f"JWT validation error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return None
        finally:
            db.close()

    async def handle_graphql(self, request: Request) -> Optional[User]:
        """Special handling for GraphQL requests"""
        try:
            user = await self.authenticate_request(request)
            if user:
                request.state.user = user
            return user
        except Exception as e:
            logger.error(f"GraphQL authentication error: {str(e)}")
            return None

    async def __call__(self, request: Request, call_next):
        """Main middleware function"""
        # Skip auth for public paths
        if self.is_public_path(request.url.path):
            return await call_next(request)

        # Handle OPTIONS requests for CORS
        if request.method == "OPTIONS":
            return await call_next(request)

        # Special handling for GraphQL
        if request.url.path == self.graphql_path:
            await self.handle_graphql(request)
            return await call_next(request)

        # Handle WebSocket upgrade requests
        if request.headers.get("upgrade", "").lower() == "websocket":
            user = await self.authenticate_request(request)
            if not user:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Could not validate WebSocket credentials"}
                )
            request.state.user = user
            return await call_next(request)

        # Regular HTTP request authentication
        user = await self.authenticate_request(request)
        if not user:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Could not validate credentials"}
            )

        # Store authenticated user in request state
        request.state.user = user

        # Log successful authentication
        logger.info(f"Authenticated user {user.user_id} for path {request.url.path}")

        return await call_next(request)


# Create middleware instance
auth_middleware = AuthMiddleware()