# routes/analysis_routes.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.utils.database_utils import get_db
from app.datamodels.post_datamodels import PostAnalysis
from app.auth.utils import get_current_user
from app.services.content_analysis_service import ContentAnalysisService

router = APIRouter(
    prefix="/analysis",
    tags=["analysis"]
)


@router.get("/post/{post_id}")
async def get_post_analysis(
        post_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """Get analysis results for a post"""
    analysis = db.query(PostAnalysis).filter(
        PostAnalysis.post_id == post_id
    ).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return {
        "status": "success",
        "data": {
            "fallacy_score": analysis.fallacy_score,
            "fallacy_types": analysis.fallacy_types,
            "evidence_score": analysis.evidence_score,
            "evidence_types": analysis.evidence_types,
            "participation_score": analysis.participation_score,
            "participation_concerns": analysis.participation_concerns,
            "community_score": analysis.community_score,
            "community_notes": analysis.community_notes,
            "action_score": analysis.action_score,
            "implementation_complexity": analysis.implementation_complexity,
            "resource_requirements": analysis.resource_requirements,
            "saved_to_plans_count": analysis.saved_to_plans_count,
            "completed_plans_count": analysis.completed_plans_count,
            "confidence_score": analysis.confidence_score,
            "analyzed_at": analysis.analyzed_at
        }
    }


@router.post("/post/{post_id}/analyze")
async def request_post_analysis(
        post_id: int,
        background_tasks: BackgroundTasks,
        analyze_all: bool = False,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """Request analysis for a post"""
    # Check if post exists
    post = db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Schedule analysis in background
    analysis_service = ContentAnalysisService(db)
    background_tasks.add_task(analysis_service.analyze_post, post_id, analyze_all)

    return {
        "status": "success",
        "message": "Analysis scheduled",
        "data": {
            "post_id": post_id,
            "full_analysis": analyze_all
        }
    }


@router.get("/user/{user_id}/merit")
async def get_user_merit(
        user_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """Get user merit metrics"""
    badge_service = BadgeService(db)
    badges = await badge_service.get_user_badges(user_id)

    profile = db.query(UserProfile).filter(
        UserProfile.user_id == user_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")

    return {
        "status": "success",
        "data": {
            "merit_badges": badges.get("merit_badges", []),
            "demerit_badges": badges.get("demerit_badges", []),
            "reputation_score": profile.reputation_score,
            "reputation_cat": profile.reputation_cat
        }
    }