from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.datamodels.post_datamodels import Post, PostInteraction
from app.schemas.post_schemas import PostMetricsUpdate


async def update_post_metrics(db: Session, post_id: int, user_id: int, metrics: PostMetricsUpdate):
    try:
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        metrics_dict = metrics.dict(exclude_unset=True)
        for key, value in metrics_dict.items():
            if hasattr(post, f"{key}_count"):
                setattr(post, f"{key}_count", getattr(post, f"{key}_count") + value)

        db.commit()
        return {"message": "Metrics updated successfully", "post": post}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


async def like_post(db: Session, post_id: int, user_id: int):
    try:
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        existing_interaction = db.query(PostInteraction).filter(
            PostInteraction.user_id == user_id,
            PostInteraction.post_id == post_id
        ).first()

        if existing_interaction and existing_interaction.liked:
            # Unlike
            existing_interaction.liked = False
            post.likes_count = max(0, post.likes_count - 1)
            message = "Post unliked successfully"
            liked = False
        else:
            # Like
            if existing_interaction:
                existing_interaction.liked = True
                existing_interaction.disliked = False
            else:
                interaction = PostInteraction(
                    user_id=user_id,
                    post_id=post_id,
                    liked=True
                )
                db.add(interaction)

            post.likes_count = (post.likes_count or 0) + 1
            if existing_interaction and existing_interaction.disliked:
                post.dislikes_count = max(0, post.dislikes_count - 1)

            message = "Post liked successfully"
            liked = True

        db.commit()
        return {
            "message": message,
            "liked": liked,
            "likes_count": post.likes_count,
            "dislikes_count": post.dislikes_count
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


async def dislike_post(db: Session, post_id: int, user_id: int):
    try:
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        existing_interaction = db.query(PostInteraction).filter(
            PostInteraction.user_id == user_id,
            PostInteraction.post_id == post_id
        ).first()

        if existing_interaction and existing_interaction.disliked:
            # Remove dislike
            existing_interaction.disliked = False
            post.dislikes_count = max(0, post.dislikes_count - 1)
            message = "Post un-disliked successfully"
            disliked = False
        else:
            # Dislike
            if existing_interaction:
                existing_interaction.disliked = True
                existing_interaction.liked = False
            else:
                interaction = PostInteraction(
                    user_id=user_id,
                    post_id=post_id,
                    disliked=True
                )
                db.add(interaction)

            post.dislikes_count = (post.dislikes_count or 0) + 1
            if existing_interaction and existing_interaction.liked:
                post.likes_count = max(0, post.likes_count - 1)

            message = "Post disliked successfully"
            disliked = True

        db.commit()
        return {
            "message": message,
            "disliked": disliked,
            "likes_count": post.likes_count,
            "dislikes_count": post.dislikes_count
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


async def save_post(db: Session, post_id: int, user_id: int):
    try:
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        existing_interaction = db.query(PostInteraction).filter(
            PostInteraction.user_id == user_id,
            PostInteraction.post_id == post_id
        ).first()

        if existing_interaction and existing_interaction.saved:
            # Unsave
            existing_interaction.saved = False
            post.saves_count = max(0, post.saves_count - 1)
            message = "Post unsaved successfully"
            saved = False
        else:
            # Save
            if existing_interaction:
                existing_interaction.saved = True
            else:
                interaction = PostInteraction(
                    user_id=user_id,
                    post_id=post_id,
                    saved=True
                )
                db.add(interaction)

            post.saves_count = (post.saves_count or 0) + 1
            message = "Post saved successfully"
            saved = True

        db.commit()
        return {
            "message": message,
            "saved": saved,
            "saves_count": post.saves_count
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


async def report_post(db: Session, post_id: int, user_id: int, reason: str):
    try:
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # Create report interaction
        interaction = PostInteraction(
            user_id=user_id,
            post_id=post_id,
            reported=True,
            report_reason=reason
        )
        db.add(interaction)

        # Increment report count
        post.reports_count = (post.reports_count or 0) + 1

        db.commit()
        return {
            "message": "Post reported successfully",
            "reports_count": post.reports_count
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


async def share_post(db: Session, post_id: int, user_id: int):
    try:
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # Create share interaction
        interaction = PostInteraction(
            user_id=user_id,
            post_id=post_id,
            shared=True
        )
        db.add(interaction)

        # Increment share count
        post.shares_count = (post.shares_count or 0) + 1

        db.commit()
        return {
            "message": "Post shared successfully",
            "shares_count": post.shares_count
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))