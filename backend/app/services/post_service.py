# services/post_service.py
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.datamodels.post_datamodels import Post, PostInteraction, PostInteractionType, Tag
from app.schemas.post_schemas import PostCreate, PostInteractionCreate
from app.utils.response_utils import create_response, Response
from app.datamodels.post_datamodels import Category, Subcategory

# Post Services
async def create_post(db: Session, user_id: int, post: PostCreate) -> Response:
# Get Miscellaneous category if none provided
    if not post.category_id:
        misc_category = db.query(Category).filter(Category.cat_name == 'Miscellaneous').first()
        post.category_id = misc_category.category_id if misc_category else None

    db_post = Post(
        user_id=user_id,
        title=post.title,
        subtitle=post.subtitle,
        content=post.content,
        post_type_id=post.post_type_id,
        category_id=post.category_id,
        subcategory_id=post.subcategory_id,
        custom_subcategory=post.custom_subcategory,
        image_url=post.image_url,
        caption=post.caption,
        video_url=post.video_url,
        status='active'
    )

    # Handle tags
    if post.tags:
        for tag_name in post.tags:
            tag = db.query(Tag).filter_by(tag_name=tag_name).first()
            if not tag:
                tag = Tag(tag_name=tag_name)
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
                "tags": [tag.tag_name for tag in db_post.tags],
                "image_url": db_post.image_url,
                "caption": db_post.caption,
                "video_url": db_post.video_url
            }
        })
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database error: {str(e)}")  # Add this
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"Unexpected error: {str(e)}")  # Add this
        raise HTTPException(status_code=500, detail=str(e))

async def get_post(db: Session, post_id: int):
    post = db.query(Post).filter(Post.post_id == post_id, Post.status == 'active').first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return {
        "status": "success",
        "message": "Post retrieved successfully",
        "data": {
            "post": {
                "post_id": post.post_id,
                "title": post.title,
                "subtitle": post.subtitle,
                "content": post.content,
                "created_at": post.created_at,
                "updated_at": post.updated_at,
                "tags": [tag.tag_name for tag in post.tags] if post.tags else [],
                "user_id": post.user_id,
                "author_id": post.user_id,
                "image_url": post.image_url,
                "caption": post.caption,
                "video_url": post.video_url
            }
        }
    }

async def get_user_posts(db: Session, user_id: int, skip: int = 0, limit: int = 20) -> Response:
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
        "tags": [tag.tag_name for tag in post.tags],
        "user_id": post.user_id,
        "image_url": post.image_url,
        "caption": post.caption,
        "video_url": post.video_url
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
        "tags": [tag.tag_name for tag in post.tags] if post.tags else [],
        "image_url": post.image_url,
        "caption": post.caption,
        "video_url": post.video_url
    } for post in posts]

    return {
        "status": "success",
        "message": "Posts retrieved successfully",
        "data": {"posts": serialized_posts}
    }

async def delete_post(db: Session, post_id: int, user_id: int) -> Response:
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
async def create_post_interaction(db: Session, interaction: PostInteractionCreate) -> Response:
    interaction_type = db.query(PostInteractionType).filter_by(post_interaction_type_id=interaction.interaction_type_id).first()
    if not interaction_type:
        raise HTTPException(status_code=400, detail="Invalid interaction type")

    post_interaction = PostInteraction(
        user_id=interaction.user_id,
        post_id=interaction.post_id,
        post_interaction_type_id=interaction.interaction_type_id
    )

    # Prevent duplicate interactions
    existing_interaction = db.query(PostInteraction).filter_by(
        user_id=interaction.user_id,
        post_id=interaction.post_id,
        post_interaction_type_id=interaction.interaction_type_id
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