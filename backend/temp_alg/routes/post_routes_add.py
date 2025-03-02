# routes/post_routes.py - update create_post function

# routes/post_routes.py
# Add these imports to your existing imports
from fastapi import BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.tasks.analysis_tasks import schedule_post_analysis


# Add this to your post creation endpoint
@router.post("/", response_model=PostResponse)
async def create_post(
        post: PostCreate,
        background_tasks: BackgroundTasks,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    # Your existing post creation logic...

    # Schedule post analysis after creation
    if new_post and not post.is_draft:  # Only analyze published posts
        schedule_post_analysis(new_post.post_id, background_tasks, db)

    # Return response
    return post_response


# Add this to your post update endpoint
@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
        post_id: int,
        post: PostUpdate,
        background_tasks: BackgroundTasks,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    # Your existing post update logic...

    # Schedule post analysis after significant update
    # Only re-analyze if content was changed
    if updated_post and 'content' in post.dict(exclude_unset=True):
        schedule_post_analysis(post_id, background_tasks, db)

    # Return response
    return post_response


# Add a new endpoint for manual analysis triggering (admin only)
@router.post("/{post_id}/analyze", response_model=dict)
async def trigger_post_analysis(
        post_id: int,
        background_tasks: BackgroundTasks,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    # Check if user is admin
    if not current_user.profile.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Schedule post analysis
    schedule_post_analysis(post_id, background_tasks, db)

    return {"message": f"Analysis scheduled for post {post_id}"}


# Add an endpoint to get analysis results
@router.get("/{post_id}/analysis", response_model=dict)
async def get_post_analysis(
        post_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    # Get post
    post = db.query(Post).filter_by(post_id=post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if user has access to post
    if post.user_id != current_user.user_id and post.visibility != 'public' and not current_user.profile.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get analysis
    analysis = db.query(PostAnalysis).filter_by(post_id=post_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Return analysis results
    return {
        "analysis_id": analysis.analysis_id,
        "post_id": analysis.post_id,
        "fallacy_score": analysis.fallacy_score,
        "soundness_score": analysis.soundness_score,
        "merit_score": analysis.merit_score,
        "demerit_score": analysis.demerit_score,
        "analyzed_at": analysis.analyzed_at,
        "summary": {
            "fallacies_detected": len(analysis.fallacy_types) if analysis.fallacy_types else 0,
            "sound_reasoning_detected": len(analysis.soundness_types) if analysis.soundness_types else 0,
            # Add other summary metrics as needed
        },
        # Optionally include detailed results for admins or post owners
        "details": analysis.fallacy_types if post.user_id == current_user.user_id or current_user.profile.is_admin else None
    }