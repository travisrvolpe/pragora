# app/routes/profile_routes.py
# should probably update to get user posts, delete posts, and edit posts. Add drafts?
import os
from app.core.config import settings
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.responses import JSONResponse
from sqlalchemy.orm.session import Session
from app.utils.database_utils import get_db
from app.auth.utils import get_current_user
from app.datamodels.datamodels import UserProfile, User
from app.schemas.schemas import ProfileCreate, ProfileUpdate, ProfileResponse
from app.services.post_service import save_post, get_post, get_saved_posts
from app.services.profile_service import update_avatar, update_profile
from typing import List
from app.schemas.schemas import ProfileResponse
from app.services.profile_service import (
    get_profile_from_cache, set_profile_to_cache,
    get_or_create_profile, create_default_profile, profile_to_dict
)
from datetime import datetime, timedelta
router = APIRouter(
    prefix="/profiles",
    tags=["profiles"]
)


# TODO CAN THIS CREATE ISSUES WITH OVERWRITTING PROFILES?

@router.get("/static/{path:path}")
async def get_static_file(path: str):
    """Serve static files"""
    file_path = os.path.join(settings.STATIC_ROOT, path)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@router.options("/me")
async def options_profile_me():
    return {}
#@router.get("/me")
@router.get("/me")
async def get_my_profile(
        request: Request,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Get the profile of the currently logged-in user."""
    try:
        # Try to get from cache first
        cached_data = await get_profile_from_cache(current_user.user_id)
        if cached_data:
            return cached_data

        # Get or create profile from database
        profile = await get_or_create_profile(db, current_user)

        # Prepare response data using helper function
        response_data = {
            "status": "success",
            "data": profile_to_dict(profile)
        }

        # Try to cache the data
        try:
            await set_profile_to_cache(current_user.user_id, response_data)
        except Exception as cache_error:
            print(f"Cache error: {str(cache_error)}")

        return response_data

    except Exception as e:
        print(f"Error in get_my_profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
@router.get("/{user_id}", response_model=ProfileResponse)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile


@router.post("/", response_model=ProfileResponse)
async def create_profile(
        profile: ProfileCreate,
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Create a new profile for the current user"""
    # Check if profile already exists
    existing_profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.user_id
    ).first()

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists"
        )

    # Create new profile
    db_profile = UserProfile(
        user_id=current_user.user_id,
        **profile.dict()
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile


@router.patch("/me", response_model=ProfileResponse)
async def update_my_profile(
        profile_update: ProfileUpdate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Update the current user's profile"""
    try:
        updated_profile = await update_profile(db, current_user.user_id, profile_update)

        # Format response using the helper function
        response_data = {
            "status": "success",
            "data": profile_to_dict(updated_profile)
        }

        return response_data

    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except Exception as e:
        print(f"Error updating profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/me")
async def delete_my_profile(
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Delete the current user's profile"""
    db_profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.user_id
    ).first()

    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    db.delete(db_profile)
    db.commit()
    return {"message": "Profile deleted successfully"}

@router.post("/me/save-post/{post_id}")
async def save_post_endpoint(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await save_post(db, current_user.user_id, post_id)


@router.get("/me/saved-posts")
async def get_saved_posts_endpoint(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    # Get the saved posts data
    saved_posts_data = await get_saved_posts(db, current_user.user_id)

    # Check if it's already a list
    if isinstance(saved_posts_data, list):
        return saved_posts_data

    # If it's a dict with saved_posts key, return just that list
    if isinstance(saved_posts_data, dict) and 'saved_posts' in saved_posts_data:
        return saved_posts_data['saved_posts']

    # Default empty list if no data found
    return []

@router.get("/avatar/{user_id}")
def get_user_avatar(user_id: int, db: Session = Depends(get_db)):
    """Get a user's avatar by user ID"""
    try:
        # Find the user profile
        user_profile = db.query(UserProfile).filter_by(user_id=user_id).first()
        print(f"Avatar request for user_id: {user_id}, found profile: {user_profile is not None}")

        if not user_profile:
            print(f"No profile found for user {user_id}, returning default")
            return FileResponse(os.path.join(settings.STATIC_ROOT, "default_avatar.png"),
                                media_type="image/png")

        # Check if user has an avatar set
        print(f"User {user_id} avatar_img: {user_profile.avatar_img}")
        if not user_profile.avatar_img or user_profile.avatar_img == 'default_url':
            print(f"No avatar set for user {user_id}, returning default")
            return FileResponse(os.path.join(settings.STATIC_ROOT, "default_avatar.png"),
                                media_type="image/png")

        # Extract filename
        if user_profile.avatar_img.startswith('/avatars/'):
            filename = user_profile.avatar_img.split('/')[-1]
        else:
            filename = user_profile.avatar_img
        print(f"Extracted filename: {filename}")

        # Build path and check existence
        file_path = os.path.join(settings.AVATAR_DIR, filename)
        print(f"Looking for avatar at: {file_path}")
        print(f"File exists: {os.path.isfile(file_path)}")

        if not os.path.isfile(file_path):
            print(f"Avatar file not found at {file_path}, returning default")
            return FileResponse(os.path.join(settings.STATIC_ROOT, "default_avatar.png"),
                                media_type="image/png")

        # Return the avatar file
        print(f"Serving avatar from {file_path}")
        return FileResponse(file_path, media_type="image/png")

    except Exception as e:
        print(f"Error retrieving avatar: {str(e)}")
        return FileResponse(os.path.join(settings.STATIC_ROOT, "default_avatar.png"),
                            media_type="image/png")


@router.post("/me/avatar")
async def update_profile_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the current user's avatar"""
    try:
        avatar_img = await update_avatar(db, current_user.user_id, file)
        return {
            "status": "success",
            "data": {
                "avatar_img": avatar_img
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error updating avatar: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update avatar")


@router.get("/avatar/by-path{full_path:path}")
def get_avatar_by_path(full_path: str):
    """Get avatar by its path"""
    try:
        if full_path.startswith('/avatars/'):
            filename = full_path.split('/')[-1]
            file_path = os.path.join(settings.AVATAR_DIR, filename)

            if os.path.isfile(file_path):
                return FileResponse(file_path, media_type="image/png")

        # Default avatar fallback
        return FileResponse(os.path.join(settings.STATIC_ROOT, "default_avatar.png"),
                            media_type="image/png")
    except Exception as e:
        print(f"Error retrieving avatar by path: {str(e)}")
        return FileResponse(os.path.join(settings.STATIC_ROOT, "default_avatar.png"),
                            media_type="image/png")