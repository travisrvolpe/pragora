# core/config.py
import os
from pydantic_settings import BaseSettings

# Get the absolute path to the project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Settings(BaseSettings):
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_PASSWORD: str = "" # Optional[str] = None
    REDIS_SSL: bool = False
    REDIS_TIMEOUT: int = 5
    REDIS_ENABLED: bool = True
    #REDIS_CONNECTION_KWARGS: dict = {
    #    'encoding': 'utf-8',
    #    'decode_responses': True,
    #    'socket_timeout': 5.0,
    #    'socket_connect_timeout': 5.0,
    #    'retry_on_timeout': True,
    #    'health_check_interval': 30
    #}

    JWT_SECRET_KEY: str
    DATABASE_URL: str

    # Media settings
    MEDIA_ROOT: str = "/home/notsure/pragora/backend/media"
    STATIC_ROOT: str = "/home/notsure/pragora/backend/static"
    DEFAULT_AVATAR_URL: str = "/home/notsure/pragora/frontend/pragora-frontend/public/images/avatars/default_avatar.png"
    POSTS_MEDIA_DIR: str = os.path.join(MEDIA_ROOT, "media", "posts")
    AVATAR_DIR: str = os.path.join(MEDIA_ROOT, "avatars")
    #DEFAULT_AVATAR_URL: str = "/home/notsure/pragora/frontend/pragora-frontend/src/assets/ZERO.PNG"

    # Make sure there's a frontend URL configured
    FRONTEND_URL: str = "http://localhost:3000"

    # Metric settings
    METRICS_ENABLED: bool = True
    METRICS_RETENTION_DAYS: int = 30 # Should this be forever?
    METRICS_AGGREGATION_WINDOW: int = 300  # 5 minutes in seconds
    CACHE_EXPIRY_SECONDS: int = 300  # 5 minutes

    class Config:
        env_file = ".env"


    def create_media_directories(self):
        """Ensure media directories exist"""
        os.makedirs(self.MEDIA_ROOT, exist_ok=True)
        os.makedirs(self.POSTS_MEDIA_DIR, exist_ok=True)
        os.makedirs(self.AVATAR_DIR, exist_ok=True)


settings = Settings()
settings.create_media_directories()

# Create necessary directories if they don't exist - is this needed?
os.makedirs(os.path.join(settings.MEDIA_ROOT, "avatars"), exist_ok=True)
os.makedirs(settings.STATIC_ROOT, exist_ok=True)