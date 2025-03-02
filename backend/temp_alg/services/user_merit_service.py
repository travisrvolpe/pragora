# services/user_merit_service.py
from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.datamodels.user_datamodels import User, UserProfile
from app.datamodels.post_datamodels import Post, PostAnalysis
from app.utils.database_utils import get_db


class UserMeritService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    async def update_user_merit(self, user_id: int):
        """Update a user's merit scores based on their content"""
        user = self.db.query(User).filter(User.user_id == user_id).first()
        if not user or not user.profile:
            return None

        # Get all user's posts with analysis
        posts_with_analysis = self.db.query(Post, PostAnalysis) \
            .join(PostAnalysis, Post.post_id == PostAnalysis.post_id) \
            .filter(Post.user_id == user_id) \
            .all()

        if not posts_with_analysis:
            return user.profile

        # Calculate average scores
        fallacy_total = sum(analysis.fallacy_score for _, analysis in posts_with_analysis)
        evidence_total = sum(analysis.evidence_score for _, analysis in posts_with_analysis)
        # Add other metrics

        post_count = len(posts_with_analysis)

        # Update profile with new averages
        user.profile.fallacy_score = fallacy_total / post_count
        user.profile.evidence_quality = evidence_total / post_count

        # Calculate merits and demerits
        merit_points = self._calculate_merit_points(user.profile)
        demerit_points = self._calculate_demerit_points(user.profile)

        user.profile.merit_points = merit_points
        user.profile.demerit_points = demerit_points

        # Update reputation score/category based on merit balance
        self._update_reputation(user.profile)

        self.db.commit()
        return user.profile

    def _calculate_merit_points(self, profile: UserProfile) -> int:
        """Calculate merit points based on positive contributions"""
        points = 0

        # High evidence quality gives points
        if profile.evidence_quality > 0.7:
            points += int((profile.evidence_quality - 0.7) * 100)

        # Other merit factors
        # ...

        return points

    def _calculate_demerit_points(self, profile: UserProfile) -> int:
        """Calculate demerit points based on negative behaviors"""
        points = 0

        # High fallacy scores give demerits
        if profile.fallacy_score > 0.3:
            points += int((profile.fallacy_score - 0.3) * 100)

        # Other demerit factors
        # ...

        return points

    def _update_reputation(self, profile: UserProfile):
        """Update reputation score and category based on merit balance"""
        # Net score is merit minus demerits
        net_score = profile.merit_points - profile.demerit_points

        # Map to reputation score (0-100)
        reputation = max(0, min(100, 50 + net_score / 10))
        profile.reputation_score = reputation

        # Update reputation category
        if reputation >= 80:
            profile.reputation_cat = "Trusted Contributor"
        elif reputation >= 60:
            profile.reputation_cat = "Reputable Member"
        elif reputation >= 40:
            profile.reputation_cat = "Regular Member"
        elif reputation >= 20:
            profile.reputation_cat = "New Member"
        else:
            profile.reputation_cat = "Probationary Member"