# services/content_analysis_service.py
from app.services.analysis.fallacy_detector import FallacyDetector
from app.services.analysis.participation_analyzer import ParticipationAnalyzer
from app.services.analysis.evidence_analyzer import EvidenceAnalyzer
from app.services.analysis.community_feedback_aggregator import CommunityFeedbackAggregator
from app.services.analysis.actionability_analyzer import ActionabilityAnalyzer
from app.datamodels.post_datamodels import Post, PostAnalysis
from app.services.badge_service import BadgeService
from sqlalchemy.orm import Session
from fastapi import Depends
from app.utils.database_utils import get_db
import os
from typing import Dict, Any


class ContentAnalysisService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

        # LLM API configuration
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.api_url = os.getenv("LLM_API_URL", "https://api.openai.com/v1/chat/completions")
        self.model = os.getenv("LLM_MODEL", "gpt-4")

        # Initialize analyzers
        self.fallacy_detector = FallacyDetector()
        self.participation_analyzer = ParticipationAnalyzer(self.db, self.api_key, self.api_url, self.model)
        self.evidence_analyzer = EvidenceAnalyzer(self.api_key, self.api_url, self.model)
        self.community_feedback_aggregator = CommunityFeedbackAggregator(self.db)
        self.actionability_analyzer = ActionabilityAnalyzer(self.db, self.api_key, self.api_url, self.model)

        # Badge service
        self.badge_service = BadgeService(self.db)

    async def analyze_post(self, post_id: int, analyze_all: bool = False):
        """
        Analyze a post with all or selected analyzers

        analyze_all: If True, run all analyzers. If False, run only baseline analyzers.
        """
        post = self.db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            return None

        # Get or create analysis record
        analysis = self.db.query(PostAnalysis).filter(
            PostAnalysis.post_id == post_id
        ).first()

        if not analysis:
            analysis = PostAnalysis(post_id=post_id)
            self.db.add(analysis)

        # Run baseline analyzers
        fallacy_results = await self.fallacy_detector.analyze(post.content)
        evidence_results = await self.evidence_analyzer.analyze(post.content)

        # Update analysis record with baseline results
        analysis.fallacy_score = fallacy_results.get("fallacy_score", 0.0)
        analysis.fallacy_types = fallacy_results.get("fallacies_detected", [])

        analysis.evidence_score = evidence_results.get("evidence_score", 0.0)
        analysis.evidence_types = evidence_results.get("claims_analysis", [])

        # Run additional analyzers if requested
        if analyze_all:
            participation_results = await self.participation_analyzer.analyze(
                post.content, post_id, post.user_id
            )

            community_results = await self.community_feedback_aggregator.analyze(post_id)

            actionability_results = await self.actionability_analyzer.analyze(
                post.content, post_id
            )

            # Update analysis record with additional results
            analysis.bias_score = participation_results.get("good_faith_score", 0.5)
            analysis.bias_types = participation_results.get("concerns", [])

            analysis.action_score = actionability_results.get("actionability_score", 0.5)
            analysis.implementation_complexity = 1.0 - actionability_results.get("aspect_scores", {}).get("feasibility",
                                                                                                          0.5)
            analysis.resource_requirements = {
                "items": [item.get("resource_requirements", "Minimal") for item in
                          actionability_results.get("action_items", [])]
            }

            # Additional field updates
            # You might need to add these fields to your PostAnalysis model
            analysis.community_score = community_results.get("community_feedback_score", 0.5)
            analysis.community_notes = community_results.get("helpful_notes", [])

        # Calculate confidence score
        analysis.confidence_score = (
                                            fallacy_results.get("confidence", 0.0) +
                                            evidence_results.get("confidence", 0.0)
                                    ) / 2.0

        # Update database
        self.db.commit()

        # Award badge points
        await self._award_badge_points(post.user_id, fallacy_results, evidence_results)

        return analysis

    async def _award_badge_points(self, user_id: int, fallacy_results: Dict[str, Any],
                                  evidence_results: Dict[str, Any]):
        """Award merit/demerit points based on analysis results"""
        # Award demerit points for fallacies
        fallacies_detected = fallacy_results.get("fallacies_detected", [])
        if fallacies_detected and len(fallacies_detected) > 0:
            # Award 1 point per fallacy type detected
            await self.badge_service.award_points(
                user_id,
                "Logical Fallacies",
                len(fallacies_detected),
                is_merit=False
            )

        # Award merit points for good evidence
        if evidence_results.get("evidence_score", 0) > 0.7:
            supported_claims = evidence_results.get("overall_assessment", {}).get("supported_claims", 0)
            if supported_claims > 0:
                await self.badge_service.award_points(
                    user_id,
                    "Evidence Quality",
                    supported_claims,  # Award points based on number of well-supported claims
                    is_merit=True
                )