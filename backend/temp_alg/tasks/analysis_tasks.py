# tasks/analysis_tasks.py
import logging
from typing import Dict, Any
from fastapi import BackgroundTasks, Depends
from sqlalchemy.orm import Session

from app.services.content_analysis_service import ContentAnalysisService
from app.services.fallacy_detector import FallacyDetector
from app.database.database import get_db
from app.config import get_settings

logger = logging.getLogger(__name__)

# Get settings for API keys etc.
settings = get_settings()

# Initialize services
fallacy_detector = FallacyDetector(
    api_key=settings.llm_api_key,
    api_base_url=settings.llm_api_base_url
)


def get_content_analysis_service(db: Session = Depends(get_db)):
    """Dependency to get ContentAnalysisService instance"""
    return ContentAnalysisService(
        db=db,
        fallacy_detector=fallacy_detector
    )


async def analyze_post_task(post_id: int, db: Session):
    """
    Background task to analyze a post

    Args:
        post_id: Post ID to analyze
        db: Database session
    """
    try:
        # Create service instance
        analysis_service = ContentAnalysisService(
            db=db,
            fallacy_detector=fallacy_detector
        )

        # Analyze post
        result = await analysis_service.analyze_post(post_id)

        if "error" in result:
            logger.error(f"Error analyzing post {post_id}: {result['error']}")
        else:
            logger.info(f"Successfully analyzed post {post_id}")

            # Log any new badges earned
            if result.get("new_badges"):
                for badge in result["new_badges"]:
                    logger.info(f"User {result['user_id']} earned badge: {badge['badge_name']}")

    except Exception as e:
        logger.error(f"Unhandled exception analyzing post {post_id}: {str(e)}")


def schedule_post_analysis(post_id: int, background_tasks: BackgroundTasks, db: Session):
    """
    Schedule a post for analysis in the background

    Args:
        post_id: Post ID to analyze
        background_tasks: FastAPI background tasks
        db: Database session
    """
    background_tasks.add_task(analyze_post_task, post_id, db)
    logger.info(f"Scheduled analysis for post {post_id}")