# core/config.py
import os
from pydantic_settings import BaseSettings

# Get the absolute path to the project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Settings(BaseSettings):
    JWT_SECRET_KEY: str
    DATABASE_URL: str

    # Media settings
    MEDIA_ROOT: str = os.path.join(PROJECT_ROOT, "media")
    POSTS_MEDIA_DIR: str = os.path.join(MEDIA_ROOT, "media", "posts")

    class Config:
        env_file = ".env"

    def create_media_directories(self):
        """Ensure media directories exist"""
        os.makedirs(self.MEDIA_ROOT, exist_ok=True)
        os.makedirs(self.POSTS_MEDIA_DIR, exist_ok=True)


settings = Settings()
settings.create_media_directories()