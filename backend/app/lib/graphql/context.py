# app/applib/graphql/context.py
import logging
from typing import Optional, Any, Dict
from sqlalchemy.orm import Session
from strawberry.fastapi import BaseContext
from database.database import SessionLocal
from app.datamodels.datamodels import User
from app.auth.utils import get_current_user
from app.utils.token_debug import verify_and_debug_token
from fastapi import Request

logger = logging.getLogger(__name__)


class GraphQLContext(BaseContext):
    def __init__(
            self,
            db: Session,
            user: Optional[User] = None,
            request: Optional[Request] = None,
            connection_params: Optional[Dict[str, Any]] = None
    ):
        super().__init__()
        self.db = db
        self._user = user
        self.request = request
        self.connection_params = connection_params

    @property
    def user(self) -> Optional[User]:
        return self._user


async def extract_token(request: Any, connection_params: Optional[Dict[str, Any]] = None) -> Optional[str]:
    """Extract token from request headers or connection params"""
    token = None

    # Try connection params first (for WebSocket)
    if connection_params and "Authorization" in connection_params:
        auth = connection_params["Authorization"]
        if auth.startswith("Bearer "):
            token = auth[7:]
        else:
            token = auth
        logger.info(f"Found token in connection params: {token[:20]}...")
        return token

    # Try request headers
    if request and hasattr(request, "headers"):
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
        else:
            token = auth_header
        if token:
            logger.info(f"Found token in headers: {token[:20]}...")
            return token

    return None


async def authenticate_user(token: str, db: Session, request: Any = None) -> Optional[User]:
    """Authenticate user from token"""
    try:
        if not token:
            logger.warning("No token provided for authentication")
            return None

        user = await get_current_user(request, token, db)
        if user:
            logger.info(f"Successfully authenticated user {user.user_id}")
            return user

        logger.warning("No user found for valid token")
        return None

    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        if token:
            verify_and_debug_token(token)  # Debug the token if available
        return None

async def get_context(request: Any = None, connection_params: Optional[Dict[str, Any]] = None) -> GraphQLContext:
    logger.info(f"GraphQL context request headers: {request.headers if request else 'No request'}")
    db = SessionLocal()
    user = None

    try:
        # Get token from multiple sources
        token = None
        if connection_params and "Authorization" in connection_params:
            token = connection_params["Authorization"].replace("Bearer ", "")
        elif request and request.headers.get("Authorization"):
            token = request.headers["Authorization"].replace("Bearer ", "")

        if token:
            try:
                user = await get_current_user(request, token, db)
                logger.info(f"Authenticated user {user.user_id} in GraphQL context")
            except Exception as e:
                logger.error(f"Auth error in context: {e}")

        return GraphQLContext(
            db=db,
            user=user,
            request=request,
            connection_params=connection_params
        )
    except Exception as e:
        logger.error(f"Context error: {e}")
        return GraphQLContext(
            db=db,
            user=None,
            request=request,
            connection_params=connection_params
        )


async def get_authenticated_context(info) -> Optional[User]:
    """Get authenticated user from context"""
    try:
        context = info.context

        if not hasattr(context, 'user'):
            logger.error("Context missing user attribute")
            return None

        if not context.user:
            token = await extract_token(context.request, context.connection_params)
            if token:
                user = await authenticate_user(token, context.db, context.request)
                if user:
                    # Update context with authenticated user
                    context._user = user
                    return user

            logger.error("No authenticated user in context")
            return None

        return context.user

    except Exception as e:
        logger.error(f"Error in get_authenticated_context: {str(e)}")
        return None