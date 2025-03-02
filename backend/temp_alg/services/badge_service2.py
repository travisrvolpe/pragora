# services/badge_service.py
from datetime import datetime
import logging
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.datamodels.badge_datamodels import BadgeCategory, Badge, UserBadge
from app.datamodels.user_datamodels import UserAnalysis
from app.schemas.badge_schemas import UserBadgeCreate, UserBadgeUpdate

logger = logging.getLogger(__name__)


class BadgeService:
    """
    Service for badge-related operations including awarding points,
    checking thresholds, and retrieving badge information.
    """

    def __init__(self, db: Session):
        self.db = db

    async def award_points_from_analysis(self, user_id: int, post_analysis: dict) -> None:
        """
        Award badge points based on post analysis results

        Args:
            user_id: User ID to award points to
            post_analysis: Post analysis results containing scores
        """
        # Get user's analysis record to update merit/demerit points
        user_analysis = await self._get_or_create_user_analysis(user_id)

        # Award points for good scores (above threshold)
        if post_analysis.get("soundness_score", 0) > 0.7:
            await self.add_badge_points(user_id, "Logical Reasoning", 1, is_merit=True)

        if post_analysis.get("evidence_score", 0) > 0.7:
            await self.add_badge_points(user_id, "Evidence Quality", 1, is_merit=True)

        if post_analysis.get("good_faith_score", 0) > 0.7:
            await self.add_badge_points(user_id, "Good Faith Participation", 1, is_merit=True)

        if post_analysis.get("practical_utility_score", 0) > 0.7:
            await self.add_badge_points(user_id, "Practical Solutions", 1, is_merit=True)

        # Add demerits for bad scores (above threshold)
        if post_analysis.get("fallacy_score", 0) > 0.7:
            await self.add_badge_points(user_id, "Logical Fallacies", 1, is_merit=False)

        if post_analysis.get("bad_faith_score", 0) > 0.7:
            await self.add_badge_points(user_id, "Bad Faith Behavior", 1, is_merit=False)

        if post_analysis.get("misinformation_score", 0) > 0.7:
            await self.add_badge_points(user_id, "Misinformation", 1, is_merit=False)

        # Check if any new badges were earned
        earned_badges = await self.check_badge_thresholds(user_id)

        # Return any newly earned badges
        return earned_badges

    async def award_points_for_community_note(self, user_id: int, note_id: int, helpful_count: int) -> None:
        """
        Award points for community notes that get positive feedback

        Args:
            user_id: User ID to award points to
            note_id: Community note ID
            helpful_count: Number of helpful votes
        """
        # Award points based on helpful votes thresholds
        if helpful_count >= 5:
            await self.add_badge_points(user_id, "Community Contribution", 1, is_merit=True)

        # Check if any new badges were earned
        earned_badges = await self.check_badge_thresholds(user_id)

        # Return any newly earned badges
        return earned_badges

    async def add_badge_points(self, user_id: int, category_name: str, points: int, is_merit: bool) -> None:
        """
        Add points toward a specific badge category

        Args:
            user_id: User ID to award points to
            category_name: Badge category name
            points: Number of points to award
            is_merit: Whether these are merit points (True) or demerit points (False)
        """
        # Get the badge category
        category = self.db.query(BadgeCategory).filter(
            and_(
                BadgeCategory.badge_name == category_name,
                BadgeCategory.is_merit == is_merit
            )
        ).first()

        if not category:
            logger.warning(f"Badge category not found: {category_name}, is_merit={is_merit}")
            return

        # Get all badges in this category
        badges = self.db.query(Badge).filter_by(badge_category_id=category.badge_category_id).all()

        # Update user's overall merit/demerit points
        await self._update_user_analysis_points(user_id, points, is_merit)

        # For each badge level, add points
        for badge in badges:
            # Get or create user badge record
            user_badge = await self._get_or_create_user_badge(user_id, badge.badge_id)

            # Update points
            user_badge.badge_current_points += points

            # If badge not earned yet and threshold reached, mark as earned
            if not user_badge.badge_earned and user_badge.badge_current_points >= badge.badge_threshold:
                user_badge.badge_earned = True
                user_badge.badge_earned_at = datetime.utcnow()

            user_badge.badge_last_updated = datetime.utcnow()

        self.db.commit()

    async def check_badge_thresholds(self, user_id: int) -> list:
        """
        Check if user has earned any new badges

        Args:
            user_id: User ID to check

        Returns:
            list: Newly earned badges
        """
        # Get all user badge records
        user_badges = self.db.query(UserBadge).filter_by(user_id=user_id).all()

        newly_earned = []

        # Check each badge
        for user_badge in user_badges:
            badge = self.db.query(Badge).filter_by(badge_id=user_badge.badge_id).first()

            # If points threshold reached but badge not marked as earned yet
            if not user_badge.badge_earned and user_badge.badge_current_points >= badge.badge_threshold:
                user_badge.badge_earned = True
                user_badge.badge_earned_at = datetime.utcnow()

                # Add to newly earned list
                newly_earned.append({
                    "badge_id": badge.badge_id,
                    "badge_name": badge.badge_name,
                    "badge_icon_url": badge.badge_icon_url,
                    "badge_category": badge.badge_category.badge_name,
                    "is_merit": badge.is_merit
                })

        self.db.commit()
        return newly_earned

    async def get_user_badges(self, user_id: int, earned_only: bool = False) -> list:
        """
        Get all badges for a user with progress information

        Args:
            user_id: User ID to get badges for
            earned_only: Whether to only return earned badges

        Returns:
            list: User badges with progress information
        """
        query = self.db.query(
            UserBadge, Badge, BadgeCategory
        ).join(
            Badge, UserBadge.badge_id == Badge.badge_id
        ).join(
            BadgeCategory, Badge.badge_category_id == BadgeCategory.badge_category_id
        ).filter(
            UserBadge.user_id == user_id
        )

        if earned_only:
            query = query.filter(UserBadge.badge_earned == True)

        results = query.all()

        badges = []
        for user_badge, badge, category in results:
            # Calculate progress percentage
            progress = min(100.0, (user_badge.badge_current_points / badge.badge_threshold) * 100)

            badges.append({
                "user_badge_id": user_badge.user_badge_id,
                "badge_id": badge.badge_id,
                "badge_name": badge.badge_name,
                "badge_description": badge.badge_description,
                "badge_icon_url": badge.badge_icon_url,
                "badge_category": category.badge_name,
                "is_merit": badge.is_merit,
                "badge_earned": user_badge.badge_earned,
                "badge_earned_at": user_badge.badge_earned_at,
                "badge_current_points": user_badge.badge_current_points,
                "badge_threshold": badge.badge_threshold,
                "progress_percentage": progress
            })

        return badges

    async def get_badge_categories(self) -> dict:
        """
        Get all badge categories grouped by merit/demerit

        Returns:
            dict: Badge categories and their badges
        """
        categories = self.db.query(BadgeCategory).all()

        result = {
            "merit": [],
            "demerit": []
        }

        for category in categories:
            badges = self.db.query(Badge).filter_by(badge_category_id=category.badge_category_id).all()

            category_data = {
                "badge_category_id": category.badge_category_id,
                "badge_name": category.badge_name,
                "badge_description": category.badge_description,
                "badges": [
                    {
                        "badge_id": badge.badge_id,
                        "badge_name": badge.badge_name,
                        "badge_description": badge.badge_description,
                        "badge_icon_url": badge.badge_icon_url,
                        "badge_threshold": badge.badge_threshold
                    }
                    for badge in badges
                ]
            }

            if category.is_merit:
                result["merit"].append(category_data)
            else:
                result["demerit"].append(category_data)

        return result

    async def _get_or_create_user_badge(self, user_id: int, badge_id: int) -> UserBadge:
        """
        Get or create a user badge record

        Args:
            user_id: User ID
            badge_id: Badge ID

        Returns:
            UserBadge: User badge record
        """
        user_badge = self.db.query(UserBadge).filter_by(
            user_id=user_id,
            badge_id=badge_id
        ).first()

        if not user_badge:
            user_badge = UserBadge(
                user_id=user_id,
                badge_id=badge_id,
                badge_current_points=0,
                badge_earned=False,
                badge_first_progress_at=datetime.utcnow(),
                badge_last_updated=datetime.utcnow()
            )
            self.db.add(user_badge)
            self.db.flush()

        return user_badge

    async def _get_or_create_user_analysis(self, user_id: int) -> UserAnalysis:
        """
        Get or create a user analysis record

        Args:
            user_id: User ID

        Returns:
            UserAnalysis: User analysis record
        """
        user_analysis = self.db.query(UserAnalysis).filter_by(user_id=user_id).first()

        if not user_analysis:
            user_analysis = UserAnalysis(
                user_id=user_id,
                merit_points=0,
                demerit_points=0,
                soundness_score=0.0,
                fallacy_score=0.0,
                evidence_quality_score=0.0,
                misinformation_score=0.0,
                good_faith_score=0.0,
                bad_faith_score=0.0,
                practical_utility_score=0.0,
                analysis_version="1.0"
            )
            self.db.add(user_analysis)
            self.db.flush()

        return user_analysis

    async def _update_user_analysis_points(self, user_id: int, points: int, is_merit: bool) -> None:
        """
        Update user's overall merit/demerit points

        Args:
            user_id: User ID
            points: Points to add
            is_merit: Whether these are merit points
        """
        user_analysis = await self._get_or_create_user_analysis(user_id)

        if is_merit:
            user_analysis.merit_points += points
        else:
            user_analysis.demerit_points += points

        self.db.commit()