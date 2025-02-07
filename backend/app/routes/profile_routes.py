# app/routes/profile_routes.py
# should probably update to get user posts, delete posts, and edit posts. Add drafts?
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
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


@router.get("/me")
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

@router.get("/me/saved-posts", response_model=List[int])
async def get_saved_posts_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_saved_posts(db, current_user.user_id)

@router.post("/me/avatar")
async def update_profile_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the current user's avatar"""
    try:
        avatar_url = await update_avatar(db, current_user.user_id, file)
        return {
            "status": "success",
            "data": {
                "avatar_url": avatar_url
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error updating avatar: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update avatar")