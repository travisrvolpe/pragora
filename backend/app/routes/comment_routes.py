# routes/comment_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.utils.database_utils import get_db
from app.schemas.comment_schemas import CommentCreate, CommentInteractionCreate, CommentResponse
from app.services.comment_service import CommentService
from app.auth.utils import get_current_user

router = APIRouter(prefix="/posts", tags=["comments"])


@router.post("/{post_id}/comments", response_model=CommentResponse)
async def create_comment(
        post_id: int,
        comment_data: CommentCreate,
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db)
):
    try:
        print(f"Received comment data: {comment_data}")  # Debug line
        print(f"Post ID: {post_id}")  # Debug line
        print(f"Parent comment ID: {comment_data.parent_comment_id}")  # Debug line

        comment_service = CommentService(db)
        comment_data.post_id = post_id
        comment = await comment_service.create_comment(
            user_id=current_user.user_id,
            comment_data=comment_data
        )
        return comment
    except Exception as e:
        print(f"Error creating comment: {str(e)}")  # Debug line
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/comments/interactions", response_model=CommentResponse)
async def create_comment_interaction(
    interaction: CommentInteractionCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        comment_service = CommentService(db)
        interaction.user_id = current_user.user_id
        result = await comment_service.handle_interaction(
            comment_id=interaction.comment_id,
            user_id=current_user.user_id,
            interaction_type=interaction.interaction_type_id
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

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