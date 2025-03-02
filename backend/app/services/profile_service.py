# app/services/profile_service.py
import os
import uuid
import aiofiles
from PIL import Image
from fastapi import UploadFile
from sqlalchemy.orm import Session
#from app.services.file_service import save_avatar_image
from app.datamodels.user_datamodels import UserProfile, User
from app.schemas.user_schemas import ProfileUpdate
from app.core.cache import get_redis
import json
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from app.core.config import settings
from app.core.logger import get_logger, log_execution_time

logger = get_logger(__name__)

# Use the configured directory from settings
UPLOAD_DIR = os.path.join(settings.MEDIA_ROOT, "avatars")

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def get_or_create_profile(db: Session, user: User) -> UserProfile:
    """Get existing profile or create a new one."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.user_id).first()

    if not profile:
        # Create new profile with all fields
        profile = UserProfile(
            user_id=user.user_id,
            username=user.email.split('@')[0],
            avatar_img='default_url',
            about=None,
            post_cnt=0,
            comment_cnt=0,
            upvote_cnt=0,
            plan_cnt=0,
            plan_comp_cnt=0,
            plan_ip_cnt=0,
            goals=None,
            is_messaging=True,
            is_networking=True,
            reputation_score=5,
            reputation_cat='New Joiner',
            interests=None,
            credentials=None,
            expertise_area=None,
            location=None,
            gender=None,
            sex=None,
            worldview_u=None,
            worldview_ai=None,
            date_joined=user.created_at,
            logon_time=datetime.now(),
            last_active=datetime.now(),
            role='user',
            is_admin=False,
            is_instructor=False
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


def profile_to_dict(profile: UserProfile) -> Dict[str, Any]:
    """Convert profile to dictionary format."""
    return {
        "user_id": profile.user_id,
        "username": profile.username,
        "avatar_img": profile.avatar_img or settings.DEFAULT_AVATAR_URL,
        "about": profile.about,
        "post_cnt": profile.post_cnt,
        "comment_cnt": profile.comment_cnt,
        "upvote_cnt": profile.upvote_cnt,
        "plan_cnt": profile.plan_cnt,
        "plan_comp_cnt": profile.plan_comp_cnt,
        "plan_ip_cnt": profile.plan_ip_cnt,
        "goals": profile.goals,
        "is_messaging": profile.is_messaging,
        "is_networking": profile.is_networking,
        "reputation_score": profile.reputation_score,
        "reputation_cat": profile.reputation_cat,
        "interests": profile.interests,
        "credentials": profile.credentials,
        "expertise_area": profile.expertise_area,
        "location": profile.location,
        "gender": profile.gender,
        "sex": profile.sex,
        "worldview_u": profile.worldview_u,
        "worldview_ai": profile.worldview_ai,
        "date_joined": profile.date_joined.isoformat() if profile.date_joined else None,
        "logon_time": profile.logon_time.isoformat() if profile.logon_time else None,
        "last_active": profile.last_active.isoformat() if profile.last_active else None,
        "role": profile.role,
        "is_admin": profile.is_admin,
        "is_instructor": profile.is_instructor
    }


async def get_profile_from_cache(user_id: int) -> Optional[Dict[str, Any]]:
    """Get profile data from Redis cache."""
    try:
        redis = await get_redis()
        if not redis:
            return None

        cache_key = f"profile:{user_id}"
        cached_data = await redis.get(cache_key)
        return json.loads(cached_data) if cached_data else None
    except Exception as e:
        print(f"Redis cache error: {str(e)}")
        return None


async def set_profile_to_cache(user_id: int, profile_data: Dict[str, Any]) -> None:
    """Store profile data in Redis cache."""
    try:
        redis = await get_redis()
        if not redis:
            return

        cache_key = f"profile:{user_id}"
        await redis.set(
            cache_key,
            json.dumps(profile_data),
            ex=3600  # 1 hour expiration
        )
    except Exception as e:
        print(f"Redis cache error: {str(e)}")


async def update_avatar(db: Session, user_id: int, file: UploadFile) -> str:
    """Update user's avatar image."""
    try:
        # Save the image and get the URL path
        avatar_path = await save_avatar_image(file)

        # Update profile with new avatar path
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            raise ValueError("Profile not found")

        profile.avatar_img = avatar_path
        profile.last_active = datetime.now()
        db.commit()
        db.refresh(profile)

        # Invalidate cache
        await invalidate_profile_cache(user_id)

        return avatar_path
    except Exception as e:
        print(f"Error updating avatar: {str(e)}")
        raise


async def update_profile(db: Session, user_id: int, profile_data: ProfileUpdate) -> UserProfile:
    """Update user profile data."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    if not profile:
        raise ValueError("Profile not found")

    # Update profile fields
    for field, value in profile_data.dict(exclude_unset=True).items():
        setattr(profile, field, value)

    profile.last_active = datetime.now()
    db.commit()
    db.refresh(profile)

    # Invalidate cache
    await invalidate_profile_cache(user_id)

    return profile


async def invalidate_profile_cache(user_id: int) -> None:
    """Remove profile data from cache."""
    try:
        redis = await get_redis()
        if redis:
            cache_key = f"profile:{user_id}"
            await redis.delete(cache_key)
    except Exception as e:
        print(f"Redis cache error: {str(e)}")

async def create_default_profile(db: Session, user_id: int, email: str) -> UserProfile:
    """
    Create a default profile for a new user.
    """
    username = email.split('@')[0]
    profile = UserProfile(
        user_id=user_id,
        username=username,
        reputation_score=5,
        reputation_cat='New Joiner',
        post_cnt=0,
        comment_cnt=0,
        upvote_cnt=0
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

async def save_avatar_image(file: UploadFile) -> str:
    """Save an avatar image and return the file path."""
    try:
        # Generate unique filename
        file_extension = file.filename.split(".")[-1].lower() if file.filename else "jpg"
        filename = f"{uuid.uuid4()}.{file_extension}"
        filepath = os.path.join(settings.AVATAR_DIR, filename)

        logger.info(f"Saving avatar to {filepath}")

        # Save the file
        async with aiofiles.open(filepath, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)

        # Process image (resize if needed)
        with Image.open(filepath) as img:
            # Resize image to standard size for avatars
            img.thumbnail((200, 200))
            img.save(filepath)

        # Return the URL path (not filesystem path)
        return f"/avatars/{filename}"
    except Exception as e:
        logger.error(f"Error saving avatar: {str(e)}")
        raise