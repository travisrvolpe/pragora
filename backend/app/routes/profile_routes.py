# app/routes/profile_routes.py
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy.orm.session import Session
from app.utils.database_utils import get_db
from app.auth.utils import get_current_user
from app.datamodels.datamodels import UserProfile, User
from app.datamodels.schemas import ProfileCreate, ProfileUpdate, ProfileResponse
router = APIRouter(
    prefix="/profiles",
    tags=["profiles"]
)


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
        request: Request,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Get the profile of the currently logged-in user."""
    # Debug logging
    print(f"Getting profile for user_id: {current_user.user_id}")
    print(f"Auth header: {request.headers.get('Authorization')}")

    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.user_id).first()
    if not profile:
        print(f"No profile found for user_id: {current_user.user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    print(f"Profile found: {profile.user_id}")
    return profile


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
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Update the current user's profile"""
    db_profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.user_id
    ).first()

    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    # Update profile fields
    for field, value in profile_update.dict(exclude_unset=True).items():
        setattr(db_profile, field, value)

    db.commit()
    db.refresh(db_profile)
    return db_profile


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