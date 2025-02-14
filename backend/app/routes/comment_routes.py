# routes/comment_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.utils.database_utils import get_db
from app.schemas.comment_schemas import CommentCreate, CommentInteractionCreate, CommentInteractionResponse
from app.services.comment_service import CommentService
from app.services import comment_service
from app.auth.utils import get_current_user

router = APIRouter(prefix="/posts", tags=["comments"])

# Create a comment
@router.post("/{post_id}/comments", response_model=dict)
async def create_comment(
    post_id: int,
    comment: CommentCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comment.post_id = post_id
    return await comment_service.create_comment(db, current_user.user_id, comment)

# Create a comment interaction
@router.post("/comments/interactions", response_model=dict)
async def create_comment_interaction(
    interaction: CommentInteractionCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interaction.user_id = current_user.user_id
    return await comment_service.create_comment_interaction(db, interaction)

@router.post("/{comment_id}/like")
async def like_comment(
    comment_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interaction_service = CommentService(db)
    return await interaction_service.handle_interaction(
        comment_id=comment_id,
        user_id=current_user.user_id,
        interaction_type="like"
    )

@router.post("/{comment_id}/dislike")
async def dislike_comment(
    comment_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interaction_service = CommentService(db)
    return await interaction_service.handle_interaction(
        comment_id=comment_id,
        user_id=current_user.user_id,
        interaction_type="dislike"
    )

@router.post("/{comment_id}/report")
async def report_comment(
    comment_id: int,
    reason: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interaction_service = CommentService(db)
    return await interaction_service.handle_interaction(
        comment_id=comment_id,
        user_id=current_user.user_id,
        interaction_type="report",
        metadata={"reason": reason}
    )