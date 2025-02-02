# services/post_service.py
# are calculate_post_engagement and create_post_interaction and update_metrics correct?
# doe get_post and get_all_posts have the required columns? do they ahve redudant columns?
from fastapi import HTTPException, UploadFile, File, Path
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func, desc
from app.datamodels.datamodels import User, UserProfile
from app.datamodels.post_datamodels import Post, PostInteraction, PostInteractionType, Tag, PostType, PostAnalysis, PostEngagement, Category
from app.schemas.post_schemas import PostCreate, PostInteractionCreate, PostEngagementUpdate
from app.utils.response_utils import create_response, Response
from app.datamodels.post_datamodels import Category, Subcategory
import os
from core.config import settings
from datetime import datetime, timedelta
from typing import Optional, List
from werkzeug.utils import secure_filename

# Post Services
async def create_post(db: Session, user_id: int, post: PostCreate, files: Optional[list[UploadFile]] = None) -> dict:
    try:
        # Validate post type
        post_type = db.query(PostType).filter_by(post_type_id=post.post_type_id).first()
        if not post_type:
            raise HTTPException(status_code=400, detail="Invalid post type")

        # Get Miscellaneous category if none provided
        if not post.category_id:
            misc_category = db.query(Category).filter(Category.cat_name == 'Miscellaneous').first()
            post.category_id = misc_category.category_id if misc_category else None

        # Create post
        db_post = Post(
            user_id=user_id,
            title=post.title,
            subtitle=post.subtitle,
            content=post.content,
            summary=post.summary,
            post_type_id=post.post_type_id,
            category_id=post.category_id,
            subcategory_id=post.subcategory_id,
            custom_subcategory=post.custom_subcategory,
            image_url=post.image_url,
            images=post.images,
            video_url=post.video_url,
            video_metadata=post.video_metadata,
            audio_url=post.audio_url,
            document_url=post.document_url,
            embedded_content=post.embedded_content,
            link_preview=post.link_preview,
            visibility=post.visibility,
            is_pinned=post.is_pinned,
            is_draft=post.is_draft,
            parent_post_id=post.parent_post_id,
            status='active'
        )

        # Handle files if provided
        # Inside create_post function, replace the files handling block
        if files:
            try:
                # Create media directory if it doesn't exist
                media_dir = "./media/posts"
                os.makedirs(media_dir, exist_ok=True)

                # Store multiple image URLs
                image_urls = []

                for file in files:
                    if not file.filename:
                        continue

                    file_extension = file.filename.split(".")[-1].lower()
                    if file_extension not in {"png", "jpg", "jpeg", "gif", "webp"}:
                        continue

                    # Create unique filename
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    safe_filename = f"{timestamp}_{secure_filename(file.filename)}"
                    file_path = os.path.join(media_dir, safe_filename)

                    # Read and save file
                    contents = await file.read()
                    with open(file_path, "wb") as buffer:
                        buffer.write(contents)

                    # Add to image URLs
                    image_url = f"/media/posts/{safe_filename}"
                    image_urls.append(image_url)
                    print(f"Saved image to: {file_path}")
                    print(f"Image URL: {image_url}")

                # Store the first image URL in image_url field
                if image_urls:
                    db_post.image_url = image_urls[0]
                    db_post.images = image_urls

            except Exception as e:
                print(f"Error processing files: {str(e)}")
                raise HTTPException(status_code=500, detail="Error processing image files")

        db.add(db_post)
        db.commit()
        db.refresh(db_post)

        engagement = PostEngagement(
            post_id=db_post.post_id,
            unique_viewers=0,
            view_time_total=0,
            avg_view_duration=0.0,
            engagement_score=0.0
        )
        db.add(engagement)

        analysis = PostAnalysis(
            post_id=db_post.post_id,
            fallacy_score=0.0,
            evidence_score=0.0,
            bias_score=0.0,
            action_score=0.0
        )
        db.add(analysis)
        db.commit()

        return await get_post(db, db_post.post_id)

        # Return complete post data
        #eturn {
            #"status": "success",
            #"message": "Post created successfully",
            #"data": {
                #"post": {
                    #"post_id": db_post.post_id,
                    #"post_type_id": db_post.post_type_id,
                    #"user_id": db_post.user_id,
                    #"title": db_post.title,
                    #"subtitle": db_post.subtitle,
                    #"content": db_post.content,
                    #"image_url": db_post.image_url,
                    #"caption": db_post.caption,
                    #"video_url": db_post.video_url,
                    #"category_id": db_post.category_id,
                    #"subcategory_id": db_post.subcategory_id,
                    #"custom_subcategory": db_post.custom_subcategory,
                    #"created_at": db_post.created_at.isoformat(),
                    #"updated_at": db_post.updated_at.isoformat() if db_post.updated_at else None,
                    #"status": db_post.status,
                    #"likes_count": db_post.likes_count,
                    #"dislikes_count": db_post.dislikes_count,
                    #"saves_count": db_post.saves_count,
                    #"shares_count": db_post.shares_count,
                    #"comments_count": db_post.comments_count
                #}
            #}
        #}"""

    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")
    except Exception as e:
        db.rollback()
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Unexpected error")


async def get_post(db: Session, post_id: int) -> dict:
    post = db.query(Post).options(
        joinedload(Post.user).joinedload(User.profile)
    ).filter(Post.post_id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return {
        "status": "success",
        "message": "Post retrieved successfully",
        "data": {
            "post": {
                "post_id": post.post_id,
                "user_id": post.user_id,
                "username": post.user.profile.username,
                "avatar_img": post.user.profile.avatar_img,
                "reputation_score": post.user.profile.reputation_score,
                "reputation_cat": post.user.profile.reputation_cat,
                "expertise_area": post.user.profile.expertise_area,
                "worldview_ai": post.user.profile.worldview_ai,

                "title": post.title,
                "subtitle": post.subtitle,
                "content": post.content,
                "image_url": post.image_url,
                "images": post.images,
                "video_url": post.video_url,

                "post_type_id": post.post_type_id,
                "category_id": post.category_id,
                "subcategory_id": post.subcategory_id,
                "custom_subcategory": post.custom_subcategory,

                "visibility": post.visibility,
                "is_pinned": post.is_pinned,
                "is_draft": post.is_draft,
                "parent_post_id": post.parent_post_id,

                "status": post.status,
                "created_at": post.created_at,
                "updated_at": post.updated_at,

                "likes_count": post.likes_count,
                "dislikes_count": post.dislikes_count,
                "saves_count": post.saves_count,
                "shares_count": post.shares_count,
                "comments_count": post.comments_count,
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

async def get_all_posts(db: Session, skip: int = 0, limit: int = 20, category_id: Optional[int] = None, tab: Optional[str] = None):
    """Get all posts with optional filtering"""
    query = db.query(Post).options(
        joinedload(Post.user).joinedload(User.profile),
        joinedload(Post.post_type),
        joinedload(Post.tags)
    ).filter(Post.status == 'active')

    if category_id:
        query = query.filter(Post.category_id == category_id)

    if tab == "trending":
        try:
            query = query.join(PostEngagement).order_by(PostEngagement.engagement_score.desc())
        except:
            # Fallback to regular sorting if engagement table isn't ready
            query = query.order_by(Post.created_at.desc())
    else:
        query = query.order_by(Post.created_at.desc())

    posts = query.offset(skip).limit(limit).all()

    serialized_posts = [{
        "post_id": post.post_id,
        "title": post.title,
        "content": post.content,
        "created_at": post.created_at,
        "user_id": post.user_id,
        "username": post.user.profile.username if post.user and post.user.profile else None,
        "avatar_img": post.user.profile.avatar_img if post.user and post.user.profile else None,
        "reputation_score": post.user.profile.reputation_score if post.user and post.user.profile else None,
        "reputation_cat": post.user.profile.reputation_cat if post.user and post.user.profile else None,
        "expertise_area": post.user.profile.expertise_area if post.user and post.user.profile else None,
        "tags": [tag.tag_name for tag in post.tags] if post.tags else [],
        "image_url": post.image_url,
        "images": post.images,
        "video_url": post.video_url,
        "post_type_id": post.post_type_id,
        "post_type": post.post_type.post_type_name if post.post_type else None,
        "category_id": post.category_id,
        "subcategory_id": post.subcategory_id,
        "custom_subcategory": post.custom_subcategory,
        "likes_count": post.likes_count,
        "dislikes_count": post.dislikes_count,
        "comments_count": post.comments_count,
        "saves_count": post.saves_count,
        "shares_count": post.shares_count,
        "status": post.status,
        "created_at": post.created_at,
        "updated_at": post.updated_at
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

async def upload_post_image(file: UploadFile, post_id: int, db: Session):
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
    file_extension = file.filename.split(".")[-1].lower()

    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # Save the file locally
    save_path = f"./media/posts/{post_id}.{file_extension}"
    with open(save_path, "wb") as buffer:
        buffer.write(await file.read())

    # Update the post in the database
    post = db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.image_url = save_path
    db.commit()
    db.refresh(post)

    return {"message": "Image uploaded successfully", "image_url": save_path}


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

async def update_post_metrics(db: Session, post_id: int, metrics: dict):
    post = db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    for key, value in metrics.items():
        if hasattr(post, key):
            setattr(post, key, getattr(post, key) + value)
        else:
            raise HTTPException(status_code=400, detail=f"Invalid metric: {key}")

    db.commit()
    db.refresh(post)
    return {"message": "Metrics updated", "updated_post": post}

async def save_post(db: Session, user_id: int, post_id: int):
    user = db.query(User).filter(User.user_id == user_id).first()
    post = db.query(Post).filter(Post.post_id == post_id).first()

    if not user or not post:
        raise HTTPException(status_code=404, detail="User or Post not found")

    if post in user.saved_posts:
        raise HTTPException(status_code=400, detail="Post already saved")

    user.saved_posts.append(post)
    db.commit()
    return {"message": "Post saved successfully"}

async def get_saved_posts(db: Session, user_id: int):
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"saved_posts": [post.post_id for post in user.saved_posts]}


async def calculate_post_engagement(post_id: int, db: Session) -> None:
    """Calculate engagement metrics for a post"""
    engagement = db.query(PostEngagement).filter(
        PostEngagement.post_id == post_id
    ).first()

    if not engagement:
        return

    # Calculate metrics
    total_views = engagement.unique_viewers or 0
    avg_duration = engagement.avg_view_duration or 0
    completion_rate = engagement.completion_rate or 0
    bounce_rate = engagement.bounce_rate or 0

    # Calculate engagement score (customize formula as needed)
    engagement_score = (
            (total_views * 0.3) +
            (avg_duration * 0.3) +
            (completion_rate * 0.2) +
            ((1 - bounce_rate) * 0.2)
    )

    engagement.engagement_score = engagement_score
    engagement.last_calculated = datetime.utcnow()
    db.commit()


async def get_trending_posts(timeframe: str, db: Session, limit: int = 20) -> List[dict]:
    """Get trending posts based on engagement and interaction metrics"""
    # Calculate time window
    now = datetime.utcnow()
    if timeframe == "day":
        start_time = now - timedelta(days=1)
    elif timeframe == "week":
        start_time = now - timedelta(weeks=1)
    elif timeframe == "month":
        start_time = now - timedelta(days=30)
    else:
        start_time = now - timedelta(days=7)  # Default to week

    trending_posts = db.query(Post).join(
        PostEngagement
    ).filter(
        Post.created_at >= start_time,
        Post.status == 'active'
    ).order_by(
        desc(PostEngagement.engagement_score)
    ).limit(limit).all()

    return [await get_post(db, post.post_id) for post in trending_posts]


async def get_recommended_posts(user_id: int, db: Session, limit: int = 20) -> List[dict]:
    """Get personalized post recommendations for a user"""
    # Get user's interests and interaction history
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get posts from categories the user has interacted with
    recommended_posts = db.query(Post).join(
        PostInteraction,
        PostInteraction.post_id == Post.post_id
    ).filter(
        PostInteraction.user_id == user_id
    ).order_by(
        desc(Post.created_at)
    ).limit(limit).all()

    return [await get_post(db, post.post_id) for post in recommended_posts]


async def mark_post_as_read(user_id: int, post_id: int, db: Session) -> dict:
    """Mark a post as read by a user"""
    # Create or update post interaction
    interaction = PostInteraction(
        user_id=user_id,
        post_id=post_id,
        post_interaction_type_id=1  # Assuming 1 is for "read"
    )
    db.add(interaction)
    db.commit()
    return {"status": "success", "message": "Post marked as read"}


async def track_post_view(user_id: int, post_id: int, db: Session) -> dict:
    """Track a post view including engagement metrics"""
    engagement = db.query(PostEngagement).filter(
        PostEngagement.post_id == post_id
    ).first()

    if not engagement:
        engagement = PostEngagement(post_id=post_id)
        db.add(engagement)

    engagement.unique_viewers = (engagement.unique_viewers or 0) + 1
    engagement.view_time_total = (engagement.view_time_total or 0) + 1

    await calculate_post_engagement(post_id, db)

    return {"status": "success", "message": "View tracked successfully"}