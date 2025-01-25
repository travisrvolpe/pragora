from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.datamodels.datamodels import Post, PostInteraction, InteractionType, Tag, Comment, CommentInteraction
from app.datamodels.schemas import PostCreate, PostUpdate, PostInteractionCreate, CommentCreate, CommentInteractionCreate
from typing import List
from app.utils.response_utils import create_response, ResponseType

# Post Services
async def create_post(db: Session, user_id: int, post: PostCreate) -> ResponseType:
    db_post = Post(
        user_id=user_id,
        title=post.title,
        subtitle=post.subtitle,
        content=post.content,
        post_type_id=post.post_type_id,
        category_id=post.category_id,
        subcategory_id=post.subcategory_id,
        custom_subcategory=post.custom_subcategory,
        status='active'
    )

    # Handle tags
    if post.tags:
        for tag_name in post.tags:
            tag = db.query(Tag).filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag)
            db_post.tags.append(tag)

    db.add(db_post)

    try:
        db.commit()
        db.refresh(db_post)
        return create_response("Post created successfully", {
            "post": {
                "post_id": db_post.post_id,
                "title": db_post.title,
                "subtitle": db_post.subtitle,
                "content": db_post.content,
                "created_at": db_post.created_at,
                "tags": [tag.name for tag in db_post.tags]
            }
        })
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create post")

async def get_user_posts(db: Session, user_id: int, skip: int = 0, limit: int = 20) -> ResponseType:
    posts = db.query(Post) \
        .filter(Post.user_id == user_id) \
        .filter(Post.status == 'active') \
        .offset(skip) \
        .limit(limit) \
        .all()

    serialized_posts = [{
        "post_id": post.post_id,
        "title": post.title,
        "subtitle": post.subtitle,
        "content": post.content,
        "created_at": post.created_at,
        "tags": [tag.name for tag in post.tags],
        "user_id": post.user_id
    } for post in posts]

    return create_response("Posts retrieved successfully", {"posts": serialized_posts})

async def get_all_posts(db: Session, skip: int = 0, limit: int = 20):
    posts = db.query(Post)\
        .filter(Post.status == 'active')\
        .order_by(Post.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

    serialized_posts = [{
        "post_id": post.post_id,
        "title": post.title,
        "content": post.content,
        "created_at": post.created_at,
        "user_id": post.user_id,
        "tags": [tag.name for tag in post.tags] if post.tags else []
    } for post in posts]

    return {
        "status": "success",
        "message": "Posts retrieved successfully",
        "data": {"posts": serialized_posts}
    }

async def delete_post(db: Session, post_id: int, user_id: int) -> ResponseType:
    post = db.query(Post)\
        .filter(Post.post_id == post_id)\
        .filter(Post.user_id == user_id)\
        .first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    try:
        post.status = 'deleted'
        db.commit()
        return create_response("Post deleted successfully", {})
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete post")

# Interaction Services
async def create_post_interaction(db: Session, interaction: PostInteractionCreate) -> ResponseType:
    interaction_type = db.query(InteractionType).filter_by(id=interaction.interaction_type_id).first()
    if not interaction_type:
        raise HTTPException(status_code=400, detail="Invalid interaction type")

    post_interaction = PostInteraction(
        user_id=interaction.user_id,
        post_id=interaction.post_id,
        interaction_type_id=interaction.interaction_type_id
    )

    # Prevent duplicate interactions
    existing_interaction = db.query(PostInteraction).filter_by(
        user_id=interaction.user_id,
        post_id=interaction.post_id,
        interaction_type_id=interaction.interaction_type_id
    ).first()

    if existing_interaction:
        return create_response("Interaction already exists", {})

    db.add(post_interaction)

    try:
        db.commit()
        return create_response("Post interaction created successfully", {})
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create post interaction")

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
    interaction_type = db.query(InteractionType).filter_by(id=interaction.interaction_type_id).first()
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
