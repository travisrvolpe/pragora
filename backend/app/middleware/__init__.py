# app/middleware/__init__.py
from .cors_middleware import setup_cors_middleware
from .auth_middleware import auth_middleware
from .profile_middleware import validate_user_profile

__all__ = ['setup_cors_middleware', 'auth_middleware', 'validate_user_profile']