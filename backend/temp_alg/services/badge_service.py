# services/badge_service.py
from fastapi import Depends
from sqlalchemy.orm import Session
from app.datamodels.badge_datamodels import BadgeCategory, Badge, UserBadge
from app.utils.database_utils import get_db


class BadgeService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    async def award_points(self, user_id: int, category_name: str, points: int, is_merit: bool):
        """Award points to a user in a specific category"""
        # Find category
        category = self.db.query(BadgeCategory).filter_by(
            name=category_name,
            is_merit=is_merit
        ).first()

        if not category:
            print(f"Category {category_name} not found")
            return None

        # Get all badges for this category
        badges = self.db.query(Badge).filter_by(
            category_id=category.category_id
        ).order_by(Badge.threshold.asc()).all()

        if not badges:
            print(f"No badges found for category {category_name}")
            return None

        # Get or create user badge record
        user_badge = self.db.query(UserBadge).filter_by(
            user_id=user_id,
            badge_id=badges[0].badge_id  # Start with the lowest badge
        ).first()

        if not user_badge:
            # Create with the first badge in the category
            user_badge = UserBadge(
                user_id=user_id,
                badge_id=badges[0].badge_id,
                current_points=0
            )
            self.db.add(user_badge)

        # Update points
        user_badge.current_points += points

        # Check if user qualifies for a higher badge
        current_badge = user_badge.badge
        earned_new_badge = False
        new_badge = None

        for badge in badges:
            if user_badge.current_points >= badge.threshold and badge.threshold > current_badge.threshold:
                # User qualifies for a higher badge
                user_badge.badge_id = badge.badge_id
                earned_new_badge = True
                new_badge = badge

        self.db.commit()

        return {
            "user_id": user_id,
            "category": category_name,
            "points_added": points,
            "total_points": user_badge.current_points,
            "current_badge": new_badge.name if earned_new_badge else current_badge.name,
            "earned_new_badge": earned_new_badge
        }

    async def get_user_badges(self, user_id: int):
        """Get all badges for a user, grouped by category"""
        user_badges = self.db.query(UserBadge).filter_by(user_id=user_id).all()

        if not user_badges:
            return {"merit_badges": [], "demerit_badges": []}

        merit_badges = []
        demerit_badges = []

        for user_badge in user_badges:
            badge = user_badge.badge
            category = badge.category

            badge_data = {
                "category": category.name,
                "badge_name": badge.name,
                "description": badge.description,
                "icon_url": badge.icon_url,
                "current_points": user_badge.current_points,
                "threshold": badge.threshold,
                "earned_at": user_badge.earned_at
            }

            if badge.is_merit:
                merit_badges.append(badge_data)
            else:
                demerit_badges.append(badge_data)

        return {
            "merit_badges": merit_badges,
            "demerit_badges": demerit_badges
        }