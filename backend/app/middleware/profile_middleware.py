from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from app.datamodels.datamodels import User, UserProfile


async def validate_user_profile(user_id: int, db: Session) -> UserProfile:
    """Validate that a user has a complete profile before allowing certain operations"""
    user = db.query(User).options(
        joinedload(User.profile)
    ).filter(User.user_id == user_id).first()

    if not user:
        print(f"❌ User {user_id} not found")
        raise HTTPException(status_code=404, detail="User not found")

    if not user.profile:
        print(f"❌ User {user_id} has no profile")
        raise HTTPException(
            status_code=400,
            detail="Profile required. Please complete your profile before performing this action."
        )

    return user.profile