# services/content_analysis_service.py
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.datamodels.post_datamodels import Post, PostAnalysis
from app.services.fallacy_detector import FallacyDetector
from app.services.evidence_analyzer import EvidenceAnalyzer  # You'll implement this later
from app.services.participation_analyzer import ParticipationAnalyzer  # You'll implement this later
from app.services.actionability_analyzer import ActionabilityAnalyzer  # You'll implement this later
from app.services.badge_service import BadgeService

logger = logging.getLogger(__name__)


class ContentAnalysisService:
    """
    Service to coordinate content analysis using multiple analyzers
    and store results.
    """

    def __init__(
            self,
            db: Session,
            fallacy_detector: FallacyDetector,
            evidence_analyzer: Optional[EvidenceAnalyzer] = None,
            participation_analyzer: Optional[ParticipationAnalyzer] = None,
            actionability_analyzer: Optional[ActionabilityAnalyzer] = None
    ):
        """
        Initialize the content analysis service

        Args:
            db: Database session
            fallacy_detector: Fallacy detector service
            evidence_analyzer: Evidence analyzer service (optional for MVP)
            participation_analyzer: Participation analyzer service (optional for MVP)
            actionability_analyzer: Actionability analyzer service (optional for MVP)
        """
        self.db = db
        self.fallacy_detector = fallacy_detector
        self.evidence_analyzer = evidence_analyzer
        self.participation_analyzer = participation_analyzer
        self.actionability_analyzer = actionability_analyzer
        self.badge_service = BadgeService(db)
        self.analysis_version = "1.0"  # Track version for future improvements

    async def analyze_post(self, post_id: int) -> Dict[str, Any]:
        """
        Analyze a post using all available analyzers

        Args:
            post_id: Post ID to analyze

        Returns:
            Dict: Analysis results and new badges earned
        """
        # Get post from database
        post = self.db.query(Post).filter_by(post_id=post_id).first()
        if not post:
            logger.error(f"Post not found: {post_id}")
            return {"error": "Post not found"}

        try:
            # Check if analysis already exists for this post
            existing_analysis = self.db.query(PostAnalysis).filter_by(post_id=post_id).first()
            if existing_analysis:
                logger.info(f"Analysis already exists for post {post_id}, updating")
                return await self._update_analysis(post, existing_analysis)
            else:
                logger.info(f"Creating new analysis for post {post_id}")
                return await self._create_analysis(post)

        except Exception as e:
            logger.error(f"Error analyzing post {post_id}: {str(e)}")
            return {"error": str(e)}

    async def _create_analysis(self, post: Post) -> Dict[str, Any]:
        """
        Create a new analysis for a post

        Args:
            post: Post to analyze

        Returns:
            Dict: Analysis results and new badges earned
        """
        # Run fallacy and soundness analysis (core for MVP)
        fallacy_results = await self.fallacy_detector.analyze_content(post.content)

        # Prepare combined results
        results = {
            "fallacy_score": fallacy_results.get("fallacy_score", 0.0),
            "fallacy_types": fallacy_results.get("fallacy_types", []),
            "soundness_score": fallacy_results.get("soundness_score", 0.0),
            "soundness_types": fallacy_results.get("soundness_types", []),
            "merit_score": fallacy_results.get("merit_score", 0.0),
            "demerit_score": fallacy_results.get("demerit_score", 0.0)
        }

        # Add evidence analysis if available
        if self.evidence_analyzer:
            evidence_results = await self.evidence_analyzer.analyze_content(post.content)
            results.update({
                "evidence_score": evidence_results.get("evidence_score", 0.0),
                "evidence_types": evidence_results.get("evidence_types", []),
                "evidence_links": evidence_results.get("evidence_links", [])
            })

        # Add participation analysis if available
        if self.participation_analyzer:
            participation_results = await self.participation_analyzer.analyze_content(post.content)
            results.update({
                "good_faith_score": participation_results.get("good_faith_score", 0.0),
                "good_faith_details": participation_results.get("good_faith_details", []),
                "bad_faith_score": participation_results.get("bad_faith_score", 0.0),
                "bad_faith_details": participation_results.get("bad_faith_details", [])
            })

        # Add actionability analysis if available
        if self.actionability_analyzer:
            actionability_results = await self.actionability_analyzer.analyze_content(post.content)
            results.update({
                "practical_utility_score": actionability_results.get("practical_utility_score", 0.0),
                "implementation_complexity": actionability_results.get("implementation_complexity", 0.0),
                "resource_requirements": actionability_results.get("resource_requirements", {}),
                "estimated_timeline": actionability_results.get("estimated_timeline", {})
            })

        # Create analysis record
        analysis = PostAnalysis(
            post_id=post.post_id,
            user_id=post.user_id,
            fallacy_score=results.get("fallacy_score", 0.0),
            fallacy_types=results.get("fallacy_types", []),
            soundness_score=results.get("soundness_score", 0.0),
            soundness_types=results.get("soundness_types", []),
            evidence_score=results.get("evidence_score", 0.0),
            evidence_types=results.get("evidence_types", []),
            evidence_links=results.get("evidence_links", []),
            good_faith_score=results.get("good_faith_score", 0.0),
            good_faith_details=results.get("good_faith_details", []),
            bad_faith_score=results.get("bad_faith_score", 0.0),
            bad_faith_details=results.get("bad_faith_details", []),
            practical_utility_score=results.get("practical_utility_score", 0.0),
            implementation_complexity=results.get("implementation_complexity", 0.0),
            resource_requirements=results.get("resource_requirements", {}),
            estimated_timeline=results.get("estimated_timeline", {}),
            merit_score=results.get("merit_score", 0.0),
            demerit_score=results.get("demerit_score", 0.0),
            analysis_version=self.analysis_version,
            analyzed_at=datetime.utcnow(),
            confidence_score=fallacy_results.get("confidence_score", 0.8)
        )

        self.db.add(analysis)
        self.db.commit()

        # Award badge points based on analysis
        new_badges = await self.badge_service.award_points_from_analysis(post.user_id, results)

        # Return combined results
        return {
            "analysis_id": analysis.analysis_id,
            "post_id": post.post_id,
            "user_id": post.user_id,
            "results": results,
            "new_badges": new_badges
        }

    async def _update_analysis(self, post: Post, analysis: PostAnalysis) -> Dict[str, Any]:
        """
        Update an existing analysis for a post

        Args:
            post: Post to analyze
            analysis: Existing analysis to update

        Returns:
            Dict: Analysis results and new badges earned
        """
        # For MVP, we'll just create a new analysis to replace the old one
        # You could implement more sophisticated update logic later

        # Delete existing analysis
        self.db.delete(analysis)
        self.db.commit()

        # Create new analysis
        return await self._create_analysis(post)