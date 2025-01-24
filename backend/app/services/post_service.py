from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.datamodels.datamodels import Post
from app.datamodels.schemas import PostCreate, PostUpdate
from typing import List
from app.utils.response_utils import create_response

async def create_post(db: Session, user_id: int, post: PostCreate) -> Post:
    db_post = Post(
        user_id=user_id,
        title=post.title,
        content=post.content
    )
    db.add(db_post)

    try:
        db.commit()
        db.refresh(db_post)
        return create_response("Post created successfully", {"post": db_post})
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create post")

async def get_user_posts(db: Session, user_id: int, skip: int = 0, limit: int = 20) -> List[Post]:
    posts = db.query(Post)\
        .filter(Post.user_id == user_id)\
        .filter(Post.status == 'active')\
        .offset(skip)\
        .limit(limit)\
        .all()
    return create_response("Posts retrieved successfully", {"posts": posts})

async def get_post(db: Session, post_id: int) -> Post:
    post = db.query(Post)\
        .filter(Post.post_id == post_id)\
        .filter(Post.status == 'active')\
        .first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return create_response("Post retrieved successfully", {"post": post})

async def update_post(db: Session, post_id: int, user_id: int, post_update: PostUpdate) -> Post:
    db_post = await get_post(db, post_id)

    if db_post.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")

    for field, value in post_update.dict(exclude_unset=True).items():
        setattr(db_post, field, value)

    try:
        db.commit()
        db.refresh(db_post)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update post")

    return db_post


async def delete_post(db: Session, post_id: int, user_id: int) -> bool:
    post = db.query(Post) \
        .filter(Post.post_id == post_id) \
        .filter(Post.user_id == user_id) \
        .first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    try:
        post.status = 'deleted'
        db.commit()
        return create_response("Post deleted successfully")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete post")

async def get_all_posts(db: Session, skip: int = 0, limit: int = 20) -> List[Post]:
    posts = db.query(Post)\
        .filter(Post.status == 'active')\
        .order_by(Post.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return create_response("Posts retrieved successfully", {"posts": posts})
