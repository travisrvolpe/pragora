# app/core/auth_constants.py
from app.core.config import settings

# Centralized auth constants
JWT_SECRET_KEY = settings.JWT_SECRET_KEY
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Export constants
__all__ = ['JWT_SECRET_KEY', 'JWT_ALGORITHM', 'ACCESS_TOKEN_EXPIRE_MINUTES']