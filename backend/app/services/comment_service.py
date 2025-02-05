# services/comment_service.py
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.datamodels.comment_datamodels import Comment
from app.datamodels.interaction_datamodels import CommentInteraction
from app.schemas.comment_schemas import CommentCreate, CommentInteractionCreate
from app.utils.response_utils import create_response, ResponseType
# In comment_service.py
from app.datamodels.comment_datamodels import Comment
from app.datamodels.interaction_datamodels import CommentInteraction, InteractionType

async def create_comment(db: Session, user_id: int, comment: CommentCreate) -> ResponseType:
    db_comment = Comment(
        user_id=user_id,
        post_id=comment.post_id,
        content=comment.content
    )
    db.add(db_comment)

    try:
        db.commit()
        db.refresh(db_comment)
        return create_response("Comment created successfully", {
            "comment": {
                "comment_id": db_comment.comment_id,
                "content": db_comment.content,
                "created_at": db_comment.created_at
            }
        })
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create comment")

async def create_comment_interaction(db: Session, interaction: CommentInteractionCreate) -> ResponseType:
    interaction_type = db.query(InteractionType).filter_by(interaction_type_id=interaction.interaction_type_id).first()
    if not interaction_type:
        raise HTTPException(status_code=400, detail="Invalid interaction type")

    comment_interaction = CommentInteraction(
        user_id=interaction.user_id,
        comment_id=interaction.comment_id,
        interaction_type_id=interaction.interaction_type_id
    )

    # Prevent duplicate interactions
    existing_interaction = db.query(CommentInteraction).filter_by(
        user_id=interaction.user_id,
        comment_id=interaction.comment_id,
        interaction_type_id=interaction.interaction_type_id
    ).first()

    if existing_interaction:
        return create_response("Interaction already exists", {})

    db.add(comment_interaction)

    try:
        db.commit()
        return create_response("Comment interaction created successfully", {})
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create comment interaction")

