# routes/badge_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.utils.database_utils import get_db
from app.services.badge_service import BadgeService
from app.auth.utils import get_current_user

router = APIRouter(
    prefix="/badges",
    tags=["badges"]
)


@router.get("/me")
async def get_my_badges(
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Get badges for the current user"""
    badge_service = BadgeService(db)
    return await badge_service.get_user_badges(current_user.user_id)


@router.get("/user/{user_id}")
async def get_user_badges(
        user_id: int,
        db: Session = Depends(get_db)
):
    """Get badges for a specific user"""
    badge_service = BadgeService(db)
    return await badge_service.get_user_badges(user_id)


@router.get("/categories")
async def get_badge_categories(db: Session = Depends(get_db)):
    """Get all badge categories"""
    merit_categories = db.query(BadgeCategory).filter_by(is_merit=True).all()
    demerit_categories = db.query(BadgeCategory).filter_by(is_merit=False).all()

    return {
        "merit_categories": [
            {
                "name": category.name,
                "description": category.description,
                "badges": [
                    {
                        "name": badge.name,
                        "description": badge.description,
                        "threshold": badge.threshold,
                        "icon_url": badge.icon_url
                    }
                    for badge in
                    db.query(Badge).filter_by(category_id=category.category_id).order_by(Badge.threshold.asc()).all()
                ]
            }
            for category in merit_categories
        ],
        "demerit_categories": [
            {
                "name": category.name,
                "description": category.description,
                "badges": [
                    {
                        "name": badge.name,
                        "description": badge.description,
                        "threshold": badge.threshold,
                        "icon_url": badge.icon_url
                    }
                    for badge in
                    db.query(Badge).filter_by(category_id=category.category_id).order_by(Badge.threshold.asc()).all()
                ]
            }
            for category in demerit_categories
        ]
    }