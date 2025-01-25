# routes/comment_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.utils.database_utils import get_db
from app.schemas.comment_schemas import CommentCreate, CommentInteractionCreate
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