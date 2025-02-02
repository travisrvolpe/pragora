# app/services/profile_service.py

from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.services.file_service import save_avatar_image
from app.datamodels.datamodels import UserProfile
from app.schemas.schemas import ProfileUpdate


async def update_avatar(db: Session, user_id: int, file: UploadFile) -> str:
    """
    Update user's avatar image.
    Returns the new avatar URL.
    """
    # Save the image and get path
    avatar_path = await save_avatar_image(file)

    # Update user profile with new avatar path
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise ValueError("Profile not found")

    profile.avatar_img = avatar_path
    db.commit()
    db.refresh(profile)

    return avatar_path




async def update_profile(db: Session, user_id: int, profile_data: ProfileUpdate):
    """
    Update user profile data.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise ValueError("Profile not found")

    # Update profile fields
    for field, value in profile_data.dict(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile

#How do you connect this to make sure post change if the usersname changes? Is this nec?