# app/utils/token_debug.py
from jose import jwt
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


def verify_and_debug_token(token: str) -> dict:
    """Debug utility for token verification"""
    try:
        logger.info(f"Attempting to decode token: {token[:20]}...")
        logger.info(f"Using secret key: {settings.JWT_SECRET_KEY[:5]}...")

        decoded = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=["HS256"]
        )

        logger.info(f"Successfully decoded token payload: {decoded}")
        return decoded
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        return None