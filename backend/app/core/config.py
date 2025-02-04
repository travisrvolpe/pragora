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

    JWT_SECRET_KEY: str
    DATABASE_URL: str

    # Media settings
    MEDIA_ROOT: str = os.path.join(PROJECT_ROOT, "media")
    POSTS_MEDIA_DIR: str = os.path.join(MEDIA_ROOT, "media", "posts")

    # Metric settings
    METRICS_ENABLED: bool = True
    METRICS_RETENTION_DAYS: int = 30
    METRICS_AGGREGATION_WINDOW: int = 300  # 5 minutes in seconds
    CACHE_EXPIRY_SECONDS: int = 300  # 5 minutes

    class Config:
        env_file = ".env"

    def create_media_directories(self):
        """Ensure media directories exist"""
        os.makedirs(self.MEDIA_ROOT, exist_ok=True)
        os.makedirs(self.POSTS_MEDIA_DIR, exist_ok=True)


settings = Settings()
settings.create_media_directories()
